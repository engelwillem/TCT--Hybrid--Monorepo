param(
  [string]$SshHost = "209.42.27.90",
  [string]$SshUser = "thechoosentalks",
  [string]$SshKeyPath = "$env:USERPROFILE/.ssh/cpanel_laptop_deploy",
  [string]$RemoteAppPath = "/home/thechoosentalks/deploy/apps/thechoosentalks/current",
  [string]$LocalMariaContainer = "tct-mariadb",
  [string]$LocalDbName = "thechoosentalks",
  [string]$LocalDbRootUser = "root",
  [string]$LocalDbRootPassword = "root",
  [string]$BackupDir = "backups/db-parity",
  [string[]]$VerifyTables = @("users", "bible_verses", "member_posts", "channels", "verse_relationships", "study_paths"),
  [int]$MaxAttempts = 8,
  [int]$InitialBackoffSeconds = 5,
  [int]$MaxBackoffSeconds = 90,
  [switch]$KeepRemoteDump,
  [switch]$Help
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

function Write-Step {
  param([string]$Message)
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Assert-Command {
  param([string]$Name)
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Required command not found: $Name"
  }
}

function Assert-PathExists {
  param([string]$Path, [string]$Label)
  if (-not (Test-Path -LiteralPath $Path)) {
    throw "$Label not found: $Path"
  }
}

function Escape-ForSingleQuoteBash {
  param([string]$Value)
  return $Value -replace "'", "'`"`"'"
}

function Invoke-WithRetry {
  param(
    [scriptblock]$Action,
    [string]$Operation,
    [int]$Attempts = $MaxAttempts
  )

  $delay = [Math]::Max(1, $InitialBackoffSeconds)
  for ($attempt = 1; $attempt -le $Attempts; $attempt++) {
    try {
      & $Action
      return
    } catch {
      if ($attempt -ge $Attempts) {
        throw "$Operation failed after $Attempts attempts. Last error: $($_.Exception.Message)"
      }
      Write-Warning "$Operation failed (attempt $attempt/$Attempts): $($_.Exception.Message)"
      Write-Host "   Retrying in $delay seconds..." -ForegroundColor DarkGray
      Start-Sleep -Seconds $delay
      $delay = [Math]::Min($delay * 2, [Math]::Max($delay, $MaxBackoffSeconds))
    }
  }
}

function Invoke-SshScript {
  param(
    [string]$Script,
    [string[]]$Args,
    [string]$Operation
  )

  $normalized = $Script.Replace("`r", "")
  $output = $normalized | & ssh @Args "$SshUser@$SshHost" "tr -d '\r' | bash -s" 2>&1
  if ($LASTEXITCODE -ne 0) {
    $summary = ($output | Select-Object -Last 5) -join [Environment]::NewLine
    throw "$Operation failed. $summary"
  }
  return $output
}

function Invoke-SshCommand {
  param(
    [string]$Command,
    [string[]]$Args,
    [string]$Operation
  )

  $output = & ssh @Args "$SshUser@$SshHost" $Command 2>&1
  if ($LASTEXITCODE -ne 0) {
    $summary = ($output | Select-Object -Last 5) -join [Environment]::NewLine
    throw "$Operation failed. $summary"
  }
  return $output
}

function Get-RemoteFileSize {
  param(
    [string]$RemotePath,
    [string[]]$Args
  )

  $escaped = Escape-ForSingleQuoteBash -Value $RemotePath
  $out = Invoke-SshCommand -Args $Args -Operation "Read remote dump size" -Command "bash -lc ""stat -c%s '$escaped'"""
  $line = [string]($out | Select-Object -Last 1)
  $size = 0L
  if (-not [Int64]::TryParse($line.Trim(), [ref]$size)) {
    throw "Unable to parse remote file size from output: $line"
  }
  return $size
}

function Download-RemoteFileResumable {
  param(
    [string]$RemotePath,
    [string]$LocalPath,
    [string]$KeyPath
  )

  $remoteSize = Get-RemoteFileSize -RemotePath $RemotePath -Args $sshArgs
  if ($remoteSize -le 0) {
    throw "Remote dump file is empty: $RemotePath"
  }

  Write-Step "Downloading dump with resume support (target size: $remoteSize bytes)"

  Invoke-WithRetry -Operation "Resumable download via SFTP" -Action {
    $localSize = if (Test-Path -LiteralPath $LocalPath) { (Get-Item -LiteralPath $LocalPath).Length } else { 0L }
    if ($localSize -gt $remoteSize) {
      Remove-Item -LiteralPath $LocalPath -Force
      $localSize = 0L
    }

    Write-Host ("   Existing local size: {0} bytes" -f $localSize) -ForegroundColor DarkGray

    $batchPath = Join-Path $env:TEMP ("tct-sftp-reget-{0}-{1}.txt" -f (Get-Date -Format "yyyyMMddHHmmss"), (Get-Random))
    @(
      "reget $RemotePath $LocalPath"
      "quit"
    ) | Set-Content -LiteralPath $batchPath -Encoding ascii

    try {
      & sftp -b $batchPath -i $KeyPath -o StrictHostKeyChecking=accept-new -o ConnectTimeout=30 "$SshUser@$SshHost" 2>&1 | Out-Host
      if ($LASTEXITCODE -ne 0) {
        throw "sftp exited with code $LASTEXITCODE"
      }
    } finally {
      Remove-Item -LiteralPath $batchPath -Force -ErrorAction SilentlyContinue
    }

    if (-not (Test-Path -LiteralPath $LocalPath)) {
      throw "Local dump file not found after SFTP transfer."
    }

    $finalSize = (Get-Item -LiteralPath $LocalPath).Length
    if ($finalSize -lt $remoteSize) {
      throw "Partial dump downloaded ($finalSize / $remoteSize bytes)."
    }
    if ($finalSize -gt $remoteSize) {
      throw "Downloaded file is larger than remote file ($finalSize / $remoteSize bytes)."
    }
  }
}

function New-SqlCountQuery {
  param([string[]]$Tables)

  if ($Tables.Count -eq 0) {
    throw "VerifyTables cannot be empty."
  }

  $parts = @()
  foreach ($table in $Tables) {
    if ([string]::IsNullOrWhiteSpace($table)) { continue }
    $parts += "SELECT '$table' AS table_name, COUNT(*) AS row_count FROM ``$table``"
  }

  if ($parts.Count -eq 0) {
    throw "VerifyTables contains no valid table names."
  }

  return ($parts -join " UNION ALL ")
}

function Parse-CountLines {
  param([string[]]$Lines)

  $result = @{}
  foreach ($line in $Lines) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    $cols = $line -split "`t"
    if ($cols.Count -lt 2) { continue }
    $name = $cols[0].Trim()
    $count = [int64]$cols[1].Trim()
    $result[$name] = $count
  }
  return $result
}

if ($Help) {
  Write-Output @'
Usage:
  pwsh -File scripts/db-sync-prod-to-local-resilient.ps1

Optional examples:
  pwsh -File scripts/db-sync-prod-to-local-resilient.ps1 -MaxAttempts 10 -InitialBackoffSeconds 5
  pwsh -File scripts/db-sync-prod-to-local-resilient.ps1 -KeepRemoteDump
'@
  exit 0
}

Assert-Command -Name "docker"
Assert-Command -Name "ssh"
Assert-Command -Name "sftp"

$resolvedKeyPath = (Resolve-Path -LiteralPath $SshKeyPath).Path
Assert-PathExists -Path $resolvedKeyPath -Label "SSH key"

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Join-Path (Get-Location) $BackupDir
New-Item -ItemType Directory -Force -Path $backupRoot | Out-Null

$localBackupPath = Join-Path $backupRoot "local-before-sync-$timestamp.sql"
$prodDumpLocalPath = Join-Path $backupRoot "prod-sync-$timestamp.sql"
$remoteDumpPath = "/tmp/prod-sync-$timestamp.sql"

$sshArgs = @("-i", $resolvedKeyPath, "-o", "StrictHostKeyChecking=accept-new", "-o", "ConnectTimeout=30")

Write-Step "Checking local MariaDB container '$LocalMariaContainer'"
$containerCheck = & docker inspect --format "{{.State.Running}}" $LocalMariaContainer 2>$null
if ($LASTEXITCODE -ne 0 -or ($containerCheck | Select-Object -First 1) -ne "true") {
  throw "Container '$LocalMariaContainer' is not running. Start Docker Compose first."
}

Write-Step "Creating local rollback backup"
& docker exec $LocalMariaContainer mariadb-dump "-u$LocalDbRootUser" "-p$LocalDbRootPassword" --single-transaction --quick $LocalDbName > $localBackupPath
if ($LASTEXITCODE -ne 0) {
  throw "Local backup failed."
}

$appEsc = Escape-ForSingleQuoteBash -Value $RemoteAppPath
$dumpEsc = Escape-ForSingleQuoteBash -Value $remoteDumpPath
$remoteDumpTemplate = @'
set -euo pipefail
APP_PATH='__APP_PATH__'
DUMP_PATH='__DUMP_PATH__'
TMP_PATH="${DUMP_PATH}.part"
if [ -s "$DUMP_PATH" ]; then
  echo "DUMP_EXISTS"
  exit 0
fi
cd "$APP_PATH"
DB_HOST="$(grep '^DB_HOST=' .env | cut -d= -f2-)"
DB_PORT="$(grep '^DB_PORT=' .env | cut -d= -f2-)"
DB_DATABASE="$(grep '^DB_DATABASE=' .env | cut -d= -f2-)"
DB_USERNAME="$(grep '^DB_USERNAME=' .env | cut -d= -f2-)"
DB_PASSWORD="$(grep '^DB_PASSWORD=' .env | cut -d= -f2-)"
rm -f "$TMP_PATH"
/usr/bin/mariadb-dump -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE" --single-transaction --quick --routines --triggers --events > "$TMP_PATH"
mv "$TMP_PATH" "$DUMP_PATH"
test -s "$DUMP_PATH"
echo "DUMP_READY"
'@
$remoteDumpScript = $remoteDumpTemplate.Replace('__APP_PATH__', $appEsc).Replace('__DUMP_PATH__', $dumpEsc)

Write-Step "Creating production dump with retry + exponential backoff"
Invoke-WithRetry -Operation "Remote production dump" -Action {
  Invoke-SshScript -Script $remoteDumpScript -Args $sshArgs -Operation "Remote dump"
}

Download-RemoteFileResumable -RemotePath $remoteDumpPath -LocalPath $prodDumpLocalPath -KeyPath $resolvedKeyPath

if (-not $KeepRemoteDump) {
  Write-Step "Removing temporary dump from remote host"
  Invoke-WithRetry -Operation "Remote cleanup dump file" -Action {
    Invoke-SshCommand -Args $sshArgs -Operation "Remote cleanup" -Command "bash -lc ""rm -f '$dumpEsc' '$dumpEsc.part'"""
  }
}

Write-Step "Recreating local database before import"
& docker exec $LocalMariaContainer mariadb "-u$LocalDbRootUser" "-p$LocalDbRootPassword" -e "DROP DATABASE IF EXISTS $LocalDbName; CREATE DATABASE $LocalDbName CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if ($LASTEXITCODE -ne 0) {
  throw "Failed to recreate local database."
}

Write-Step "Importing production dump into local Docker MariaDB"
& docker cp $prodDumpLocalPath "${LocalMariaContainer}:/tmp/prod-sync.sql"
if ($LASTEXITCODE -ne 0) {
  throw "Failed to copy dump into MariaDB container."
}

& docker exec $LocalMariaContainer sh -lc "mariadb --binary-mode=1 -u$LocalDbRootUser -p$LocalDbRootPassword $LocalDbName < /tmp/prod-sync.sql"
if ($LASTEXITCODE -ne 0) {
  throw "Failed to import production dump into local DB."
}

Write-Step "Verifying parity counts (production vs local)"
$sql = New-SqlCountQuery -Tables $VerifyTables

$localLines = & docker exec $LocalMariaContainer mariadb -N -B "-u$LocalDbRootUser" "-p$LocalDbRootPassword" $LocalDbName -e $sql
if ($LASTEXITCODE -ne 0) {
  throw "Failed to query local verification counts."
}
$localMap = Parse-CountLines -Lines $localLines

$sqlBase64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($sql))
$prodCountTemplate = @'
set -euo pipefail
APP_PATH='__APP_PATH__'
SQL_B64='__SQL_B64__'
cd "$APP_PATH"
DB_HOST="$(grep '^DB_HOST=' .env | cut -d= -f2-)"
DB_PORT="$(grep '^DB_PORT=' .env | cut -d= -f2-)"
DB_DATABASE="$(grep '^DB_DATABASE=' .env | cut -d= -f2-)"
DB_USERNAME="$(grep '^DB_USERNAME=' .env | cut -d= -f2-)"
DB_PASSWORD="$(grep '^DB_PASSWORD=' .env | cut -d= -f2-)"
SQL="$(printf '%s' "$SQL_B64" | base64 -d)"
mariadb -N -B -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE" -e "$SQL"
'@
$prodCountScript = $prodCountTemplate.Replace('__APP_PATH__', $appEsc).Replace('__SQL_B64__', $sqlBase64)

$prodLines = $null
Invoke-WithRetry -Operation "Production verification query" -Action {
  $script:prodLines = Invoke-SshScript -Script $prodCountScript -Args $sshArgs -Operation "Production counts query"
}

$prodMap = Parse-CountLines -Lines $prodLines

$mismatches = @()
foreach ($table in $VerifyTables) {
  $localCount = if ($localMap.ContainsKey($table)) { $localMap[$table] } else { -1 }
  $prodCount = if ($prodMap.ContainsKey($table)) { $prodMap[$table] } else { -1 }

  $status = if ($localCount -eq $prodCount) { "MATCH" } else { "DIFF" }
  Write-Host ("{0,-22} local={1,-10} prod={2,-10} {3}" -f $table, $localCount, $prodCount, $status)

  if ($localCount -ne $prodCount) {
    $mismatches += $table
  }
}

Write-Host ""
Write-Host "Local backup: $localBackupPath" -ForegroundColor DarkGray
Write-Host "Prod dump   : $prodDumpLocalPath" -ForegroundColor DarkGray

if ($mismatches.Count -gt 0) {
  throw "Parity verification failed for tables: $($mismatches -join ', ')"
}

Write-Host "DB parity sync completed successfully (resilient mode)." -ForegroundColor Green

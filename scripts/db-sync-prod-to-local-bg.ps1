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
  [int]$PollIntervalSeconds = 20,
  [int]$PollTimeoutMinutes = 120,
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

function Invoke-SshCommand {
  param(
    [string]$Command,
    [string[]]$Args,
    [string]$Operation
  )

  $output = & ssh @Args "$SshUser@$SshHost" $Command 2>&1
  if ($LASTEXITCODE -ne 0) {
    $summary = ($output | Select-Object -Last 8) -join [Environment]::NewLine
    throw "$Operation failed. $summary"
  }
  return $output
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
  pwsh -File scripts/db-sync-prod-to-local-bg.ps1

Optional examples:
  pwsh -File scripts/db-sync-prod-to-local-bg.ps1 -MaxAttempts 12 -PollTimeoutMinutes 180
  pwsh -File scripts/db-sync-prod-to-local-bg.ps1 -KeepRemoteDump
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
$remotePartPath = "$remoteDumpPath.part"
$remoteStatusPath = "/tmp/prod-sync-$timestamp.status"
$remoteLogPath = "/tmp/prod-sync-$timestamp.log"
$remotePidPath = "/tmp/prod-sync-$timestamp.pid"

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
$partEsc = Escape-ForSingleQuoteBash -Value $remotePartPath
$statusEsc = Escape-ForSingleQuoteBash -Value $remoteStatusPath
$logEsc = Escape-ForSingleQuoteBash -Value $remoteLogPath
$pidEsc = Escape-ForSingleQuoteBash -Value $remotePidPath

Write-Step "Starting remote background dump job over SSH"
$startTemplate = @'
bash -lc '
set -euo pipefail
APP_PATH='"'"'__APP_PATH__'"'"'
DUMP_PATH='"'"'__DUMP_PATH__'"'"'
PART_PATH='"'"'__PART_PATH__'"'"'
STATUS_PATH='"'"'__STATUS_PATH__'"'"'
LOG_PATH='"'"'__LOG_PATH__'"'"'
PID_PATH='"'"'__PID_PATH__'"'"'

if [ -f "$PID_PATH" ]; then
  OLD_PID="$(cat "$PID_PATH" 2>/dev/null || true)"
  if [ -n "$OLD_PID" ] && kill -0 "$OLD_PID" 2>/dev/null; then
    echo "JOB_ALREADY_RUNNING:$OLD_PID"
    exit 0
  fi
fi

rm -f "$STATUS_PATH"

nohup bash -lc "
  set -euo pipefail
  cd \"$APP_PATH\"
  DB_HOST=\"\$(grep '\''^DB_HOST='\'' .env | cut -d= -f2-)\"
  DB_PORT=\"\$(grep '\''^DB_PORT='\'' .env | cut -d= -f2-)\"
  DB_DATABASE=\"\$(grep '\''^DB_DATABASE='\'' .env | cut -d= -f2-)\"
  DB_USERNAME=\"\$(grep '\''^DB_USERNAME='\'' .env | cut -d= -f2-)\"
  DB_PASSWORD=\"\$(grep '\''^DB_PASSWORD='\'' .env | cut -d= -f2-)\"
  rm -f \"$PART_PATH\"
  /usr/bin/mariadb-dump -h\"\$DB_HOST\" -P\"\$DB_PORT\" -u\"\$DB_USERNAME\" -p\"\$DB_PASSWORD\" \"\$DB_DATABASE\" --single-transaction --quick --routines --triggers --events > \"$PART_PATH\"
  mv \"$PART_PATH\" \"$DUMP_PATH\"
  stat -c%s \"$DUMP_PATH\"
  echo done > \"$STATUS_PATH\"
" > \"$LOG_PATH\" 2>&1 &

echo $! > "$PID_PATH"
echo "JOB_STARTED:$(cat "$PID_PATH")"
'
'@
$startCommand = $startTemplate.Replace('__APP_PATH__', $appEsc).
  Replace('__DUMP_PATH__', $dumpEsc).
  Replace('__PART_PATH__', $partEsc).
  Replace('__STATUS_PATH__', $statusEsc).
  Replace('__LOG_PATH__', $logEsc).
  Replace('__PID_PATH__', $pidEsc).
  Replace("`r", "")

Invoke-WithRetry -Operation "Start remote dump job" -Action {
  $null = Invoke-SshCommand -Args $sshArgs -Operation "Remote dump start" -Command $startCommand
}

Write-Step "Polling remote dump status"
$pollDeadline = (Get-Date).AddMinutes($PollTimeoutMinutes)
$lastProgressBytes = -1L
$unchangedTicks = 0

while ($true) {
  if ((Get-Date) -gt $pollDeadline) {
    throw "Remote dump polling exceeded timeout ($PollTimeoutMinutes minutes)."
  }

  $pollTemplate = @'
bash -lc '
set -euo pipefail
DUMP_PATH='"'"'__DUMP_PATH__'"'"'
PART_PATH='"'"'__PART_PATH__'"'"'
STATUS_PATH='"'"'__STATUS_PATH__'"'"'
LOG_PATH='"'"'__LOG_PATH__'"'"'
PID_PATH='"'"'__PID_PATH__'"'"'

status="running"
if [ -f "$STATUS_PATH" ]; then
  status="$(cat "$STATUS_PATH" 2>/dev/null || echo done)"
fi

pid=""
running="0"
if [ -f "$PID_PATH" ]; then
  pid="$(cat "$PID_PATH" 2>/dev/null || true)"
  if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
    running="1"
  fi
fi

dump_size="0"
part_size="0"
if [ -f "$DUMP_PATH" ]; then dump_size="$(stat -c%s "$DUMP_PATH" 2>/dev/null || echo 0)"; fi
if [ -f "$PART_PATH" ]; then part_size="$(stat -c%s "$PART_PATH" 2>/dev/null || echo 0)"; fi

log_tail="$(tail -n 1 "$LOG_PATH" 2>/dev/null || true)"
printf "status=%s\npid=%s\nrunning=%s\ndump_size=%s\npart_size=%s\nlog_tail=%s\n" "$status" "$pid" "$running" "$dump_size" "$part_size" "$log_tail"
'
'@
  $pollCommand = $pollTemplate.Replace('__DUMP_PATH__', $dumpEsc).
    Replace('__PART_PATH__', $partEsc).
    Replace('__STATUS_PATH__', $statusEsc).
    Replace('__LOG_PATH__', $logEsc).
    Replace('__PID_PATH__', $pidEsc).
    Replace("`r", "")

  $pollOut = $null
  Invoke-WithRetry -Operation "Poll remote dump status" -Action {
    $script:pollOut = Invoke-SshCommand -Args $sshArgs -Operation "Remote dump poll" -Command $pollCommand
  }

  $map = @{}
  foreach ($line in $pollOut) {
    if ($line -match "^(?<k>[^=]+)=(?<v>.*)$") {
      $map[$Matches.k.Trim()] = $Matches.v.Trim()
    }
  }

  $status = [string]($map["status"] ?? "running")
  $running = [string]($map["running"] ?? "0")
  $dumpSize = 0L
  $partSize = 0L
  [void][Int64]::TryParse([string]($map["dump_size"] ?? "0"), [ref]$dumpSize)
  [void][Int64]::TryParse([string]($map["part_size"] ?? "0"), [ref]$partSize)
  $activeSize = if ($dumpSize -gt 0) { $dumpSize } else { $partSize }

  if ($activeSize -eq $lastProgressBytes) {
    $unchangedTicks += 1
  } else {
    $unchangedTicks = 0
    $lastProgressBytes = $activeSize
  }

  Write-Host ("   status={0} running={1} dump={2} part={3}" -f $status, $running, $dumpSize, $partSize) -ForegroundColor DarkGray

  if ($status -eq "done" -and $dumpSize -gt 0) {
    break
  }

  if ($running -eq "0" -and $status -ne "done") {
    throw "Remote dump process exited before completion. Check remote log: $remoteLogPath"
  }

  Start-Sleep -Seconds $PollIntervalSeconds
}

Write-Step "Downloading dump with resume support (SFTP reget)"
$downloadAttempts = [Math]::Max(3, $MaxAttempts)
$remoteSizeOut = Invoke-WithRetry -Operation "Read remote dump size" -Attempts $downloadAttempts -Action {
  $script:sizeOut = Invoke-SshCommand -Args $sshArgs -Operation "Read remote dump size" -Command "bash -lc ""stat -c%s '$dumpEsc'"""
}
$remoteSize = 0L
[void][Int64]::TryParse(([string]($sizeOut | Select-Object -Last 1)).Trim(), [ref]$remoteSize)
if ($remoteSize -le 0) {
  throw "Remote dump file is empty."
}

Invoke-WithRetry -Operation "Resumable SFTP download" -Attempts $downloadAttempts -Action {
  $existingSize = if (Test-Path -LiteralPath $prodDumpLocalPath) { (Get-Item -LiteralPath $prodDumpLocalPath).Length } else { 0L }
  if ($existingSize -gt $remoteSize) {
    Remove-Item -LiteralPath $prodDumpLocalPath -Force
    $existingSize = 0L
  }
  Write-Host ("   local={0} bytes, remote={1} bytes" -f $existingSize, $remoteSize) -ForegroundColor DarkGray

  $batchPath = Join-Path $env:TEMP ("tct-sftp-reget-{0}-{1}.txt" -f (Get-Date -Format "yyyyMMddHHmmss"), (Get-Random))
  @(
    "reget $remoteDumpPath $prodDumpLocalPath"
    "quit"
  ) | Set-Content -LiteralPath $batchPath -Encoding ascii

  try {
    & sftp -b $batchPath -i $resolvedKeyPath -o StrictHostKeyChecking=accept-new -o ConnectTimeout=30 "$SshUser@$SshHost" 2>&1 | Out-Host
    if ($LASTEXITCODE -ne 0) {
      throw "sftp exited with code $LASTEXITCODE"
    }
  } finally {
    Remove-Item -LiteralPath $batchPath -Force -ErrorAction SilentlyContinue
  }

  if (-not (Test-Path -LiteralPath $prodDumpLocalPath)) {
    throw "Downloaded file missing."
  }
  $localFinal = (Get-Item -LiteralPath $prodDumpLocalPath).Length
  if ($localFinal -lt $remoteSize) {
    throw "Downloaded file partial ($localFinal/$remoteSize bytes)."
  }
  if ($localFinal -gt $remoteSize) {
    throw "Downloaded file larger than remote ($localFinal/$remoteSize bytes)."
  }
}

if (-not $KeepRemoteDump) {
  Write-Step "Cleaning up remote temporary files"
  $cleanupCommand = "bash -lc ""rm -f '$dumpEsc' '$partEsc' '$statusEsc' '$logEsc' '$pidEsc'"""
  Invoke-WithRetry -Operation "Remote cleanup" -Action {
    $null = Invoke-SshCommand -Args $sshArgs -Operation "Remote cleanup" -Command $cleanupCommand
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
bash -lc '
set -euo pipefail
APP_PATH='"'"'__APP_PATH__'"'"'
SQL_B64='"'"'__SQL_B64__'"'"'
cd "$APP_PATH"
DB_HOST="$(grep '^DB_HOST=' .env | cut -d= -f2-)"
DB_PORT="$(grep '^DB_PORT=' .env | cut -d= -f2-)"
DB_DATABASE="$(grep '^DB_DATABASE=' .env | cut -d= -f2-)"
DB_USERNAME="$(grep '^DB_USERNAME=' .env | cut -d= -f2-)"
DB_PASSWORD="$(grep '^DB_PASSWORD=' .env | cut -d= -f2-)"
SQL="$(printf '%s' "$SQL_B64" | base64 -d)"
mariadb -N -B -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE" -e "$SQL"
'
'@
$prodCountCommand = $prodCountTemplate.Replace('__APP_PATH__', $appEsc).Replace('__SQL_B64__', $sqlBase64).Replace("`r", "")

$prodLines = $null
Invoke-WithRetry -Operation "Production verification query" -Action {
  $script:prodLines = Invoke-SshCommand -Args $sshArgs -Operation "Production counts query" -Command $prodCountCommand
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

Write-Host "DB parity sync completed successfully (background SSH mode)." -ForegroundColor Green

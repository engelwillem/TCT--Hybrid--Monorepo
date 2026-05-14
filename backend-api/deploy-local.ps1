$ErrorActionPreference = "Stop"

$HostName = "209.42.27.90"
$Port = 22
$User = "thechoosentalks"
$KeyPath = "$HOME\.ssh\cpanel_laptop_deploy"
$DeployPath = "/home/thechoosentalks/deploy/apps/thechoosentalks"
$RetryCount = 10
$RetryDelaySeconds = 5
$SshOptions = @(
    "-o", "StrictHostKeyChecking=accept-new",
    "-o", "ServerAliveInterval=15",
    "-o", "ServerAliveCountMax=3",
    "-o", "ConnectTimeout=20"
)

function Invoke-NativeStrict {
    param(
        [scriptblock]$Command,
        [string]$Description,
        [int[]]$RetryExitCodes = @(255)
    )

    $attempt = 1
    while ($attempt -le $RetryCount) {
        & $Command
        if ($LASTEXITCODE -eq 0) {
            return
        }

        if ($RetryExitCodes -notcontains $LASTEXITCODE) {
            throw "$Description failed with exit code $LASTEXITCODE"
        }

        if ($attempt -ge $RetryCount) {
            throw "$Description failed with exit code $LASTEXITCODE after $attempt attempts"
        }

        Write-Host "Retrying $Description ($attempt/$RetryCount) in $RetryDelaySeconds sec..."
        Start-Sleep -Seconds $RetryDelaySeconds
        $attempt++
    }
}

function Invoke-RemoteCommand {
    param(
        [string]$Command
    )

    $tmpFile = Join-Path $env:TEMP ("remote-command-" + [guid]::NewGuid().ToString() + ".sh")
    $normalized = $Command -replace "`r`n", "`n"
    $normalized = $normalized -replace "`r", "`n"
    [System.IO.File]::WriteAllText($tmpFile, $normalized, [System.Text.UTF8Encoding]::new($false))

    try {
        Invoke-NativeStrict -Description "Run remote command over SSH" -Command {
            $optString = ($SshOptions | ForEach-Object {
                if ($_ -match '\s') { '"' + $_ + '"' } else { $_ }
            }) -join ' '
            $cmdLine = "ssh -i `"$KeyPath`" -p $Port $optString `"$User@$HostName`" `"bash -s`" < `"$tmpFile`""
            cmd /d /c $cmdLine
        }
    }
    finally {
        Remove-Item $tmpFile -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "== Checking local files =="

$requiredFiles = @(
    "build.tar.gz",
    "build.tar.gz.sha256",
    "deploy.sh",
    "healthcheck.sh",
    "rollback.sh"
)

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        throw "Missing required file: $file"
    }
}

if (-not (Test-Path $KeyPath)) {
    throw "Missing SSH private key: $KeyPath"
}

Write-Host "== Uploading bundle to server =="

Invoke-NativeStrict -Description "Upload build.tar.gz" -Command {
    scp -i $KeyPath -P $Port @SshOptions .\build.tar.gz "${User}@${HostName}:${DeployPath}/build.tar.gz"
}
Invoke-NativeStrict -Description "Upload build.tar.gz.sha256" -Command {
    scp -i $KeyPath -P $Port @SshOptions .\build.tar.gz.sha256 "${User}@${HostName}:${DeployPath}/build.tar.gz.sha256"
}
Invoke-NativeStrict -Description "Upload deploy.sh" -Command {
    scp -i $KeyPath -P $Port @SshOptions .\deploy.sh "${User}@${HostName}:${DeployPath}/deploy.sh"
}
Invoke-NativeStrict -Description "Upload healthcheck.sh" -Command {
    scp -i $KeyPath -P $Port @SshOptions .\healthcheck.sh "${User}@${HostName}:${DeployPath}/healthcheck.sh"
}
Invoke-NativeStrict -Description "Upload rollback.sh" -Command {
    scp -i $KeyPath -P $Port @SshOptions .\rollback.sh "${User}@${HostName}:${DeployPath}/rollback.sh"
}

Write-Host "== Verifying remote files =="

Invoke-RemoteCommand @"
set -e
mkdir -p '$DeployPath'
test -f '$DeployPath/build.tar.gz'
test -f '$DeployPath/build.tar.gz.sha256'
test -f '$DeployPath/deploy.sh'
test -f '$DeployPath/healthcheck.sh'
test -f '$DeployPath/rollback.sh'
chmod 700 '$DeployPath/deploy.sh' '$DeployPath/healthcheck.sh' '$DeployPath/rollback.sh' || true
"@

Write-Host "== Running remote deploy =="

Invoke-RemoteCommand @"
set -e
export ARTIFACT_PATH='$DeployPath/build.tar.gz'
export ARTIFACT_SHA256=`$(cat '$DeployPath/build.tar.gz.sha256')
bash '$DeployPath/deploy.sh'
"@

Write-Host "== Deploy finished =="

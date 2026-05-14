$ErrorActionPreference = "Stop"

$HostName = "209.42.27.90"
$Port = 22
$User = "thechoosentalks"
$KeyPath = "$HOME\.ssh\cpanel_laptop_deploy"
$BaseDir = "/home/thechoosentalks/deploy/apps/thechoosentalks"
$Branch = "main"

if ($args.Count -ge 1 -and -not [string]::IsNullOrWhiteSpace($args[0])) {
    $Branch = $args[0].Trim()
}

$sshOptions = @(
    "-o", "StrictHostKeyChecking=accept-new",
    "-o", "ServerAliveInterval=15",
    "-o", "ServerAliveCountMax=3",
    "-o", "ConnectTimeout=20"
)

$remoteScript = @"
set -euo pipefail
cd '$BaseDir'
test -f deploy.sh
chmod 700 deploy.sh
export BRANCH='$Branch'
bash ./deploy.sh
readlink -f '$BaseDir/current'
cat '$BaseDir/current/build-info.json'
"@

$tmpFile = Join-Path $env:TEMP ("remote-deploy-pull-" + [guid]::NewGuid().ToString() + ".sh")
[System.IO.File]::WriteAllText($tmpFile, ($remoteScript -replace "`r`n", "`n"), [System.Text.UTF8Encoding]::new($false))

try {
    $optString = ($sshOptions | ForEach-Object {
        if ($_ -match '\s') { '"' + $_ + '"' } else { $_ }
    }) -join ' '
    $cmdLine = "ssh -i `"$KeyPath`" -p $Port $optString `"$User@$HostName`" `"bash -s`" < `"$tmpFile`""
    cmd /d /c $cmdLine
    if ($LASTEXITCODE -ne 0) {
        throw "Remote pull deploy failed with exit code $LASTEXITCODE"
    }
}
finally {
    Remove-Item $tmpFile -Force -ErrorAction SilentlyContinue
}

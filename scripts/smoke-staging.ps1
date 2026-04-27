param(
    [string]$FrontendBaseUrl = "http://127.0.0.1:9002",
    [string]$BackendBaseUrl = "http://127.0.0.1:8000",
    [string]$OutFile = "",
    [int]$TimeoutSec = 30
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

function Invoke-StagingCheck {
    param(
        [string]$Url,
        [int]$RequestTimeoutSec = 30
    )

    try {
        $res = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec $RequestTimeoutSec -Headers @{ "Cache-Control" = "no-cache" }
        return [PSCustomObject]@{
            url = $Url
            status = [int]$res.StatusCode
            ok = ([int]$res.StatusCode -eq 200)
            error = ""
        }
    }
    catch {
        $status = 0
        if ($_.Exception.Response) {
            $status = [int]$_.Exception.Response.StatusCode
        }

        return [PSCustomObject]@{
            url = $Url
            status = $status
            ok = $false
            error = $_.Exception.Message
        }
    }
}

$targets = @(
    "$FrontendBaseUrl/api/today/readiness",
    "$BackendBaseUrl/api/v1/community/posts"
)

$results = @()
foreach ($target in $targets) {
    $results += Invoke-StagingCheck -Url $target -RequestTimeoutSec $TimeoutSec
}

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$lines = @()
$lines += "# Staging Smoke Check"
$lines += ""
$lines += "- Time: $timestamp"
$lines += "- Frontend Base URL: $FrontendBaseUrl"
$lines += "- Backend Base URL: $BackendBaseUrl"
$lines += "- Timeout per request: ${TimeoutSec}s"
$lines += ""
$lines += "| URL | Status | Result |"
$lines += "| --- | ---: | --- |"

foreach ($r in $results) {
    $resultLabel = if ($r.ok) { "PASS" } else { "FAIL" }
    $lines += "| $($r.url) | $($r.status) | $resultLabel |"
}

$failed = @($results | Where-Object { -not $_.ok })
if ($failed.Count -gt 0) {
    $lines += ""
    $lines += "## Errors"
    foreach ($f in $failed) {
        $lines += "- $($f.url): $($f.error)"
    }
}

$report = $lines -join "`n"
Write-Output $report

if (-not [string]::IsNullOrWhiteSpace($OutFile)) {
    Set-Content -LiteralPath $OutFile -Value $report -Encoding UTF8
}

if ($failed.Count -gt 0) {
    exit 1
}

exit 0

param(
    [string]$BaseUrl = "http://127.0.0.1:9002",
    [int]$TimeoutSec = 10,
    [int]$BurstRequests = 14,
    [string]$OutFile = ""
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

function Join-RootAndPath {
    param(
        [string]$RootUrl,
        [string]$Path
    )

    $trimmedRoot = $RootUrl.TrimEnd("/")
    if ($Path.StartsWith("/")) {
        return "$trimmedRoot$Path"
    }

    return "$trimmedRoot/$Path"
}

function Invoke-CurlStatus {
    param(
        [string]$Url,
        [hashtable]$Headers,
        [int]$RequestTimeoutSec = 10
    )

    $args = @(
        "-s",
        "-o", "NUL",
        "-w", "%{http_code}",
        "-X", "POST",
        "--max-time", "$RequestTimeoutSec"
    )

    foreach ($key in $Headers.Keys) {
        $args += @("-H", "${key}: $($Headers[$key])")
    }
    $args += $Url

    $code = & curl.exe @args
    return [int]$code
}

$targets = @(
    "/api/community/posts/123/share-assets/prepare",
    "/api/renungan/share/demo-token/prepare",
    "/api/versehub/id/kejadian-1-1/share-assets/prepare"
)

$results = @()

foreach ($path in $targets) {
    $url = Join-RootAndPath -RootUrl $BaseUrl -Path $path
    $status = Invoke-CurlStatus -Url $url -Headers @{ "Accept" = "application/json" } -RequestTimeoutSec $TimeoutSec
    $results += [PSCustomObject]@{
        test = "unauth_guard"
        target = $path
        status = $status
        ok = ($status -eq 401)
        note = "Expected 401 when no auth/session."
    }
}

$probePath = "/api/community/posts/999/share-assets/prepare"
$probeUrl = Join-RootAndPath -RootUrl $BaseUrl -Path $probePath
$probeToken = "1|SmokeProbeToken123456789"
$probeStatuses = @()
for ($i = 1; $i -le $BurstRequests; $i++) {
    $status = Invoke-CurlStatus `
        -Url $probeUrl `
        -Headers @{
            "Accept" = "application/json"
            "Authorization" = "Bearer $probeToken"
        } `
        -RequestTimeoutSec $TimeoutSec
    $probeStatuses += $status
}

$rateLimitHit = $probeStatuses -contains 429
$results += [PSCustomObject]@{
    test = "rate_limit_burst"
    target = $probePath
    status = if ($rateLimitHit) { 429 } else { ($probeStatuses[-1]) }
    ok = $rateLimitHit
    note = "Expected at least one 429 within burst. Observed: $($probeStatuses -join ',')"
}

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$lines = @()
$lines += "# Share Assets Prepare Smoke"
$lines += ""
$lines += "- Time: $timestamp"
$lines += "- Base URL: $BaseUrl"
$lines += "- Timeout per request: ${TimeoutSec}s"
$lines += "- Burst requests: $BurstRequests"
$lines += ""
$lines += "| Test | Target | Status | Result | Note |"
$lines += "| --- | --- | ---: | --- | --- |"
foreach ($r in $results) {
    $resultLabel = if ($r.ok) { "PASS" } else { "FAIL" }
    $lines += "| $($r.test) | $($r.target) | $($r.status) | $resultLabel | $($r.note) |"
}

$report = $lines -join "`n"
Write-Output $report

if (-not [string]::IsNullOrWhiteSpace($OutFile)) {
    Set-Content -Path $OutFile -Value $report -Encoding UTF8
}

$failedCount = ($results | Where-Object { -not $_.ok }).Count
if ($failedCount -gt 0) {
    exit 1
}

exit 0

param(
    [string]$BaseUrl = "https://www.thechoosentalks.org",
    [string]$OutFile = ""
)

$ErrorActionPreference = "Stop"

function Invoke-SmokeCheck {
    param(
        [string]$Url,
        [int[]]$ExpectedStatus = @(200),
        [switch]$ExpectJson
    )

    try {
        $res = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 45
        $status = [int]$res.StatusCode
        $ok = $ExpectedStatus -contains $status
        $preview = ""
        if ($ExpectJson) {
            $content = [string]$res.Content
            if ($content.Length -gt 160) {
                $content = $content.Substring(0, 160)
            }
            $preview = $content
        }
        return [PSCustomObject]@{
            url = $Url
            status = $status
            ok = $ok
            preview = $preview
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
            ok = ($ExpectedStatus -contains $status)
            preview = ""
            error = $_.Exception.Message
        }
    }
}

$targets = @(
    @{ path = "/"; json = $false },
    @{ path = "/today"; json = $false },
    @{ path = "/community"; json = $false },
    @{ path = "/paths"; json = $false },
    @{ path = "/versehub/id"; json = $false },
    @{ path = "/profile"; json = $false },
    @{ path = "/api/today"; json = $true },
    @{ path = "/api/community/posts"; json = $true },
    @{ path = "/api/versehub/id/books"; json = $true },
    @{ path = "/api/versehub/id/chapter/mzm-23-1"; json = $true },
    @{ path = "/favicon.png"; json = $false }
)

$results = @()
foreach ($target in $targets) {
    $fullUrl = "$BaseUrl$($target.path)"
    $results += Invoke-SmokeCheck -Url $fullUrl -ExpectedStatus @(200) -ExpectJson:([bool]$target.json)
}

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$lines = @()
$lines += "# Production Smoke Check"
$lines += ""
$lines += "- Time: $timestamp"
$lines += "- Base URL: $BaseUrl"
$lines += ""
$lines += "| URL | Status | Result |"
$lines += "| --- | ---: | --- |"
foreach ($r in $results) {
    $resultLabel = if ($r.ok) { "PASS" } else { "FAIL" }
    $lines += "| $($r.url) | $($r.status) | $resultLabel |"
}
$lines += ""
$lines += "## JSON Preview"
foreach ($r in $results | Where-Object { $_.preview -ne "" }) {
    $lines += "- $($r.url): $($r.preview)"
}
$lines += ""
$lines += "## Errors"
foreach ($r in $results | Where-Object { -not $_.ok }) {
    $lines += "- $($r.url): $($r.error)"
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

param(
    [string]$PrometheusBaseUrl = "http://localhost:9090",
    [string]$OutFile = "",
    [int]$TimeoutSec = 30
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

function Invoke-PromQuery {
    param([string]$Expr)
    $q = [uri]::EscapeDataString($Expr)
    $url = "$PrometheusBaseUrl/api/v1/query?query=$q"
    $res = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec $TimeoutSec
    return ($res.Content | ConvertFrom-Json)
}

function Get-MetricRows {
    param([object]$Payload)
    if ($null -eq $Payload.data -or $null -eq $Payload.data.result) { return @() }
    return @($Payload.data.result)
}

$availability = Get-MetricRows (Invoke-PromQuery 'avg_over_time(probe_success{job="blackbox-http"}[30d]) * 100')
$burnRate = Get-MetricRows (Invoke-PromQuery '(1 - avg_over_time(probe_success{job="blackbox-http"}[30d])) * 100')
$latencyP95 = Get-MetricRows (Invoke-PromQuery 'quantile_over_time(0.95, probe_duration_seconds{job="blackbox-http"}[30m])')
$firingAlerts = Get-MetricRows (Invoke-PromQuery 'ALERTS{alertstate="firing"}')

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$lines = @()
$lines += "# SLO Weekly Report"
$lines += ""
$lines += "- Generated: $timestamp"
$lines += "- Prometheus: $PrometheusBaseUrl"
$lines += "- Availability SLO target: 99.5% (30d)"
$lines += ""
$lines += "## Availability (30d %)"
if ($availability.Count -eq 0) {
    $lines += "- No data"
} else {
    foreach ($r in $availability) {
        $name = if ($r.metric.target_name) { $r.metric.target_name } else { $r.metric.instance }
        $lines += "- ${name}: $($r.value[1])"
    }
}

$lines += ""
$lines += "## Error Budget Burn (30d %)"
if ($burnRate.Count -eq 0) {
    $lines += "- No data"
} else {
    foreach ($r in $burnRate) {
        $name = if ($r.metric.target_name) { $r.metric.target_name } else { $r.metric.instance }
        $lines += "- ${name}: $($r.value[1])"
    }
}

$lines += ""
$lines += "## p95 Latency (30m, seconds)"
if ($latencyP95.Count -eq 0) {
    $lines += "- No data"
} else {
    foreach ($r in $latencyP95) {
        $name = if ($r.metric.target_name) { $r.metric.target_name } else { $r.metric.instance }
        $lines += "- ${name}: $($r.value[1])"
    }
}

$lines += ""
$lines += "## Active Alerts"
if ($firingAlerts.Count -eq 0) {
    $lines += "- None"
} else {
    foreach ($r in $firingAlerts) {
        $lines += "- $($r.metric.alertname) ($($r.metric.severity)) on $($r.metric.instance)"
    }
}

$report = $lines -join "`n"
Write-Output $report

if (-not [string]::IsNullOrWhiteSpace($OutFile)) {
    Set-Content -LiteralPath $OutFile -Value $report -Encoding UTF8
}

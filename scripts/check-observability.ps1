param(
    [string]$PrometheusUrl = "http://127.0.0.1:9090",
    [string]$AlertmanagerUrl = "http://127.0.0.1:9093",
    [int]$TimeoutSec = 20,
    [int]$MaxCriticalAlerts = 0,
    [int]$StabilizationWindowSec = 60,
    [int]$RequireConsecutivePasses = 2,
    [int]$SampleIntervalSec = 15,
    [int]$CriticalAlertMinActiveSec = 60,
    [string]$OutFile = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

function Invoke-ObsRequest {
    param(
        [string]$Url
    )

    return Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec $TimeoutSec -Headers @{ "Cache-Control" = "no-cache" }
}

function Assert-ReadyEndpoint {
    param(
        [string]$Name,
        [string]$Url
    )

    try {
        $res = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec $TimeoutSec -UseBasicParsing -Headers @{ "Cache-Control" = "no-cache" }
        if ([int]$res.StatusCode -ne 200) {
            throw "$Name readiness endpoint returned HTTP $([int]$res.StatusCode)"
        }

        return [PSCustomObject]@{
            name = $Name
            url = $Url
            status = "PASS"
            detail = "ready"
        }
    }
    catch {
        return [PSCustomObject]@{
            name = $Name
            url = $Url
            status = "FAIL"
            detail = $_.Exception.Message
        }
    }
}

function Get-ProbeFailures {
    param([string]$BaseUrl)

    $query = [uri]::EscapeDataString('probe_success{job=~"blackbox-http|blackbox-tcp"}')
    $url = "$($BaseUrl.TrimEnd('/'))/api/v1/query?query=$query"
    $payload = Invoke-ObsRequest -Url $url

    if ($payload.status -ne "success") {
        throw "Prometheus query failed for probe_success."
    }

    $results = @($payload.data.result)
    if ($results.Count -eq 0) {
        throw "Prometheus returned no blackbox probe results."
    }

    $failed = @(
        $results | Where-Object {
            # value format: [ <unix_ts>, "<value>" ]
            $_.value.Count -ge 2 -and [double]$_.value[1] -lt 1
        }
    )

    return $failed
}

function Get-ActiveCriticalAlerts {
    param(
        [string]$BaseUrl,
        [int]$MinActiveDurationSec
    )

    $url = "$($BaseUrl.TrimEnd('/'))/api/v2/alerts?active=true&silenced=false&inhibited=false"
    $alerts = @(Invoke-ObsRequest -Url $url)
    return @(
        $alerts | Where-Object {
            if ($_.labels.severity -ne "critical" -or $_.status.state -ne "active") {
                return $false
            }

            if ($MinActiveDurationSec -le 0) {
                return $true
            }

            $startedAtRaw = $_.startsAt
            if ([string]::IsNullOrWhiteSpace($startedAtRaw)) {
                $startedAtRaw = $_.status.startsAt
            }

            $startedAt = [datetimeoffset]::MinValue
            if (-not [datetimeoffset]::TryParse($startedAtRaw, [ref]$startedAt)) {
                return $true
            }

            $ageSec = ((Get-Date).ToUniversalTime() - $startedAt.UtcDateTime).TotalSeconds
            return $ageSec -ge $MinActiveDurationSec
        }
    )
}

function Test-ObservabilitySnapshot {
    $checks = @()
    $checks += Assert-ReadyEndpoint -Name "prometheus-ready" -Url "$($PrometheusUrl.TrimEnd('/'))/-/ready"
    $checks += Assert-ReadyEndpoint -Name "alertmanager-ready" -Url "$($AlertmanagerUrl.TrimEnd('/'))/-/ready"

    $probeFailures = @()
    $criticalAlerts = @()
    $failures = New-Object System.Collections.Generic.List[string]

    foreach ($check in $checks) {
        if ($check.status -ne "PASS") {
            $failures.Add("$($check.name): $($check.detail)")
        }
    }

    if ($failures.Count -eq 0) {
        try {
            $probeFailures = @(Get-ProbeFailures -BaseUrl $PrometheusUrl)
        }
        catch {
            $failures.Add("probe-check: $($_.Exception.Message)")
        }

        try {
            $criticalAlerts = @(Get-ActiveCriticalAlerts -BaseUrl $AlertmanagerUrl -MinActiveDurationSec $CriticalAlertMinActiveSec)
        }
        catch {
            $failures.Add("alertmanager-check: $($_.Exception.Message)")
        }
    }

    if ($probeFailures.Count -gt 0) {
        foreach ($probe in $probeFailures) {
            $instance = $probe.metric.instance
            $job = $probe.metric.job
            $targetName = $probe.metric.target_name
            if ([string]::IsNullOrWhiteSpace($targetName)) {
                $targetName = $probe.metric.container
            }
            $failures.Add("probe-failure: job=$job instance=$instance target=$targetName")
        }
    }

    if ($criticalAlerts.Count -gt $MaxCriticalAlerts) {
        $failures.Add("critical-alert-count=$($criticalAlerts.Count) exceeds threshold=$MaxCriticalAlerts")
    }

    return [PSCustomObject]@{
        checks = $checks
        probeFailures = $probeFailures
        criticalAlerts = $criticalAlerts
        failures = @($failures)
        passed = ($failures.Count -eq 0)
    }
}

$attempt = 0
$consecutivePasses = 0
$snapshot = $null
$deadline = (Get-Date).AddSeconds([Math]::Max(0, $StabilizationWindowSec))

while ($true) {
    $attempt += 1
    $snapshot = Test-ObservabilitySnapshot

    if ($snapshot.passed) {
        $consecutivePasses += 1
        Write-Host "Observability sample $attempt PASS ($consecutivePasses/$RequireConsecutivePasses)." -ForegroundColor Green
        if ($consecutivePasses -ge $RequireConsecutivePasses) {
            break
        }
    }
    else {
        $consecutivePasses = 0
        Write-Host "Observability sample $attempt FAIL, will retry within stabilization window." -ForegroundColor Yellow
    }

    if ((Get-Date) -ge $deadline) {
        break
    }

    Start-Sleep -Seconds $SampleIntervalSec
}

$lines = @()
$lines += "# Observability Gate Report"
$lines += ""
$lines += "- Time: $((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))"
$lines += "- Prometheus: $PrometheusUrl"
$lines += "- Alertmanager: $AlertmanagerUrl"
$lines += "- Max critical alerts allowed: $MaxCriticalAlerts"
$lines += "- Stabilization window (sec): $StabilizationWindowSec"
$lines += "- Sample interval (sec): $SampleIntervalSec"
$lines += "- Required consecutive passes: $RequireConsecutivePasses"
$lines += "- Critical alert minimum active age (sec): $CriticalAlertMinActiveSec"
$lines += "- Samples executed: $attempt"
$lines += "- Consecutive passes achieved: $consecutivePasses"
$lines += ""
$lines += "## Readiness Checks"
$lines += "| Check | Status | Detail |"
$lines += "| --- | --- | --- |"
foreach ($check in $snapshot.checks) {
    $lines += "| $($check.name) | $($check.status) | $($check.detail) |"
}

$lines += ""
$lines += "## Probe Failures"
if ($snapshot.probeFailures.Count -eq 0) {
    $lines += "- none"
}
else {
    foreach ($probe in $snapshot.probeFailures) {
        $lines += "- job=$($probe.metric.job), instance=$($probe.metric.instance), value=$($probe.value[1])"
    }
}

$lines += ""
$lines += "## Active Critical Alerts"
if ($snapshot.criticalAlerts.Count -eq 0) {
    $lines += "- none"
}
else {
    foreach ($alert in $snapshot.criticalAlerts) {
        $lines += "- $($alert.labels.alertname) ($($alert.labels.service)): $($alert.annotations.summary)"
    }
}

$report = $lines -join "`n"
Write-Output $report

if (-not [string]::IsNullOrWhiteSpace($OutFile)) {
    Set-Content -LiteralPath $OutFile -Value $report -Encoding UTF8
}

if ($snapshot.failures.Count -gt 0 -or $consecutivePasses -lt $RequireConsecutivePasses) {
    foreach ($failure in $snapshot.failures) {
        Write-Host "FAIL: $failure" -ForegroundColor Red
    }
    if ($consecutivePasses -lt $RequireConsecutivePasses) {
        Write-Host "FAIL: consecutive pass threshold not met within stabilization window ($consecutivePasses/$RequireConsecutivePasses)." -ForegroundColor Red
    }
    exit 1
}

Write-Host "Observability gate passed." -ForegroundColor Green
exit 0

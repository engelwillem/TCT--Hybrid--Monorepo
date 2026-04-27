param(
    [int]$HealthTimeoutSec = 600,
    [int]$HealthPollSec = 10,
    [int]$HealthInitialDelaySec = 30,
    [int]$MinHealthyConsecutive = 2,
    [int]$MaxUnhealthyConsecutive = 3,
    [string]$PrometheusUrl = "http://127.0.0.1:9090",
    [string]$AlertmanagerUrl = "http://127.0.0.1:9093",
    [int]$MaxCriticalAlerts = 0,
    [int]$ObservabilityStabilizationSec = 60,
    [int]$ObservabilityRequireConsecutivePasses = 2,
    [int]$ObservabilitySampleIntervalSec = 15,
    [int]$CriticalAlertMinActiveSec = 60,
    [switch]$SkipObservabilityGate,
    [switch]$AutoRollbackOnFailure
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$smokeScript = Join-Path $PSScriptRoot 'smoke-staging.ps1'
$observabilityScript = Join-Path $PSScriptRoot 'check-observability.ps1'
$rollbackScript = Join-Path $PSScriptRoot 'rollback-staging.ps1'

function Write-Section {
    param([string]$Text)
    Write-Host "==> $Text" -ForegroundColor Cyan
}

function Assert-DeployEnvFiles {
    param([string]$RepoRoot)

    $backendEnvFile = $env:BACKEND_ENV_FILE
    $frontendEnvFile = $env:FRONTEND_ENV_FILE

    if ([string]::IsNullOrWhiteSpace($backendEnvFile) -or [string]::IsNullOrWhiteSpace($frontendEnvFile)) {
        throw "BACKEND_ENV_FILE and FRONTEND_ENV_FILE must be explicitly set for staging deploy."
    }

    $backendEnvPath = Join-Path $RepoRoot $backendEnvFile
    $frontendEnvPath = Join-Path $RepoRoot $frontendEnvFile

    if (-not (Test-Path -LiteralPath $backendEnvPath -PathType Leaf)) {
        throw "BACKEND_ENV_FILE not found: $backendEnvPath"
    }

    if (-not (Test-Path -LiteralPath $frontendEnvPath -PathType Leaf)) {
        throw "FRONTEND_ENV_FILE not found: $frontendEnvPath"
    }

    Write-Host "Using BACKEND_ENV_FILE=$backendEnvFile" -ForegroundColor Green
    Write-Host "Using FRONTEND_ENV_FILE=$frontendEnvFile" -ForegroundColor Green
}

function Save-RollbackImage {
    param(
        [string]$ContainerName,
        [string]$RollbackTag
    )

    $imageId = (docker inspect --format='{{.Image}}' $ContainerName 2>$null)
    if ([string]::IsNullOrWhiteSpace($imageId)) {
        Write-Host "Skip rollback snapshot for $ContainerName (container not found)." -ForegroundColor Yellow
        return
    }

    docker tag $imageId $RollbackTag | Out-Null
    Write-Host "Saved rollback snapshot: $RollbackTag" -ForegroundColor Green
}

function Wait-ContainerHealthy {
    param(
        [string]$ContainerName,
        [int]$TimeoutSec,
        [int]$PollSec,
        [int]$InitialDelaySec,
        [int]$RequireConsecutiveHealthy,
        [int]$AllowConsecutiveUnhealthy
    )

    if ($InitialDelaySec -gt 0) {
        Write-Host "$ContainerName warm-up delay ${InitialDelaySec}s before health evaluation." -ForegroundColor Yellow
        Start-Sleep -Seconds $InitialDelaySec
    }

    $consecutiveHealthy = 0
    $consecutiveUnhealthy = 0
    $deadline = (Get-Date).AddSeconds($TimeoutSec)
    while ((Get-Date) -lt $deadline) {
        $json = docker inspect --format='{{json .State.Health}}' $ContainerName 2>$null
        if (-not [string]::IsNullOrWhiteSpace($json) -and $json -ne '<no value>') {
            $health = $json | ConvertFrom-Json
            if ($health.Status -eq 'healthy') {
                $consecutiveHealthy += 1
                $consecutiveUnhealthy = 0
                Write-Host "$ContainerName healthy ($consecutiveHealthy/$RequireConsecutiveHealthy)." -ForegroundColor Green
                if ($consecutiveHealthy -ge $RequireConsecutiveHealthy) {
                    return
                }
            }
            elseif ($health.Status -eq 'unhealthy') {
                $consecutiveHealthy = 0
                $consecutiveUnhealthy += 1
                if ($consecutiveUnhealthy -ge $AllowConsecutiveUnhealthy) {
                    throw "$ContainerName is unhealthy for $consecutiveUnhealthy consecutive checks."
                }
                Write-Host "$ContainerName unhealthy ($consecutiveUnhealthy/$AllowConsecutiveUnhealthy), waiting for recovery..." -ForegroundColor Yellow
            }
            else {
                $consecutiveHealthy = 0
                $consecutiveUnhealthy = 0
            }
        }
        Start-Sleep -Seconds $PollSec
    }

    throw "Timeout waiting for healthy container: $ContainerName"
}

try {
    Set-Location $repoRoot
    Write-Section 'Validate deploy environment files'
    Assert-DeployEnvFiles -RepoRoot $repoRoot

    Write-Section 'Create rollback image snapshots'
    Save-RollbackImage -ContainerName 'tct-backend' -RollbackTag 'thechoosentalksnext-backend:staging-prev'
    Save-RollbackImage -ContainerName 'tct-frontend' -RollbackTag 'thechoosentalksnext-frontend:staging-prev'

    Write-Section 'Build staging images'
    docker compose build backend frontend

    Write-Section 'Deploy staging containers'
    docker compose up -d --force-recreate backend frontend

    Write-Section 'Wait container health checks'
    Wait-ContainerHealthy -ContainerName 'tct-backend' -TimeoutSec $HealthTimeoutSec -PollSec $HealthPollSec -InitialDelaySec $HealthInitialDelaySec -RequireConsecutiveHealthy $MinHealthyConsecutive -AllowConsecutiveUnhealthy $MaxUnhealthyConsecutive
    Wait-ContainerHealthy -ContainerName 'tct-frontend' -TimeoutSec $HealthTimeoutSec -PollSec $HealthPollSec -InitialDelaySec $HealthInitialDelaySec -RequireConsecutiveHealthy $MinHealthyConsecutive -AllowConsecutiveUnhealthy $MaxUnhealthyConsecutive

    Write-Section 'Run staging smoke checks'
    & $smokeScript -TimeoutSec 30
    if ($LASTEXITCODE -ne 0) {
        throw "Staging smoke checks failed with exit code $LASTEXITCODE."
    }

    if (-not $SkipObservabilityGate) {
        Write-Section 'Run observability gate checks'
        & $observabilityScript `
            -PrometheusUrl $PrometheusUrl `
            -AlertmanagerUrl $AlertmanagerUrl `
            -MaxCriticalAlerts $MaxCriticalAlerts `
            -StabilizationWindowSec $ObservabilityStabilizationSec `
            -RequireConsecutivePasses $ObservabilityRequireConsecutivePasses `
            -SampleIntervalSec $ObservabilitySampleIntervalSec `
            -CriticalAlertMinActiveSec $CriticalAlertMinActiveSec `
            -OutFile 'docs/monitoring/DevSecOps Report/staging-observability-latest.md'
        if ($LASTEXITCODE -ne 0) {
            throw "Observability gate failed with exit code $LASTEXITCODE."
        }
    }

    Write-Host 'Staging deployment succeeded.' -ForegroundColor Green
}
catch {
    Write-Host "Staging deployment failed: $($_.Exception.Message)" -ForegroundColor Red

    if ($AutoRollbackOnFailure) {
        Write-Host 'Auto rollback enabled. Running rollback script...' -ForegroundColor Yellow
        & $rollbackScript -HealthTimeoutSec $HealthTimeoutSec -HealthPollSec $HealthPollSec -HealthInitialDelaySec $HealthInitialDelaySec -MinHealthyConsecutive $MinHealthyConsecutive -MaxUnhealthyConsecutive $MaxUnhealthyConsecutive
        if ($LASTEXITCODE -ne 0) {
            throw "Rollback script failed with exit code $LASTEXITCODE after deploy failure."
        }
    }

    throw
}

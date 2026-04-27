param(
    [int]$HealthTimeoutSec = 600,
    [int]$HealthPollSec = 10,
    [int]$HealthInitialDelaySec = 30,
    [int]$MinHealthyConsecutive = 2,
    [int]$MaxUnhealthyConsecutive = 3
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$smokeScript = Join-Path $PSScriptRoot 'smoke-staging.ps1'

function Write-Section {
    param([string]$Text)
    Write-Host "==> $Text" -ForegroundColor Cyan
}

function Assert-ImageExists {
    param([string]$ImageTag)

    docker image inspect $ImageTag | Out-Null
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
                    throw "$ContainerName is unhealthy after rollback for $consecutiveUnhealthy consecutive checks."
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

    throw "Timeout waiting healthy after rollback: $ContainerName"
}

Set-Location $repoRoot

Write-Section 'Validate rollback snapshots'
Assert-ImageExists -ImageTag 'thechoosentalksnext-backend:staging-prev'
Assert-ImageExists -ImageTag 'thechoosentalksnext-frontend:staging-prev'

Write-Section 'Restore previous backend/frontend image tags'
docker tag thechoosentalksnext-backend:staging-prev thechoosentalksnext-backend:latest
docker tag thechoosentalksnext-frontend:staging-prev thechoosentalksnext-frontend:latest

Write-Section 'Recreate staging containers from rollback images'
docker compose up -d --force-recreate backend frontend

Write-Section 'Wait container health checks'
Wait-ContainerHealthy -ContainerName 'tct-backend' -TimeoutSec $HealthTimeoutSec -PollSec $HealthPollSec -InitialDelaySec $HealthInitialDelaySec -RequireConsecutiveHealthy $MinHealthyConsecutive -AllowConsecutiveUnhealthy $MaxUnhealthyConsecutive
Wait-ContainerHealthy -ContainerName 'tct-frontend' -TimeoutSec $HealthTimeoutSec -PollSec $HealthPollSec -InitialDelaySec $HealthInitialDelaySec -RequireConsecutiveHealthy $MinHealthyConsecutive -AllowConsecutiveUnhealthy $MaxUnhealthyConsecutive

Write-Section 'Run post-rollback smoke checks'
& $smokeScript -TimeoutSec 30
if ($LASTEXITCODE -ne 0) {
    throw "Post-rollback staging smoke checks failed with exit code $LASTEXITCODE."
}

Write-Host 'Rollback completed successfully.' -ForegroundColor Green

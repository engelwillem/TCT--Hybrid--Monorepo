param(
    [ValidateSet("none", "expand", "contract")]
    [string]$SchemaStrategy = "expand",
    [switch]$RunBackfill,
    [string]$BackfillCommand = "",
    [int]$DbTimeoutSec = 300,
    [int]$DbPollSec = 5
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

function Write-Section {
    param([string]$Text)
    Write-Host "==> $Text" -ForegroundColor Cyan
}

function Assert-DeployEnvFiles {
    param([string]$RepoRoot)

    $backendEnvFile = $env:BACKEND_ENV_FILE
    $frontendEnvFile = $env:FRONTEND_ENV_FILE

    if ([string]::IsNullOrWhiteSpace($backendEnvFile) -or [string]::IsNullOrWhiteSpace($frontendEnvFile)) {
        throw "BACKEND_ENV_FILE and FRONTEND_ENV_FILE must be explicitly set for staging migration."
    }

    $backendEnvPath = Join-Path $RepoRoot $backendEnvFile
    $frontendEnvPath = Join-Path $RepoRoot $frontendEnvFile

    if (-not (Test-Path -LiteralPath $backendEnvPath -PathType Leaf)) {
        throw "BACKEND_ENV_FILE not found: $backendEnvPath"
    }

    if (-not (Test-Path -LiteralPath $frontendEnvPath -PathType Leaf)) {
        throw "FRONTEND_ENV_FILE not found: $frontendEnvPath"
    }
}

function Wait-ServiceHealthy {
    param(
        [string]$ContainerName,
        [int]$TimeoutSec,
        [int]$PollSec
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSec)
    while ((Get-Date) -lt $deadline) {
        $json = docker inspect --format='{{json .State.Health}}' $ContainerName 2>$null
        if (-not [string]::IsNullOrWhiteSpace($json) -and $json -ne "<no value>") {
            $health = $json | ConvertFrom-Json
            if ($health.Status -eq "healthy") {
                Write-Host "$ContainerName healthy." -ForegroundColor Green
                return
            }
            if ($health.Status -eq "unhealthy") {
                throw "$ContainerName is unhealthy."
            }
        }
        Start-Sleep -Seconds $PollSec
    }

    throw "Timeout waiting healthy for $ContainerName"
}

function Invoke-BackendTask {
    param([string]$Command)
    docker compose run --rm backend sh -lc $Command
    if ($LASTEXITCODE -ne 0) {
        throw "Backend task failed with exit code $LASTEXITCODE. Command: $Command"
    }
}

function Run-Migrations {
    param([string]$Strategy)

    switch ($Strategy) {
        "none" {
            Write-Host "Skipping DB migration step (schema strategy: none)." -ForegroundColor Yellow
        }
        "expand" {
            # Expand step must be additive; destructive contract work is separated behind explicit strategy.
            Invoke-BackendTask -Command "php artisan migrate --force"
        }
        "contract" {
            if ($env:ALLOW_CONTRACT_MIGRATIONS -ne "true") {
                throw "Contract migration requires ALLOW_CONTRACT_MIGRATIONS=true."
            }
            Invoke-BackendTask -Command "php artisan migrate --force"
        }
    }
}

function Run-BackfillIfRequested {
    param(
        [switch]$ShouldRun,
        [string]$Command
    )

    if (-not $ShouldRun) {
        Write-Host "Backfill step skipped." -ForegroundColor Yellow
        return
    }

    if ([string]::IsNullOrWhiteSpace($Command)) {
        throw "RunBackfill is enabled but BackfillCommand is empty."
    }

    Invoke-BackendTask -Command $Command
}

Set-Location $repoRoot
Write-Section "Validate environment files"
Assert-DeployEnvFiles -RepoRoot $repoRoot

Write-Section "Ensure database service is healthy"
docker compose up -d mariadb redis | Out-Null
Wait-ServiceHealthy -ContainerName "tct-mariadb" -TimeoutSec $DbTimeoutSec -PollSec $DbPollSec

Write-Section "Run schema migration ($SchemaStrategy)"
Run-Migrations -Strategy $SchemaStrategy

Write-Section "Run backfill"
Run-BackfillIfRequested -ShouldRun:$RunBackfill -Command $BackfillCommand

Write-Host "Staging migration pipeline completed." -ForegroundColor Green

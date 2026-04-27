param(
    [string]$BackendEnvFile = "backend-api/.env.docker",
    [string]$FrontendEnvFile = ".env.docker",
    [string]$DbContainer = "tct-mariadb",
    [string]$DbName = "thechoosentalks",
    [string]$DbUser = "root",
    [string]$DbPassword = "root",
    [string]$OutputDir = "docs/monitoring/DevSecOps Report/staging-drill",
    [string]$ContractSqlFile = "docs/monitoring/DevSecOps Report/staging-drill/sql-template-drill8-contract-break.sql",
    [string]$RecoverySqlFile = "docs/monitoring/DevSecOps Report/staging-drill/sql-template-drill8-recovery.sql",
    [int]$HealthTimeoutSec = 900,
    [int]$HealthPollSec = 10,
    [int]$HealthInitialDelaySec = 30,
    [int]$MinHealthyConsecutive = 2,
    [int]$MaxUnhealthyConsecutive = 3
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$rollbackScript = Join-Path $PSScriptRoot "rollback-staging.ps1"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$resolvedOutputDir = Join-Path $repoRoot $OutputDir
$logPath = Join-Path $resolvedOutputDir "drill8-controlled-$timestamp.log"
$summaryPath = Join-Path $resolvedOutputDir "drill8-controlled-summary-$timestamp.md"
$resolvedContractSql = Join-Path $repoRoot $ContractSqlFile
$resolvedRecoverySql = Join-Path $repoRoot $RecoverySqlFile

$status = [ordered]@{
    setup_sql = "NOT_RUN"
    pre_probe = "NOT_RUN"
    contract_break = "NOT_RUN"
    rollback = "NOT_RUN"
    post_rollback_probe = "NOT_RUN"
    recovery_sql = "NOT_RUN"
    post_recovery_probe = "NOT_RUN"
}

$failureMessage = ""

function Write-Section {
    param([string]$Text)
    Write-Host "==> $Text" -ForegroundColor Cyan
}

function Append-Log {
    param([string]$Text)
    Add-Content -LiteralPath $logPath -Value $Text
}

function Assert-PathExists {
    param(
        [string]$Path,
        [string]$Label
    )

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "$Label not found: $Path"
    }
}

Set-Location $repoRoot
New-Item -ItemType Directory -Path $resolvedOutputDir -Force | Out-Null
Append-Log "[Drill8] start $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

try {
    Write-Section "Validate prerequisites"
    Assert-PathExists -Path $rollbackScript -Label "Rollback script"
    Assert-PathExists -Path $resolvedContractSql -Label "Contract SQL template"
    Assert-PathExists -Path $resolvedRecoverySql -Label "Recovery SQL template"

    Write-Section "Step 1: Setup isolated drill table"
    Get-Content -LiteralPath $resolvedContractSql -Raw | docker exec -i $DbContainer mariadb "-u$DbUser" "-p$DbPassword" $DbName *>&1 | Tee-Object -FilePath $logPath -Append
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to execute contract setup SQL template."
    }
    $status.setup_sql = "PASS"

    Write-Section "Step 2: Old-contract probe before contract break (expect PASS)"
    $preProbeOutput = @(docker exec $DbContainer mariadb "-u$DbUser" "-p$DbPassword" $DbName -N -e "SELECT legacy_title FROM drill8_contract_edge LIMIT 1;" 2>&1)
    $preProbeExit = $LASTEXITCODE
    $preProbeOutput | Tee-Object -FilePath $logPath -Append | Out-Host
    if ($preProbeExit -ne 0) {
        throw "Pre-contract probe failed unexpectedly."
    }
    $status.pre_probe = "PASS"

    Write-Section "Step 3: Apply contract-breaking change"
    docker exec $DbContainer mariadb "-u$DbUser" "-p$DbPassword" $DbName -e "ALTER TABLE drill8_contract_edge DROP COLUMN legacy_title;" *>&1 | Tee-Object -FilePath $logPath -Append
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to apply contract-breaking change."
    }
    $status.contract_break = "PASS"

    Write-Section "Step 4: Roll back image (schema should remain contract-broken)"
    $env:BACKEND_ENV_FILE = $BackendEnvFile
    $env:FRONTEND_ENV_FILE = $FrontendEnvFile
    & $rollbackScript `
        -HealthTimeoutSec $HealthTimeoutSec `
        -HealthPollSec $HealthPollSec `
        -HealthInitialDelaySec $HealthInitialDelaySec `
        -MinHealthyConsecutive $MinHealthyConsecutive `
        -MaxUnhealthyConsecutive $MaxUnhealthyConsecutive *>&1 | Tee-Object -FilePath $logPath -Append
    if ($LASTEXITCODE -ne 0) {
        throw "Rollback script failed with exit code $LASTEXITCODE."
    }
    $status.rollback = "PASS"

    Write-Section "Step 5: Old-contract probe after rollback (expect FAIL)"
    $postRollbackProbeOutput = @(docker exec $DbContainer mariadb "-u$DbUser" "-p$DbPassword" $DbName -N -e "SELECT legacy_title FROM drill8_contract_edge LIMIT 1;" 2>&1)
    $postRollbackProbeExit = $LASTEXITCODE
    $postRollbackProbeText = ($postRollbackProbeOutput | Out-String)
    $postRollbackProbeOutput | Tee-Object -FilePath $logPath -Append | Out-Host
    if ($postRollbackProbeExit -eq 0) {
        throw "Expected old-contract probe to fail after rollback, but it succeeded."
    }
    if ($postRollbackProbeText -notmatch "Unknown column 'legacy_title'") {
        throw "Probe failed, but not with expected incompatibility message."
    }
    $status.post_rollback_probe = "PASS_EXPECTED_FAIL"

    Write-Section "Step 6: Apply recovery compatibility SQL"
    Get-Content -LiteralPath $resolvedRecoverySql -Raw | docker exec -i $DbContainer mariadb "-u$DbUser" "-p$DbPassword" $DbName *>&1 | Tee-Object -FilePath $logPath -Append
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to execute recovery SQL template."
    }
    $status.recovery_sql = "PASS"

    Write-Section "Step 7: Old-contract probe after recovery (expect PASS)"
    $postRecoveryProbeOutput = @(docker exec $DbContainer mariadb "-u$DbUser" "-p$DbPassword" $DbName -N -e "SELECT legacy_title FROM drill8_contract_edge LIMIT 1;" 2>&1)
    $postRecoveryProbeExit = $LASTEXITCODE
    $postRecoveryProbeOutput | Tee-Object -FilePath $logPath -Append | Out-Host
    if ($postRecoveryProbeExit -ne 0) {
        throw "Post-recovery probe failed unexpectedly."
    }
    $status.post_recovery_probe = "PASS"
}
catch {
    $failureMessage = $_.Exception.Message
    Write-Host "Drill 8 controlled execution failed: $failureMessage" -ForegroundColor Red
    Append-Log "[Drill8] failure: $failureMessage"
}
finally {
    $allPass = $true
    foreach ($k in $status.Keys) {
        if ($status[$k] -eq "NOT_RUN") {
            $allPass = $false
            break
        }
    }

    if ($status.post_rollback_probe -ne "PASS_EXPECTED_FAIL") {
        $allPass = $false
    }

    $verdict = if ($allPass -and [string]::IsNullOrWhiteSpace($failureMessage)) { "PASS" } else { "FAIL" }
    $generatedAt = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

    $summary = @(
        "# Drill 8 Controlled Summary"
        ""
        "- Generated at: $generatedAt"
        "- Verdict: **$verdict**"
        "- Raw log: `$(Split-Path -Leaf $logPath)`"
        ""
        "## Step Status"
        "| Step | Status |"
        "| --- | --- |"
        "| Setup SQL | $($status.setup_sql) |"
        "| Pre-probe old contract | $($status.pre_probe) |"
        "| Apply contract break | $($status.contract_break) |"
        "| Rollback image | $($status.rollback) |"
        "| Post-rollback old contract probe (expected fail) | $($status.post_rollback_probe) |"
        "| Recovery SQL | $($status.recovery_sql) |"
        "| Post-recovery old contract probe | $($status.post_recovery_probe) |"
        ""
        "## Acceptance Snapshot"
        "- A1 Pre-check PASS: " + $(if ($status.pre_probe -eq "PASS") { "yes" } else { "no" })
        "- A2 Contract-break applied: " + $(if ($status.contract_break -eq "PASS") { "yes" } else { "no" })
        "- A3 Rollback image does not restore legacy schema: " + $(if ($status.post_rollback_probe -eq "PASS_EXPECTED_FAIL") { "yes" } else { "no" })
        "- A4 Recovery restores compatibility: " + $(if ($status.post_recovery_probe -eq "PASS") { "yes" } else { "no" })
        "- A5 Rollback smoke is healthy: " + $(if ($status.rollback -eq "PASS") { "yes" } else { "no" })
        ""
        "## Failure Reason"
        $(if ([string]::IsNullOrWhiteSpace($failureMessage)) { "- none" } else { "- $failureMessage" })
    ) -join "`n"

    Set-Content -LiteralPath $summaryPath -Value $summary -Encoding UTF8
    Write-Host "Summary written: $summaryPath" -ForegroundColor Green
    Write-Host "Raw log written: $logPath" -ForegroundColor Green

    if ($verdict -ne "PASS") {
        exit 1
    }
}


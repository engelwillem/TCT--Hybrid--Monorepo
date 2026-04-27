param(
    [string]$Range = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Resolve-Range {
    if (-not [string]::IsNullOrWhiteSpace($Range)) {
        return $Range
    }

    $eventName = $env:GITHUB_EVENT_NAME
    if ($eventName -eq 'pull_request' -and -not [string]::IsNullOrWhiteSpace($env:GITHUB_BASE_REF)) {
        return "origin/$($env:GITHUB_BASE_REF)...HEAD"
    }

    if ($eventName -eq 'push' -and -not [string]::IsNullOrWhiteSpace($env:GITHUB_EVENT_BEFORE)) {
        return "$($env:GITHUB_EVENT_BEFORE)..HEAD"
    }

    $hasPrev = $true
    try {
        git rev-parse --verify HEAD~1 *> $null
    } catch {
        $hasPrev = $false
    }

    if ($hasPrev) {
        return 'HEAD~1..HEAD'
    }

    return ''
}

$resolvedRange = Resolve-Range
if (-not [string]::IsNullOrWhiteSpace($resolvedRange)) {
    Write-Host "Using diff range: $resolvedRange" -ForegroundColor Cyan
    $changed = @(git diff --name-only $resolvedRange)
} else {
    Write-Host 'No diff range detected and no previous commit available. Skipping strict hygiene diff check.' -ForegroundColor Yellow
    $changed = @()
}

$changed = $changed | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
if ($changed.Count -eq 0) {
    Write-Host 'No changed files detected for hygiene check.' -ForegroundColor Green
    exit 0
}

$violations = New-Object System.Collections.Generic.List[string]

foreach ($file in $changed) {
    $normalized = $file.Replace('\\', '/')

    if ($normalized -match '^(deliverables|backups|tmp|tmp-|tmp_|test-results|node_modules|\.next|\.npm-cache|\.playwright-mcp)/') {
        $violations.Add("Build/cache artifact must not be tracked: $normalized")
        continue
    }

    if ($normalized -match '^docs/' -and $normalized -notmatch '^docs/monitoring/' -and $normalized -ne 'docs/README.md') {
        $violations.Add("Docs outside docs/monitoring are disallowed by hygiene policy: $normalized")
        continue
    }

    if ($normalized -match '(^|/)\.codex-.*\.(log|err|bak)$') {
        $violations.Add("Codex local artifact detected: $normalized")
        continue
    }

    if ($normalized -match '(^|/)(\.tmp-|tmp-|tmp_).*(\.log|\.err|\.out\.log|\.html|\.json|\.txt)?$') {
        $violations.Add("Temporary artifact detected: $normalized")
        continue
    }

    if ($normalized -match '\.(zip|rar|7z|tar\.gz|vsix)$') {
        $violations.Add("Archive artifact must not be tracked: $normalized")
        continue
    }

    if ($normalized -match '^compose-resolved\.yml$') {
        $violations.Add("Generated compose output must not be tracked: $normalized")
        continue
    }
}

if ($violations.Count -gt 0) {
    Write-Host 'Repository hygiene check failed:' -ForegroundColor Red
    foreach ($v in $violations) {
        Write-Host "- $v" -ForegroundColor Red
    }
    exit 1
}

Write-Host 'Repository hygiene check passed.' -ForegroundColor Green
exit 0

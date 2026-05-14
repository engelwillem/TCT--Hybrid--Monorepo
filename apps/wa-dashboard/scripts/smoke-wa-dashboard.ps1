param(
  [string]$BaseUrl = "http://127.0.0.1:9012",
  [string]$Email = "admin@example.com",
  [string]$Password = "internet2026",
  [int]$TimeoutSec = 30
)

$ErrorActionPreference = "Stop"

function Assert-Status {
  param(
    [int]$Actual,
    [int[]]$Allowed,
    [string]$Label
  )
  if ($Allowed -notcontains $Actual) {
    throw "$Label failed (status=$Actual, expected=$($Allowed -join ','))"
  }
}

Write-Host "== WA Dashboard smoke =="

$root = Invoke-WebRequest "$BaseUrl/" -UseBasicParsing -TimeoutSec $TimeoutSec
Assert-Status -Actual $root.StatusCode -Allowed @(200) -Label "GET /"

$loginBody = @{
  email = $Email
  password = $Password
} | ConvertTo-Json -Compress

$login = Invoke-RestMethod "$BaseUrl/api/wa-proxy/login" -Method Post -ContentType "application/json" -Body $loginBody -TimeoutSec $TimeoutSec
if (-not $login.data.token) {
  throw "Login token missing from proxy response."
}

$token = [string]$login.data.token
$headers = @{
  Authorization = "Bearer $token"
  Accept = "application/json"
}

$profile = Invoke-WebRequest "$BaseUrl/api/wa-proxy/profile" -Headers $headers -UseBasicParsing -TimeoutSec $TimeoutSec
Assert-Status -Actual $profile.StatusCode -Allowed @(200) -Label "GET /api/wa-proxy/profile"

$dashboard = Invoke-WebRequest "$BaseUrl/api/wa-proxy/wa/dashboard" -Headers $headers -UseBasicParsing -TimeoutSec $TimeoutSec
Assert-Status -Actual $dashboard.StatusCode -Allowed @(200) -Label "GET /api/wa-proxy/wa/dashboard"

$reminders = Invoke-WebRequest "$BaseUrl/api/wa-proxy/wa/reminders?page=1&per_page=10" -Headers $headers -UseBasicParsing -TimeoutSec $TimeoutSec
Assert-Status -Actual $reminders.StatusCode -Allowed @(200) -Label "GET /api/wa-proxy/wa/reminders"

Write-Host "SMOKE_PASS"

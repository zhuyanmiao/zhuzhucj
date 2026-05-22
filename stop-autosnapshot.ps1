$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = Join-Path $repoRoot ".autosnapshot.pid"

if (-not (Test-Path -LiteralPath $pidFile)) {
  Write-Output "autosnapshot is not running"
  exit 0
}

$rawPid = Get-Content -LiteralPath $pidFile -ErrorAction SilentlyContinue | Select-Object -First 1
$trackedPid = 0
if (-not [int]::TryParse($rawPid, [ref]$trackedPid)) {
  Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
  Write-Output "autosnapshot pid file cleaned"
  exit 0
}

try {
  Stop-Process -Id $trackedPid -Force -ErrorAction Stop
} catch {
}

Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
Write-Output "autosnapshot stopped"

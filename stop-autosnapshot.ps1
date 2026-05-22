$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = Join-Path $repoRoot ".autosnapshot.pid"

if (-not (Test-Path -LiteralPath $pidFile)) {
  Write-Output "autosnapshot 当前未运行"
  exit 0
}

$rawPid = Get-Content -LiteralPath $pidFile -ErrorAction SilentlyContinue | Select-Object -First 1
$trackedPid = 0
if (-not [int]::TryParse($rawPid, [ref]$trackedPid)) {
  Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
  Write-Output "autosnapshot pid 文件已清理"
  exit 0
}

try {
  Stop-Process -Id $trackedPid -Force -ErrorAction Stop
} catch {
}

Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
Write-Output "autosnapshot 已停止"

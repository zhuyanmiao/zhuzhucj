$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = Join-Path $repoRoot ".autosnapshot.pid"
$watcherScript = Join-Path $repoRoot "autosnapshot.ps1"

if (Test-Path -LiteralPath $pidFile) {
  $rawPid = Get-Content -LiteralPath $pidFile -ErrorAction SilentlyContinue | Select-Object -First 1
  $trackedPid = 0
  if ([int]::TryParse($rawPid, [ref]$trackedPid)) {
    try {
      $existing = Get-Process -Id $trackedPid -ErrorAction Stop
      if ($null -ne $existing) {
        Write-Output "autosnapshot 已在运行，PID=$trackedPid"
        exit 0
      }
    } catch {
    }
  }
}

Start-Process -FilePath "powershell.exe" `
  -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $watcherScript) `
  -WorkingDirectory $repoRoot `
  -WindowStyle Hidden

Write-Output "autosnapshot 已启动"

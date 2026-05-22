$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = Join-Path $repoRoot ".autosnapshot.pid"
$logFile = Join-Path $repoRoot ".autosnapshot.log"
$debounceMs = 1500
$watchPatterns = @("*.html", "*.css", "*.js", "*.json", "*.md")

function Write-Log {
  param([string]$Message)
  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Add-Content -LiteralPath $logFile -Value "[$timestamp] $Message"
}

function Test-TrackedProcess {
  if (-not (Test-Path -LiteralPath $pidFile)) {
    return $false
  }

  $rawPid = (Get-Content -LiteralPath $pidFile -ErrorAction SilentlyContinue | Select-Object -First 1)
  if (-not $rawPid) {
    return $false
  }

  $trackedPid = 0
  if (-not [int]::TryParse($rawPid, [ref]$trackedPid)) {
    return $false
  }

  if ($trackedPid -eq $PID) {
    return $false
  }

  try {
    $process = Get-Process -Id $trackedPid -ErrorAction Stop
    return $null -ne $process
  } catch {
    return $false
  }
}

function Commit-IfChanged {
  Push-Location $repoRoot
  try {
    git add -A | Out-Null
    git diff --cached --quiet --exit-code
    if ($LASTEXITCODE -eq 0) {
      return
    }

    $message = "autosave: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git commit -m $message | Out-Null
    Write-Log "Committed snapshot: $message"
  } finally {
    Pop-Location
  }
}

if (Test-TrackedProcess) {
  Write-Log "Skipped start because another autosnapshot process is already running."
  exit 0
}

Set-Content -LiteralPath $pidFile -Value $PID
Write-Log "Autosnapshot watcher started."

$watchers = @()
$subscriptions = @()

try {
  foreach ($pattern in $watchPatterns) {
    $watcher = New-Object System.IO.FileSystemWatcher
    $watcher.Path = $repoRoot
    $watcher.Filter = $pattern
    $watcher.IncludeSubdirectories = $false
    $watcher.NotifyFilter = [System.IO.NotifyFilters]'FileName, LastWrite, Size, CreationTime'
    $watcher.EnableRaisingEvents = $true
    $watchers += $watcher

    $subscriptions += Register-ObjectEvent -InputObject $watcher -EventName Changed -SourceIdentifier "autosnapshot-$pattern-changed" -Action {}
    $subscriptions += Register-ObjectEvent -InputObject $watcher -EventName Created -SourceIdentifier "autosnapshot-$pattern-created" -Action {}
    $subscriptions += Register-ObjectEvent -InputObject $watcher -EventName Deleted -SourceIdentifier "autosnapshot-$pattern-deleted" -Action {}
    $subscriptions += Register-ObjectEvent -InputObject $watcher -EventName Renamed -SourceIdentifier "autosnapshot-$pattern-renamed" -Action {}
  }

  while ($true) {
    $event = Wait-Event -Timeout 2
    if ($null -eq $event) {
      continue
    }

    while ($null -ne (Wait-Event -Timeout ($debounceMs / 1000))) {
    }

    Get-Event | Remove-Event
    try {
      Commit-IfChanged
    } catch {
      Write-Log "Commit failed: $($_.Exception.Message)"
    }
  }
} finally {
  foreach ($subscription in $subscriptions) {
    if ($null -ne $subscription) {
      Unregister-Event -SubscriptionId $subscription.Id -ErrorAction SilentlyContinue
    }
  }

  foreach ($watcher in $watchers) {
    if ($null -ne $watcher) {
      $watcher.EnableRaisingEvents = $false
      $watcher.Dispose()
    }
  }

  if ((Test-Path -LiteralPath $pidFile) -and ((Get-Content -LiteralPath $pidFile -ErrorAction SilentlyContinue | Select-Object -First 1) -eq "$PID")) {
    Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
  }

  Write-Log "Autosnapshot watcher stopped."
}

# One-click deploy to CloudBase static hosting
# Requires: tcb CLI logged in (tcb env list shows la-shi-d9g35yrnaef3ef5b9)
# NOTE: CloudBase entry is /index.html, so local game.html is uploaded as /index.html
$env:FORCE_COLOR = '0'
$base = Split-Path -Parent $MyInvocation.MyCommand.Path
$envId = 'la-shi-d9g35yrnaef3ef5b9'

Write-Output "=== Deploy to CloudBase [$envId] ==="
$tasks = @(
  @{ Local = "$base/game.html";  Cloud = '/index.html' },
  @{ Local = "$base/cloud.js";   Cloud = '/cloud.js' },
  @{ Local = "$base/config.js";  Cloud = '/config.js' }
)
foreach ($t in $tasks) {
  if (-not (Test-Path $t.Local)) { throw "Local file not found: $($t.Local)" }
  Write-Output "-> $($t.Local) => $($t.Cloud)"
  & tcb hosting deploy $t.Local $t.Cloud -e $envId 2>&1 | ForEach-Object {
    $s = $_ -replace "`e\[[0-9;]*m", ''
    if ($s -match 'Deploy|upload|done|Deploy complete|error|FAIL') { Write-Output $s }
  }
  if ($LASTEXITCODE -ne 0) { throw "Upload failed: $($t.Local)" }
}
Write-Output "=== DONE ==="
Write-Output "Game: https://la-shi-d9g35yrnaef3ef5b9-1359624150.tcloudbaseapp.com/"
Write-Output "Short: https://kegaiisyou.github.io/la-shi/ (iframe wrapper, no change needed)"

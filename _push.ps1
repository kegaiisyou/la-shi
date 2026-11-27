cmd /c "c:/Users/Administrator/CodeBuddy/拉屎/_cred.bat" 2>$null | Out-Null
$credPath = Join-Path $env:TEMP 'gitcredout.txt'
$lines = Get-Content $credPath
[System.IO.File]::Delete($credPath)
[System.IO.File]::Delete((Join-Path $env:TEMP 'gitcrederr.txt'))
$tok = ($lines | Where-Object { $_ -like 'password=*' }) -replace 'password=',''
if (-not $tok) { throw 'No git token' }
$repo = "c:/Users/Administrator/CodeBuddy/拉屎"
& git -C $repo add -A 2>&1 | Out-Null
& git -C $repo commit -m "feat: 便池存档 + 冲马桶入袋（满5冲水，背包累计）" 2>&1 | Out-Null
$url = "https://kegaiisyou:$tok@gh-proxy.com/https://github.com/kegaiisyou/la-shi.git"
$env:GIT_TERMINAL_PROMPT = '0'
& git -C $repo push $url main 2>&1 | ForEach-Object { if ($_ -match 'main|error|rejected') { Write-Output $_ } }
& git -C $repo remote set-url origin "https://gh-proxy.com/https://github.com/kegaiisyou/la-shi.git"

# Builds dist\sheets_merge_sender-v<version>.zip for sending to a friend.
# Usage:  powershell -ExecutionPolicy Bypass -File scripts\make_release.ps1
# Version comes from backend\package.json (bump it first: cd backend; npm version patch --no-git-tag-version)
$ErrorActionPreference = "Stop"
$root    = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $root "backend"
$version = (Get-Content (Join-Path $backend "package.json") -Raw | ConvertFrom-Json).version
$name    = "sheets_merge_sender-v$version"
$stage   = Join-Path $root "dist\$name"
$zip     = Join-Path $root "dist\$name.zip"

if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
if (Test-Path $zip)   { Remove-Item $zip -Force }
New-Item -ItemType Directory -Path "$stage\backend" -Force | Out-Null

# App files only - never .env, settings.json, test_output, node_modules or the real MergeList.xlsx
foreach ($f in "server.js","sheets_merge_sender_browser.html","package.json","package-lock.json") {
  Copy-Item (Join-Path $backend $f) "$stage\backend\$f"
}
Copy-Item (Join-Path $PSScriptRoot "release_start.bat") "$stage\start.bat"
Copy-Item (Join-Path $root "USER_GUIDE.md") $stage

# Production dependencies, installed fresh (pure-JS packages, so they run on any Windows box)
Push-Location "$stage\backend"
npm install --omit=dev --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "npm install failed" }
Pop-Location

# Portable Node (latest v22 LTS) so the friend installs nothing; cached between builds
$cache = Join-Path $root "dist\cache"
New-Item -ItemType Directory -Path $cache -Force | Out-Null
$rel = (Invoke-RestMethod "https://nodejs.org/dist/index.json") | Where-Object { $_.version -like "v22.*" } | Select-Object -First 1
$nodeZip = Join-Path $cache "node-$($rel.version)-win-x64.zip"
if (-not (Test-Path $nodeZip)) {
  Invoke-WebRequest "https://nodejs.org/dist/$($rel.version)/node-$($rel.version)-win-x64.zip" -OutFile $nodeZip
}
$tmp = Join-Path $cache "x"
if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
Expand-Archive $nodeZip $tmp
New-Item -ItemType Directory -Path "$stage\runtime" -Force | Out-Null
Copy-Item "$tmp\node-$($rel.version)-win-x64\node.exe" "$stage\runtime\node.exe"
Copy-Item "$tmp\node-$($rel.version)-win-x64\LICENSE" "$stage\runtime\NODE_LICENSE.txt"
Remove-Item $tmp -Recurse -Force
Copy-Item (Join-Path $root "LICENSE") $stage

# Sanitized env template: keep structure, drop the author's personal numbers/addresses
$env = Get-Content (Join-Path $backend "env.example") |
  ForEach-Object {
    $_ -replace '^(TWILIO_PHONE_NUMBER)=.*', '$1=+15551234567' `
       -replace '^(SECRETARY_EMAIL)=.*',     '$1=secretary@example.com' `
       -replace '^(TEST_PHONE_NUMBER)=.*',   '$1=+15557654321' `
       -replace '^(TEST_EMAIL_ADDR)=.*',     '$1=you@example.com'
  }
Set-Content "$stage\backend\env.example" $env -Encoding ascii

# Sample spreadsheet with fake data
node (Join-Path $PSScriptRoot "make_sample_xlsx.js") "$stage\SampleMergeList.xlsx"
if ($LASTEXITCODE -ne 0) { throw "sample xlsx generation failed" }

@"
Sheets Merge Sender v$version
=============================

1. Unzip the whole folder somewhere (e.g. your Documents). Do not run from inside the zip.
2. Double-click start.bat. Nothing needs installing - Node is included.
3. First run opens backend\.env in Notepad: enter YOUR Twilio / Gmail details, save, close.
4. Your browser opens to http://localhost:3000 - pick your spreadsheet.
   SampleMergeList.xlsx shows the expected format (sheets: List, Template).

Start with Preview / Test File modes - they send nothing.
See USER_GUIDE.md for full details.
"@ | Set-Content "$stage\README_FIRST.txt" -Encoding ascii

Compress-Archive -Path (Join-Path $stage "*") -DestinationPath $zip
Write-Host "Created $zip"
Get-ChildItem $stage -Recurse -File | Where-Object { $_.FullName -notlike "*node_modules*" } | ForEach-Object { "  " + $_.FullName.Substring($stage.Length + 1) }

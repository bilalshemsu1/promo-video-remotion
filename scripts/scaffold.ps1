# Usage: powershell -File scaffold.ps1 <dest-folder>
param([Parameter(Mandatory=$true)][string]$Dest)
$here = Split-Path -Parent $PSScriptRoot
New-Item -ItemType Directory -Force -Path $Dest | Out-Null
Copy-Item -Recurse -Force "$here\assets\starter-project\*" $Dest
Set-Location $Dest
npm install
$py = if (Get-Command py -ErrorAction SilentlyContinue) { "py" } else { "python" }
& $py -m pip install numpy -q
& $py scripts\make_audio.py
npx tsc --noEmit
Write-Host "Next: npm start | pip install edge-tts; npm run vo | npm run render"

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Require-Command($Name, $InstallHint) {
  if (!(Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "$Name nao encontrado. $InstallHint"
  }
}

Require-Command node "Instale Node.js 22+."
Require-Command npm "Instale npm junto com Node.js."

if (!(Get-Command py -ErrorAction SilentlyContinue) -and !(Get-Command python -ErrorAction SilentlyContinue)) {
  throw "Python 3 nao encontrado. Instale Python 3.12+."
}

if (!(Test-Path ".env.local") -and (Test-Path ".env.example")) {
  Copy-Item ".env.example" ".env.local"
  Write-Host "Criado .env.local a partir do exemplo."
}

if (!(Test-Path ".env.worker") -and (Test-Path ".env.worker.example")) {
  Copy-Item ".env.worker.example" ".env.worker"
  Write-Host "Criado .env.worker a partir do exemplo."
}

if (!(Test-Path "node_modules")) {
  npm install
}

if (!(Test-Path ".venv\Scripts\python.exe")) {
  $python = if (Get-Command py -ErrorAction SilentlyContinue) { "py -3" } else { "python" }
  Invoke-Expression "$python -m venv .venv"
}

& ".venv\Scripts\python.exe" -m pip install --upgrade pip
& ".venv\Scripts\python.exe" -m pip install -e ".\workers\rfb_cnpj[test]"

New-Item -ItemType Directory -Force "$env:USERPROFILE\ProspectaNicho\RFB" | Out-Null
New-Item -ItemType Directory -Force "$env:USERPROFILE\ProspectaNicho\Exports" | Out-Null
New-Item -ItemType Directory -Force "logs" | Out-Null

npm run check:env
& ".venv\Scripts\python.exe" -m workers.rfb_cnpj data status

Write-Host ""
Write-Host "Instalacao local preparada."
Write-Host "Proximos comandos:"
Write-Host "1. setup-dados-receita.bat"
Write-Host "2. start-prospectanicho-worker.bat <job-id>"

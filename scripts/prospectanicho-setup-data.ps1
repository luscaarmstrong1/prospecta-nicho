param(
  [switch]$Yes,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Find-Python {
  $python = Get-Command py -ErrorAction SilentlyContinue
  if ($python) { return "py -3" }
  $python = Get-Command python -ErrorAction SilentlyContinue
  if ($python) { return "python" }
  throw "Python 3 nao encontrado. Instale o Python 3.12+ antes de continuar."
}

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$pythonCommand = Find-Python
$venvPython = Join-Path $root ".venv\Scripts\python.exe"

if (!(Test-Path $venvPython)) {
  Write-Host "Criando ambiente Python local..."
  Invoke-Expression "$pythonCommand -m venv .venv"
}

Write-Host "Instalando dependencias do worker..."
& $venvPython -m pip install --upgrade pip
& $venvPython -m pip install -e ".\workers\rfb_cnpj[test]"

if (!(Test-Path ".env.worker")) {
  Copy-Item ".env.worker.example" ".env.worker"
  Write-Host "Criado .env.worker a partir do exemplo. Preencha Supabase quando for processar jobs reais."
}

$argsList = @("-m", "workers.rfb_cnpj", "data", "setup")
if ($Yes) { $argsList += "--yes" }
if ($DryRun) { $argsList += "--dry-run" }

& $venvPython @argsList
Write-Host ""
Write-Host "Setup de dados finalizado. Para validar depois, execute status-prospectanicho.bat."

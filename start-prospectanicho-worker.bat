@echo off
setlocal
cd /d "%~dp0"
if exist ".venv\Scripts\python.exe" (
  ".venv\Scripts\python.exe" -m workers.rfb_cnpj run-job --job-id %1
) else (
  python -m workers.rfb_cnpj run-job --job-id %1
)
pause

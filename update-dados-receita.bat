@echo off
setlocal
cd /d "%~dp0"
if exist ".venv\Scripts\python.exe" (
  ".venv\Scripts\python.exe" -m workers.rfb_cnpj data update
) else (
  python -m workers.rfb_cnpj data update
)
pause

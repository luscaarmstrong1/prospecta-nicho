@echo off
setlocal
cd /d "%~dp0"
set /p REQUEST_CODE=Informe o protocolo publico, exemplo PN-ABC123:
if "%RFB_CNPJ_OUTPUT_DIR%"=="" set "RFB_CNPJ_OUTPUT_DIR=%USERPROFILE%\ProspectaNicho\Exports"
if exist ".venv\Scripts\python.exe" (
  ".venv\Scripts\python.exe" -m workers.rfb_cnpj open-export --request-code "%REQUEST_CODE%"
) else (
  python -m workers.rfb_cnpj open-export --request-code "%REQUEST_CODE%"
)
pause

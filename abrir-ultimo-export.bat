@echo off
setlocal
if "%RFB_CNPJ_OUTPUT_DIR%"=="" set "RFB_CNPJ_OUTPUT_DIR=%USERPROFILE%\ProspectaNicho\Exports"
if not exist "%RFB_CNPJ_OUTPUT_DIR%" (
  echo Pasta de exports nao encontrada: %RFB_CNPJ_OUTPUT_DIR%
  pause
  exit /b 1
)
for /f "delims=" %%D in ('dir "%RFB_CNPJ_OUTPUT_DIR%" /ad /b /o-d 2^>nul') do (
  start "" "%RFB_CNPJ_OUTPUT_DIR%\%%D"
  exit /b 0
)
echo Nenhuma pasta de protocolo encontrada em %RFB_CNPJ_OUTPUT_DIR%.
pause

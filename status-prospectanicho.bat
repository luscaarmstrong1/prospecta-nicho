@echo off
setlocal
cd /d "%~dp0"

if exist ".env.worker" (
  for /f "usebackq eol=# tokens=1,* delims==" %%A in (".env.worker") do (
    if not "%%A"=="" set "%%A=%%B"
  )
)

if "%EXPORT_DELIVERY_MODE%"=="" set "EXPORT_DELIVERY_MODE=local"
if "%RFB_CNPJ_OUTPUT_DIR%"=="" set "RFB_CNPJ_OUTPUT_DIR=%USERPROFILE%\ProspectaNicho\Exports"
if "%MINHA_RECEITA_CACHE_DIR%"=="" set "MINHA_RECEITA_CACHE_DIR=%USERPROFILE%\ProspectaNicho\Cache"

echo ProspectaNicho - status local
echo --------------------------------
if "%SUPABASE_URL%"=="" (echo Supabase: AUSENTE) else (echo Supabase: OK)
echo Modo de entrega: %EXPORT_DELIVERY_MODE%
echo Pasta de exports: %RFB_CNPJ_OUTPUT_DIR%
if exist "%RFB_CNPJ_OUTPUT_DIR%" (echo Export folder: OK) else (echo Export folder: AUSENTE)
if exist "%MINHA_RECEITA_CACHE_DIR%" (echo Cache local: OK) else (echo Cache local: AUSENTE)
echo.
echo Minha Receita:
if exist ".venv\Scripts\python.exe" (
  ".venv\Scripts\python.exe" -m workers.rfb_cnpj provider health
) else (
  python -m workers.rfb_cnpj provider health
)
pause

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

if "%SUPABASE_URL%"=="" (
  echo SUPABASE_URL ausente em .env.worker.
  pause
  exit /b 1
)
if "%SUPABASE_SERVICE_ROLE_KEY%"=="" (
  echo SUPABASE_SERVICE_ROLE_KEY ausente em .env.worker.
  pause
  exit /b 1
)

if not exist "%RFB_CNPJ_OUTPUT_DIR%" mkdir "%RFB_CNPJ_OUTPUT_DIR%"
if not exist "%MINHA_RECEITA_CACHE_DIR%" mkdir "%MINHA_RECEITA_CACHE_DIR%"

if exist ".venv\Scripts\python.exe" (
  ".venv\Scripts\python.exe" -m workers.rfb_cnpj provider health
  ".venv\Scripts\python.exe" -m workers.rfb_cnpj watch
) else (
  python -m workers.rfb_cnpj provider health
  python -m workers.rfb_cnpj watch
)
pause

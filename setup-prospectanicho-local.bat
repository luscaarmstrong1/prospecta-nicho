@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\setup-prospectanicho-local.ps1"
pause

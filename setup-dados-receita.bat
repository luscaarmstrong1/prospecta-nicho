@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\prospectanicho-setup-data.ps1"
pause

@echo off
title Elocia - pasang subtitle otomatis
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0pasang-otomatis.ps1"
schtasks /run /tn "Elocia Subtitle" >nul 2>&1
pause

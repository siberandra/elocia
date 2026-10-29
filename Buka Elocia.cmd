@echo off
title Elocia - biarkan jendela ini terbuka selama belajar
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js belum terpasang. Pasang dari https://nodejs.org lalu jalankan lagi.
  pause
  exit /b 1
)
node serve.js %*
if errorlevel 1 pause

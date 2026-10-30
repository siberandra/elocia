@echo off
title Elocia - membuat subtitle (boleh diminimize)
cd /d "%~dp0\..\.."
if not exist "%LOCALAPPDATA%\Elocia\whisper\Scripts\python.exe" (
  echo Semua subtitle sudah selesai dan alat Whisper sudah dihapus.
  pause
  exit /b 0
)
set HF_HUB_DISABLE_SYMLINKS_WARNING=1
set PYTHONWARNINGS=ignore
"%LOCALAPPDATA%\Elocia\whisper\Scripts\python.exe" tools\subtitles\make_subs.py --cleanup-when-done
pause

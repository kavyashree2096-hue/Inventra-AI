@echo off
title Inventra AI - Backend

cd /d "%~dp0"

echo ====================================
echo Starting Inventra AI Flask Backend
echo ====================================

if not exist ".venv\Scripts\python.exe" (
    echo Virtual environment not found!
    pause
    exit /b 1
)

echo Launching Flask backend...

".venv\Scripts\python.exe" app.py

pause
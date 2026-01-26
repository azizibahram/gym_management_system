@echo off
setlocal EnableDelayedExpansion

REM Set force reset flag if argument provided
set force_reset=0
if "%1"=="--reset" set force_reset=1

REM Navigate to backend directory if not already there
if not exist "manage.py" (
    if exist "backend\manage.py" (
        cd backend
    ) else (
        echo Error: Django manage.py not found. Please run this script from the project root or backend directory.
        pause
        exit /b 1
    )
)

REM Check if .venv exists and has all required packages
set valid=0
if exist ".venv" (
    call .venv\Scripts\activate.bat
    if !missing! EQU 0 (
        echo All packages installed.
        set valid=1
    )
)
REM Start Django server
echo Starting Django development server...
python manage.py runserver

pause
@echo off
setlocal EnableExtensions EnableDelayedExpansion

echo ================================
echo   Django Auto Runner (Windows)
echo ================================

REM Move to script directory
cd /d "%~dp0"

REM If backend folder exists, enter it
if exist "backend\manage.py" (
    cd backend
)

REM Ensure manage.py exists
if not exist "manage.py" (
    echo ERROR: manage.py not found!
    pause
    exit /b 1
)

REM Create virtual environment if missing
if not exist "venv\Scripts\activate.bat" (
    echo Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment
        pause
        exit /b 1
    )
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERROR: Failed to activate virtual environment
    pause
    exit /b 1
)

REM Show active python (debug)
echo Using Python:
where python
echo.

REM Upgrade pip
python -m pip install --upgrade pip

REM Install dependencies if requirements.txt exists
if exist "requirements.txt" (
    echo Installing dependencies...
    pip install -r requirements.txt
)

REM Django checks
echo Running Django checks...
python manage.py check
if errorlevel 1 (
    echo ERROR: Django check failed
    pause
    exit /b 1
)

REM Migrations
echo Making migrations...
python manage.py makemigrations
python manage.py migrate

REM Run server
echo ================================
echo Starting Django Server...
echo ================================
python manage.py runserver

pause
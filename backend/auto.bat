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
    set missing=0
    for /f "usebackq tokens=*" %%i in (`findstr /r /v "^#" requirements.txt`) do (
        for /f "tokens=1 delims==" %%p in ("%%i") do (
            pip show %%p >nul 2>&1 || (
                echo Installing missing package: %%p
                pip install %%p --timeout 100
                set missing=1
            )
        )
    )
    if !missing! EQU 0 (
        echo All packages installed.
        set valid=1
    )
) else (
    echo Virtual environment not found. Creating a new one.
    python -m venv .venv
    call .venv\Scripts\activate.bat
    pip install -r requirements.txt --timeout 100
    set valid=1
)

REM Check if migrations exist
set has_migrations=0
if exist "gym\migrations\0001_initial.py" (
    set has_migrations=1
)

REM Reset migrations if none exist or if force reset is enabled
if !has_migrations!==0 (
    echo No migrations found. Full reset required.
    set do_reset=1
) else (
    if !force_reset!==1 (
        echo Force reset enabled.
        set do_reset=1
    ) else (
        echo Existing migrations found. Using them.
        set do_reset=0
    )
)

if !do_reset!==1 (
    echo Resetting migrations...
    
    REM Delete database if exists
    if exist "db.sqlite3" del /q "db.sqlite3"
    
    REM Clean migrations and __pycache__ in gym app
    if exist "gym\migrations" (
        rmdir /s /q "gym\migrations"
        mkdir "gym\migrations"
        type nul > "gym\migrations\__init__.py"
    )
    if exist "gym\__pycache__" (
        rmdir /s /q "gym\__pycache__"
    )
    if exist "gymsystem\__pycache__" (
        rmdir /s /q "gymsystem\__pycache__"
    )
)

REM Make and apply migrations for gym app
python manage.py makemigrations gym
python manage.py migrate

REM Create superuser if it doesn't exist
echo Creating superuser (admin/admin)...
python create_superuser.py

REM Start Django server
echo Starting Django development server...
python manage.py runserver

pause
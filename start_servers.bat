@echo off
setlocal EnableDelayedExpansion
title ENERGY GYM SYSTEM - Backend Launcher

:: =========================================================
::  ENERGY GYM SYSTEM
:: ---------------------------------------------------------
::  Designer & Developer : Bahram Azizi
::  System Type          : Backend + Frontend Service Launcher
::  Environment          : Windows (CMD)
:: =========================================================

echo.
echo =========================================================
echo        ENERGY GYM SYSTEM
echo        Backend + Frontend Startup
echo =========================================================
echo        Designer and Developer: Bahram Azizi
echo =========================================================
echo.

:: ---------------------------------------------------------
:: Move to project root directory
:: ---------------------------------------------------------
cd /d "%~dp0"

:: ---------------------------------------------------------
:: FRONTEND BUILD (if changes detected)
:: ---------------------------------------------------------
echo [INFO] Checking frontend for changes...
echo.

cd frontend

:: Check if dist folder exists
if not exist "dist" (
    echo [WARNING] dist folder not found. Building frontend...
    call npm run build
    if errorlevel 1 (
        echo.
        echo [ERROR] Frontend build failed!
        echo [ACTION] Check npm and dependencies.
        pause
        exit /b 1
    )
    echo [SUCCESS] Frontend built successfully.
    echo.
) else (
    :: Check if any source files are newer than dist
    :: Using a simple approach: check if src folder has newer files
    for /f %%A in ('powershell -Command "if ((Get-Item -Path 'src' -Recurse | Where-Object {$_.LastWriteTime -gt (Get-Item 'dist').LastWriteTime} | Measure-Object).Count -gt 0) { Write-Host 'true' } else { Write-Host 'false' }"') do set REBUILD_NEEDED=%%A
    
    if "!REBUILD_NEEDED!"=="true" (
        echo [INFO] Source changes detected. Rebuilding frontend...
        call npm run build
        if errorlevel 1 (
            echo.
            echo [ERROR] Frontend build failed!
            echo [ACTION] Check npm and dependencies.
            pause
            exit /b 1
        )
        echo [SUCCESS] Frontend rebuilt successfully.
        echo.
    ) else (
        echo [INFO] No frontend changes detected. Skipping build.
        echo.
    )
)

:: Copy dist to backend staticfiles
echo [INFO] Copying frontend dist to backend staticfiles...
set DIST_PATH=%cd%\dist
set STATIC_PATH=..\backend\staticfiles

:: Remove old staticfiles if it exists
if exist "!STATIC_PATH!" (
    echo [INFO] Clearing old staticfiles...
    rmdir /s /q "!STATIC_PATH!" >nul 2>&1
)

:: Create staticfiles directory
mkdir "!STATIC_PATH!" >nul 2>&1

:: Copy dist contents to staticfiles
xcopy "!DIST_PATH!" "!STATIC_PATH!" /E /I /Y >nul 2>&1
if errorlevel 1 (
    echo.
    echo [ERROR] Failed to copy dist to staticfiles!
    echo [ACTION] Check file permissions.
    pause
    exit /b 1
)

echo [SUCCESS] Frontend dist copied to staticfiles.
echo.

:: ---------------------------------------------------------
:: BACKEND STARTUP
:: ---------------------------------------------------------
echo [INFO] Initializing backend service...
echo.

cd ..\backend

:: Activate Python virtual environment
echo [INFO] Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo.
    echo [ERROR] Virtual environment activation failed!
    echo [ACTION] Please verify that venv exists.
    pause
    exit /b 1
)

echo [SUCCESS] Virtual environment activated.
echo.

:: Start backend using Waitress (non-blocking)
echo [INFO] Starting backend server...
start /b waitress-serve.exe --listen=127.0.0.1:8000 gymsystem.wsgi:application

:: Give server time to boot
timeout /t 3 >nul

:: Open system in browser
echo [INFO] Launching system in browser...
start http://127.0.0.1:8000

echo.
echo =========================================================
echo  ENERGY GYM SYSTEM is now running
echo =========================================================
echo  Backend: http://127.0.0.1:8000
echo  Frontend: Served from staticfiles
echo =========================================================
echo.
echo Press any key to close this window.
pause >nul
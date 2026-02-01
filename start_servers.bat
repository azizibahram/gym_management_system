@echo off
setlocal EnableDelayedExpansion
title ENERGY GYM SYSTEM - Backend Launcher

:: =========================================================
::  ENERGY GYM SYSTEM
:: ---------------------------------------------------------
::  Designer & Developer : Bahram Azizi
::  System Type          : Backend Service Launcher
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
:: BACKEND STARTUP
:: ---------------------------------------------------------
echo [INFO] Initializing backend service...
echo.

cd backend

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
timeout /t 2 >nul

:: Open system in browser
echo [INFO] Launching system in browser...
start http://127.0.0.1:8000

echo.
echo =========================================================
echo  ENERGY GYM SYSTEM is now running
echo =========================================================
echo.
echo Press any key to close this window.
pause >nul
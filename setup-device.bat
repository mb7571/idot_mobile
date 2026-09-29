@echo off
setlocal enabledelayedexpansion
echo ========================================
echo   iDOT - Physical Device Setup
echo ========================================
echo.

:: Set environment
set JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot
set ANDROID_HOME=C:\Users\LapCare\AppData\Local\Android\Sdk
set PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%

echo Step 1: Detecting machine IP address...
echo.

:: Get the primary IP address (first active adapter with IPv4)
set "MACHINE_IP="
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    if not defined MACHINE_IP (
        set "RAW=%%a"
        set "MACHINE_IP=!RAW: =!"
        if "!MACHINE_IP!"=="127.0.0.1" set "MACHINE_IP="
    )
)

if not defined MACHINE_IP (
    echo ERROR: Could not detect IP address!
    echo Make sure you are connected to a network.
    echo.
    echo You can manually set IP in src\api\client.js:
    echo   const API_BASE_URL = 'http://YOUR_IP:8000/api';
    pause
    exit /b 1
)

echo Detected IP: !MACHINE_IP!
echo.

echo Step 2: Checking ADB connection...
adb devices
echo.

echo Step 3: Setting up port forwarding...
echo.

:: Forward Metro bundler port (8081)
echo Setting up Metro port forwarding (8081^)...
adb reverse tcp:8081 tcp:8081
if !errorlevel! equ 0 (
    echo   [OK] Metro port 8081 forwarded successfully
) else (
    echo   [FAIL] Failed to forward Metro port 8081
    echo     Make sure your device is connected via USB and USB debugging is enabled
)
echo.

:: Forward Laravel API port (8000)
echo Setting up API port forwarding (8000^)...
adb reverse tcp:8000 tcp:8000
if !errorlevel! equ 0 (
    echo   [OK] API port 8000 forwarded successfully
) else (
    echo   [FAIL] Failed to forward API port 8000
    echo     Make sure Laravel server is running
)
echo.

echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Detected Machine IP: !MACHINE_IP!
echo.
echo Next steps:
echo   1. Start Metro bundler:     npm start
echo   2. Start Laravel server:    cd ..\idot-backend ^& php artisan serve --host=0.0.0.0 --port=8000
echo   3. Run the app:             npm run android
echo.
echo If API still doesn't connect, update API_BASE_URL in src\api\client.js:
echo   const API_BASE_URL = 'http://!MACHINE_IP!:8000/api';
echo.
echo ========================================
pause

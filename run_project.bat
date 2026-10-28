@echo off
title Vehicle Service and Maintenance Analytics
echo =======================================================
echo Starting Vehicle Service and Maintenance Analytics
echo =======================================================
echo.

:: 1. Check if mongod is already running
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] MongoDB is already running.
) else (
    echo [INFO] Starting local MongoDB Community Server on port 27017...
    if not exist "%LOCALAPPDATA%\VehicleMaintenanceDB_data" mkdir "%LOCALAPPDATA%\VehicleMaintenanceDB_data"
    start "MongoDB Server" /min "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "%LOCALAPPDATA%\VehicleMaintenanceDB_data" --port 27017 --bind_ip 127.0.0.1
    timeout /t 3 /nobreak >nul
)

:: 2. Start Node.js Express server
echo [INFO] Starting Node.js Express backend server on port 5000...
echo.
echo =======================================================
echo  Web Dashboard: http://localhost:5000
echo =======================================================
echo.
echo Press Ctrl+C to stop the server at any time.
echo.

node server/server.js
pause

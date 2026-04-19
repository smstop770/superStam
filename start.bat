@echo off
echo Starting Super STaM...

REM Start server
start "Super-STaM Server" cmd /k "cd /d %~dp0server && npm run dev"

REM Wait 3 seconds for server to boot
timeout /t 3 /nobreak >nul

REM Start client
start "Super-STaM Client" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo Server:  http://localhost:4000
echo Client:  http://localhost:5173
echo Admin:   http://localhost:5173/admin
echo.
echo Press any key to exit...
pause >nul

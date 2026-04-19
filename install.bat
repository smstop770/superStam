@echo off
echo Installing Super STaM dependencies...
echo.

echo [1/2] Installing server dependencies...
cd /d %~dp0server
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Server install failed!
    pause
    exit /b 1
)

echo.
echo [2/2] Installing client dependencies...
cd /d %~dp0client
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Client install failed!
    pause
    exit /b 1
)

echo.
echo ================================================
echo  Installation complete!
echo  Run start.bat to launch the application.
echo ================================================
echo.
pause

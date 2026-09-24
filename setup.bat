@echo off
echo ==============================================
echo   Blueprint.ai - Quick Setup ^& Start
echo ==============================================
echo.
echo [1/2] Installing dependencies across all workspaces...
call npm install
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to install dependencies. Please ensure Node.js is installed.
    pause
    exit /b %errorlevel%
)
echo.
echo [2/2] Launching Blueprint.ai dev servers...
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3001
echo.
call npm run dev
pause

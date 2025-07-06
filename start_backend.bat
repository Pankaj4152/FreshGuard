@echo off
REM FreshGuard 2.0 - Backend Startup Script for Windows

echo.
echo =====================================================
echo   🚀 FreshGuard 2.0 Backend Server Startup
echo =====================================================
echo.

echo 📁 Navigating to backend directory...
cd /d "%~dp0backend\api"

echo 🔍 Checking if app.py exists...
if not exist "app.py" (
    echo ❌ Error: app.py not found!
    echo    Make sure you're running this from the FreshGuard root directory
    pause
    exit /b 1
)

echo ✅ Found app.py

echo.
echo 🌐 Starting Flask backend server...
echo    Server will be available at: http://localhost:5000
echo    Press Ctrl+C to stop the server
echo.
echo =====================================================

python app.py

echo.
echo 🛑 Backend server stopped
pause

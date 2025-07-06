@echo off
REM FreshGuard 2.0 - Frontend Startup Script for Windows

echo.
echo =====================================================
echo   🎨 FreshGuard 2.0 Frontend Development Server
echo =====================================================
echo.

echo 📁 Navigating to frontend directory...
cd /d "%~dp0frontend"

echo 🔍 Checking if package.json exists...
if not exist "package.json" (
    echo ❌ Error: package.json not found!
    echo    Make sure you're running this from the FreshGuard root directory
    pause
    exit /b 1
)

echo ✅ Found package.json

echo.
echo 📦 Installing dependencies (if needed)...
if not exist "node_modules" (
    echo Installing npm packages...
    npm install
    if errorlevel 1 (
        echo ❌ Error installing dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
) else (
    echo ✅ Dependencies already installed
)

echo.
echo 🌐 Starting React development server...
echo    Server will be available at: http://localhost:3000
echo    Browser will open automatically
echo    Press Ctrl+C to stop the server
echo.
echo =====================================================

npm start

echo.
echo 🛑 Frontend development server stopped
pause

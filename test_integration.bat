@echo off
REM FreshGuard 2.0 - Integration Test Script for Windows

echo.
echo =====================================================
echo   🧪 FreshGuard 2.0 Integration Test Suite
echo =====================================================
echo.

echo 🔍 Checking Python availability...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found! Please install Python 3.8+ and add it to PATH
    pause
    exit /b 1
)
echo ✅ Python is available

echo.
echo 🔍 Checking Node.js availability...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found! Please install Node.js 16+ and add it to PATH
    pause
    exit /b 1
)
echo ✅ Node.js is available

echo.
echo 📂 Checking project structure...
if not exist "backend\api\app.py" (
    echo ❌ Backend app.py not found!
    pause
    exit /b 1
)
echo ✅ Backend structure OK

if not exist "frontend\package.json" (
    echo ❌ Frontend package.json not found!
    pause
    exit /b 1
)
echo ✅ Frontend structure OK

echo.
echo 🧪 Running integration test script...
python test_integration.py

echo.
echo =====================================================
echo   📊 Integration Test Complete
echo =====================================================
echo.
echo To start the servers manually:
echo   Backend:  start_backend.bat
echo   Frontend: start_frontend.bat
echo.
echo For detailed instructions, see: INTEGRATION_GUIDE.md
echo.
pause

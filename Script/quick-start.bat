@echo off
echo 🚀 Starting Resume Builder Backend Setup...

REM Check Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js v14 or higher.
    pause
    exit /b 1
)

REM Check npm
where npm >nul 2>nul
if errorlevel 1 (
    echo ❌ npm is not installed.
    pause
    exit /b 1
)

echo 📦 Installing dependencies...
call npm install

REM Create .env if not exists
if not exist ".env" (
    echo 🔧 Creating .env file...
    copy .env.example .env
    echo ⚠️ Please update the .env file with your configuration
)

echo 🌱 Seeding database...
call npm run seed

echo 🚀 Starting development server...
call npm run dev
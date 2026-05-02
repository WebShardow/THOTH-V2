@echo off
chcp 65001 >nul
echo ============================================
echo   THOTH V2 - Modern Headless CMS Installer
echo ============================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] package.json not found!
    echo Please run this script from the THOTH V2 project root.
    pause
    exit /b 1
)

echo [Step 1] Checking Prerequisites...
echo ----------------------------------------

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js is installed

where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed!
    pause
    exit /b 1
)
echo [OK] npm is installed

echo.
echo [Step 2] Checking Environment...
echo ----------------------------------------

if not exist ".env" (
    echo [!] .env file not found. Creating template...
    (
        echo # Database
        echo DATABASE_URL="postgresql://postgres:password@localhost:5432/thoth_v2?schema=public"
        echo.
        echo # Authentication
        echo NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
        echo NEXTAUTH_URL="http://localhost:3000"
        echo.
        echo # Google OAuth ^(optional^)
        echo GOOGLE_CLIENT_ID=""
        echo GOOGLE_CLIENT_SECRET=""
        echo.
        echo # App
        echo NODE_ENV="development"
    ) > .env
    echo [OK] Created .env file
    echo [!] IMPORTANT: Please edit .env with your database credentials
    echo.
    choice /C YN /M "Do you want to continue after editing .env"
    if %ERRORLEVEL% NEQ 1 exit /b 0
) else (
    echo [OK] .env file exists
)

echo.
echo [Step 3] Installing Dependencies...
echo ----------------------------------------
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install failed!
    pause
    exit /b 1
)
echo [OK] Dependencies installed

echo.
echo [Step 4] Database Migration...
echo ----------------------------------------
echo [!] WARNING: This will reset your database if it exists!
echo [!] All existing data will be lost.
echo.
choice /C YN /M "Continue with database reset and migration"
if %ERRORLEVEL% NEQ 1 (
    echo Skipping database migration.
    echo You can run it later with: npx prisma migrate dev
    goto :SKIP_DB
)

call npx prisma migrate reset --force --skip-generate
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Database migration had issues. You may need to:
    echo   1. Ensure PostgreSQL is running
    echo   2. Check DATABASE_URL in .env is correct
    echo   3. Create the database manually if it doesn't exist
    pause
)

echo.
echo [Step 5] Generating Prisma Client...
echo ----------------------------------------
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Prisma Client generation had issues.
)

:SKIP_DB
echo.
echo [Step 6] Create Admin User (Optional)...
echo ----------------------------------------
choice /C YN /M "Create an admin user now"
if %ERRORLEVEL% EQU 1 (
    if not exist "scripts" mkdir scripts
    
    set /p ADMIN_EMAIL="Enter admin email: "
    set /p ADMIN_NAME="Enter admin name: "
    set /p ADMIN_PASS="Enter admin password: "
    
    echo const { PrismaClient } = require('@prisma/client'); > scripts\create-admin.js
    echo const bcrypt = require('bcryptjs'); >> scripts\create-admin.js
    echo. >> scripts\create-admin.js
    echo const prisma = new PrismaClient(); >> scripts\create-admin.js
    echo. >> scripts\create-admin.js
    echo async function main() { >> scripts\create-admin.js
    echo   const hashedPassword = await bcrypt.hash('%ADMIN_PASS%', 10); >> scripts\create-admin.js
    echo   const user = await prisma.user.upsert({ >> scripts\create-admin.js
    echo     where: { email: '%ADMIN_EMAIL%' }, >> scripts\create-admin.js
    echo     update: { role: 'admin' }, >> scripts\create-admin.js
    echo     create: { >> scripts\create-admin.js
    echo       email: '%ADMIN_EMAIL%', >> scripts\create-admin.js
    echo       name: '%ADMIN_NAME%', >> scripts\create-admin.js
    echo       role: 'admin', >> scripts\create-admin.js
    echo       password: hashedPassword, >> scripts\create-admin.js
    echo     }, >> scripts\create-admin.js
    echo   }); >> scripts\create-admin.js
    echo   console.log('Admin created:', user.email); >> scripts\create-admin.js
    echo } >> scripts\create-admin.js
    echo main().catch(console.error).finally(() => prisma.$disconnect()); >> scripts\create-admin.js
    
    node scripts\create-admin.js
)

echo.
echo [Step 7] Build Project (Optional)...
echo ----------------------------------------
choice /C YN /M "Build for production now"
if %ERRORLEVEL% EQU 1 (
    call npm run build
)

echo.
echo ============================================
echo    Installation Complete!
echo ============================================
echo.
echo [THOTH V2] is ready to use!
echo.
echo To start development server:
echo   npm run dev
echo.
echo Then open: http://localhost:3000
echo.
echo Login paths:
echo   - Login:  http://localhost:3000/login
echo   - Admin:  http://localhost:3000/admin
echo.
echo Useful commands:
echo   - Database GUI: npx prisma studio
echo   - Type check:   npx tsc --noEmit
echo.

choice /C YN /M "Start the development server now"
if %ERRORLEVEL% EQU 1 (
    npm run dev
) else (
    echo.
    echo Ready! Run 'npm run dev' when you're ready to start.
    pause
)

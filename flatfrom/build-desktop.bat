@echo off
echo Building CRM Desktop Application...
echo.

echo Step 1: Building CRM Frontend...
cd ..\crm-frontend
call npm run build
if %errorlevel% neq 0 (
    echo Error building CRM frontend!
    pause
    exit /b 1
)

echo.
echo Step 2: Installing Desktop App Dependencies...
cd ..\crm-frontend\flatfrom
call npm install
if %errorlevel% neq 0 (
    echo Error installing dependencies!
    pause
    exit /b 1
)

echo.
echo Step 3: Copying Build Files...
call node build-script.js
if %errorlevel% neq 0 (
    echo Error copying build files!
    pause
    exit /b 1
)

echo.
echo Step 4: Creating Windows Installer...
call npm run build-win
if %errorlevel% neq 0 (
    echo Error creating installer!
    pause
    exit /b 1
)

echo.
echo Build completed successfully!
echo Installer created in: dist\
echo.
pause

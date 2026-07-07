@echo off
SETLOCAL EnableDelayedExpansion

echo.
echo =============================================
echo   Eternal - Matrimonial Platform Setup
echo =============================================
echo.

:: ─── Check Docker ───────────────────────────────
echo [1/5] Checking if Docker Desktop is installed...
docker --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Docker is NOT installed.
    echo.
    echo Attempting to download and install Docker Desktop automatically...
    echo This requires an internet connection and may take a few minutes.
    echo.

    :: Download Docker Desktop installer using PowerShell
    echo Downloading Docker Desktop installer...
    powershell -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://desktop.docker.com/win/main/amd64/Docker%%20Desktop%%20Installer.exe' -OutFile '%TEMP%\DockerDesktopInstaller.exe' -UseBasicParsing }"

    IF NOT EXIST "%TEMP%\DockerDesktopInstaller.exe" (
        echo [ERROR] Failed to download Docker Desktop installer.
        echo Please download it manually from: https://www.docker.com/products/docker-desktop/
        pause
        exit /b 1
    )

    echo Download complete. Starting Docker Desktop installation...
    echo Please follow the installer prompts. A system restart may be required.
    echo.
    start /wait "" "%TEMP%\DockerDesktopInstaller.exe" install --quiet --accept-license

    :: Clean up installer
    del "%TEMP%\DockerDesktopInstaller.exe" 2>nul

    :: Verify installation
    docker --version >nul 2>&1
    IF %ERRORLEVEL% NEQ 0 (
        echo.
        echo [WARNING] Docker was installed but is not yet in your PATH.
        echo Please restart your computer, then run this script again.
        pause
        exit /b 1
    )
    echo [OK] Docker Desktop installed successfully.
)
echo [OK] Docker found.

:: ─── Check Docker Daemon ───────────────────────
echo [2/5] Checking if Docker daemon is running...
docker info >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Docker daemon is NOT running. Attempting to start Docker Desktop...
    
    :: Try to start Docker Desktop
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe" 2>nul
    IF %ERRORLEVEL% NEQ 0 (
        start "" "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" 2>nul
    )

    echo Waiting for Docker Desktop to start (this may take up to 60 seconds)...
    set /a WAIT_COUNT=0
    
    :WAIT_LOOP
    timeout /t 5 /nobreak >nul
    docker info >nul 2>&1
    IF %ERRORLEVEL% EQU 0 (
        goto DOCKER_READY
    )
    set /a WAIT_COUNT+=1
    IF !WAIT_COUNT! GEQ 12 (
        echo.
        echo [ERROR] Docker Desktop did not start within 60 seconds.
        echo Please start Docker Desktop manually, wait for it to fully load,
        echo then re-run this script.
        pause
        exit /b 1
    )
    echo    Still waiting... (!WAIT_COUNT!/12)
    goto WAIT_LOOP
    
    :DOCKER_READY
)
echo [OK] Docker daemon is running.

:: ─── Check docker compose ──────────────────────
echo [3/5] Checking Docker Compose...
docker compose version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker Compose not found.
    echo Docker Desktop should include Compose v2. Please update Docker Desktop.
    pause
    exit /b 1
)
echo [OK] Docker Compose found.

:: ─── Clean old containers (optional) ──────────
echo [4/5] Stopping any previously running containers...
docker compose down --remove-orphans 2>nul
echo [OK] Old containers stopped.

:: ─── Build and Start ───────────────────────────
echo [5/5] Building images and starting all services...
echo       This may take 5-10 minutes on the first run (downloading base images).
echo.
docker compose up --build -d

IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Docker Compose failed to start.
    echo Run "docker compose logs" to see what went wrong.
    pause
    exit /b 1
)

echo.
echo =============================================
echo   All services started successfully!
echo =============================================
echo.
echo   Application URLs:
echo   Frontend (Web App) : http://localhost
echo   API (Django)       : http://localhost/api/v1/
echo   API Docs (Swagger) : http://localhost/swagger/
echo   Admin Panel        : http://localhost/admin/
echo.
echo   Default Admin Login:
echo   Username : admin
echo   Password : Admin@123
echo.
echo   To view live logs : docker compose logs -f
echo   To stop all       : docker compose down
echo.
pause

#!/bin/bash
set -e

echo ""
echo "============================================="
echo "  Eternal - Matrimonial Platform Setup"
echo "============================================="
echo ""

# ─── Check Docker ────────────────────────────────
echo "[1/5] Checking if Docker is installed..."
if ! command -v docker &> /dev/null; then
    echo "Docker is NOT installed."
    # Check if we are running on Ubuntu
    if [ -f /etc/os-release ] && grep -q -i "ubuntu" /etc/os-release; then
        echo "Ubuntu detected. Attempting automatic installation of Docker..."
        
        # Install Docker repository and GPG keys
        sudo apt-get update
        sudo apt-get install -y ca-certificates curl gnupg
        
        sudo install -m 0755 -d /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor --yes -o /etc/apt/keyrings/docker.gpg
        sudo chmod a+r /etc/apt/keyrings/docker.gpg
        
        echo \
          "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
          $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
          sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
          
        sudo apt-get update
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        
        # Start and enable docker
        sudo systemctl enable docker
        sudo systemctl start docker
        
        # Add current user to docker group
        sudo usermod -aG docker $USER
        echo "[OK] Docker installed successfully."
        echo "Please note: You might need to log out and log back in for changes to apply."
    else
        echo "[ERROR] Automatic installation is only supported on Ubuntu Linux."
        echo "Please install Docker manually: https://docs.docker.com/engine/install/"
        exit 1
    fi
else
    echo "[OK] Docker found: $(docker --version)"
fi

# ─── Check Docker Daemon ─────────────────────────
echo "[2/5] Checking if Docker daemon is running..."
if ! docker info &> /dev/null; then
    echo "Docker daemon is NOT running. Attempting to start it..."
    if command -v systemctl &> /dev/null; then
        sudo systemctl start docker
        echo "Waiting for Docker daemon to start..."
        sleep 5
    fi
    
    # Re-check daemon
    if ! docker info &> /dev/null; then
        echo "[ERROR] Failed to start Docker daemon."
        echo "Please check if Docker service is running manually (e.g., sudo systemctl status docker)."
        exit 1
    fi
fi
echo "[OK] Docker daemon is running."

# ─── Check docker compose ────────────────────────
echo "[3/5] Checking Docker Compose..."
if ! docker compose version &> /dev/null; then
    echo "Docker Compose (v2) not found. Attempting to install it..."
    if [ -f /etc/os-release ] && grep -q -i "ubuntu" /etc/os-release; then
        sudo apt-get update
        sudo apt-get install -y docker-compose-plugin
    else
        echo "[ERROR] Docker Compose (v2) is not installed. Please install the docker-compose-plugin."
        exit 1
    fi
    
    # Recheck
    if ! docker compose version &> /dev/null; then
        echo "[ERROR] Docker Compose (v2) is still not found. Please install it manually."
        exit 1
    fi
fi
echo "[OK] Docker Compose found."

# ─── Stop old containers ─────────────────────────
echo "[4/5] Stopping any previously running containers..."
docker compose down --remove-orphans 2>/dev/null || true
echo "[OK] Old containers stopped."

# ─── Build and Start ─────────────────────────────
echo "[5/5] Building images and starting all services..."
echo "      This may take 5-10 minutes on the first run."
echo ""
docker compose up --build -d

echo ""
echo "============================================="
echo "  All services started successfully!"
echo "============================================="
echo ""
echo "  Application URLs:"
echo "  Frontend (Web App) : http://localhost"
echo "  API (Django)       : http://localhost/api/v1/"
echo "  API Docs (Swagger) : http://localhost/swagger/"
echo "  Admin Panel        : http://localhost/admin/"
echo ""
echo "  To view live logs : docker compose logs -f"
echo "  To stop all       : docker compose down"
echo ""

# Eternal - Matrimonial Profile Platform

A secure, containerized matrimonial platform with privacy-first image blurring, real-time WebSocket notifications, and a Tinder-style swipe interface.

---

## Tech Stack

| Layer       | Technology                                      |
|-------------|-------------------------------------------------|
| Frontend    | Next.js 14 (App Router), TypeScript, Framer Motion |
| Backend     | Django 5, Django REST Framework, Django Channels |
| Database    | PostgreSQL 15                                   |
| Cache / WS  | Redis 7 (Channels Layer)                        |
| Auth        | JWT (SimpleJWT) + Argon2 Password Hashing        |
| Reverse Proxy | Nginx (rate-limited, security headers)         |
| Containers  | Docker + Docker Compose                         |

---

## Prerequisites

### Windows & macOS
- **Docker Desktop** — [Download here](https://www.docker.com/products/docker-desktop/)

### Ubuntu Linux
To install Docker and Docker Compose on Ubuntu, run the following commands in your terminal:

```bash
# 1. Update package database and install utility dependencies
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

# 2. Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 3. Add the repository to Apt sources
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 4. Install Docker Engine and the Compose plugin
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 5. Enable and start the Docker daemon service
sudo systemctl enable docker
sudo systemctl start docker

# 6. Allow running docker commands without sudo (requires logging out/in after running)
sudo usermod -aG docker $USER
```

---


## 🚀 Quick Start

### Windows

Simply double-click `run.bat` or run it in a terminal:

```bat
run.bat
```

### Linux / macOS

Make the script executable and run it:

```bash
chmod +x run.sh
./run.sh
```

Both scripts will:
1. Check if Docker is installed and running
2. Stop any previously running containers
3. **Build all container images** (downloads ~800MB of base images on first run)
4. Start all services in the background
5. Print access URLs

---

## Access the Application

| Service         | URL                              |
|-----------------|----------------------------------|
| Web App         | http://localhost                 |
| REST API        | http://localhost/api/v1/         |
| Swagger Docs    | http://localhost/swagger/        |
| Django Admin    | http://localhost/admin/          |

> The first startup may take **5–10 minutes** for Docker to pull base images and build.

---

## Project Structure

```
matrimonyapp/
├── backend/                # Django REST API
│   ├── accounts/           # User registration, login, JWT auth
│   ├── profiles/           # Matrimonial profiles, image pipeline
│   ├── permissions/        # Image access requests, swipe tracking
│   ├── notifications/      # WebSocket consumers, real-time events
│   ├── project/            # Django settings, URLs, ASGI/WSGI
│   ├── entrypoint.sh       # DB wait → migrate → runserver
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env                # Environment variables
│
├── frontend/               # Next.js Web App
│   ├── app/
│   │   ├── login/          # Login page
│   │   ├── register/       # Registration page
│   │   ├── dashboard/      # Swipe match feed
│   │   └── profiles/create/# Profile creation form
│   ├── components/
│   │   ├── Header.tsx      # Navigation + notification bell
│   │   └── NotificationCenter.tsx  # WebSocket notification panel
│   ├── utils/api.ts        # JWT token helpers, API fetcher
│   └── Dockerfile
│
├── nginx/
│   └── nginx.conf          # Reverse proxy + rate limiting
│
├── docker-compose.yml      # Container orchestration
├── run.bat                 # Windows one-click startup
├── run.sh                  # Linux/macOS one-click startup
└── README.md
```

---

## Key Features

- **Gmail-only Authentication** — Only `@gmail.com` accounts are accepted
- **Multi-login Support** — Login via username, email, or mobile number
- **Privacy-first Image Blurring** — Profile photos are blurred using Pillow `GaussianBlur` until access is approved
- **Image Permission Workflow** — Request → Notify → Approve/Reject in real-time
- **Swipe Interface** — Tinder-style drag gestures with swipe history tracking
- **Opposite-gender Matchmaking** — Feed is automatically filtered to show only opposite-gender profiles
- **Advanced Filters** — Filter by age, height, Rasi, Nakshatram, Gothram, location
- **Real-time Notifications** — WebSocket-backed notification panel (Django Channels + Redis)
- **Security Hardened** — Argon2 hashing, Axes brute-force protection, rate limiting, security headers

---

## Useful Docker Commands

```bash
# View logs from all containers
docker compose logs -f

# View logs from a specific service
docker compose logs -f api
docker compose logs -f web

# Stop all containers
docker compose down

# Stop and remove all data (volumes)
docker compose down -v

# Restart a specific service
docker compose restart api

# Open a Django shell
docker compose exec api python manage.py shell

# Create a Django superuser for admin panel
docker compose exec api python manage.py createsuperuser
```

---

## Creating a Superuser (Admin Access)

After starting the containers, run:

```bash
docker compose exec api python manage.py createsuperuser
```

Then visit http://localhost/admin/ to manage all data.

---

## Environment Variables

The backend reads from `backend/.env`. Key variables:

| Variable        | Description                        |
|-----------------|------------------------------------|
| `SECRET_KEY`    | Django secret key                  |
| `DEBUG`         | `True` for development             |
| `DATABASE_URL`  | PostgreSQL connection string       |
| `REDIS_URL`     | Redis connection string            |

---

## Database Schema (Summary)

| Table               | Purpose                                    |
|---------------------|--------------------------------------------|
| `accounts_user`     | Custom User with Gmail + mobile fields     |
| `profiles_profile`  | Matrimonial profile (all personal fields + base64 image) |
| `permissions_imagepermission` | Image access request/approval records |
| `permissions_swipe` | Swipe history (like / pass) per user       |
| `notifications_notification` | Notification inbox records          |
-----------------------------------------------------------------------------------------
# Step 1: Navigate to your project folder
cd /path/to/matrimonyapp

# Step 2: Make the script executable (only needed once)
chmod +x run.sh

# Step 3: Run it — that's it!
./run.sh
"# matteryapp" 

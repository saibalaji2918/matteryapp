#!/bin/sh
set -e

echo "============================="
echo " Matrimony API Starting Up   "
echo "============================="

echo "[1/4] Waiting for DB..."
until python -c "import psycopg2; psycopg2.connect('$DATABASE_URL')" 2>/dev/null; do
  sleep 1
done
echo "[1/4] DB is ready."

echo "[2/4] Running migrations..."
python manage.py migrate --noinput

echo "[2.5/4] Creating default superuser and test accounts..."
python manage.py shell <<EOF
from django.contrib.auth import get_user_model
from profiles.models import Profile
from datetime import date

User = get_user_model()

# 1. Create Admin Superuser
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@gmail.com', 'Admin@123', mobile='0000000000', gender='Male')
    print("Superuser 'admin' created successfully.")

# 2. Create Test Male User & Profile
if not User.objects.filter(username='testmale').exists():
    male_user = User.objects.create_user('testmale', 'testmale@gmail.com', 'Password@123', mobile='9876543211', gender='Male')
    Profile.objects.create(
        user=male_user,
        name='Rahul Sharma',
        gender='Male',
        dob=date(1996, 8, 15),
        height=178.5,
        marital_status='Never Married',
        mobile='9876543211',
        email='rahul@gmail.com',
        rasi='Mesha',
        nakshatram='Aswini',
        gothram='Kashyapa',
        education='Software Engineer',
        occupation='Tech Lead',
        image_base64='data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    )
    print("Test male user and profile created.")

# 3. Create Test Female User & Profile
if not User.objects.filter(username='testfemale').exists():
    female_user = User.objects.create_user('testfemale', 'testfemale@gmail.com', 'Password@123', mobile='9876543212', gender='Female')
    Profile.objects.create(
        user=female_user,
        name='Ananya Iyer',
        gender='Female',
        dob=date(1998, 5, 20),
        height=164.0,
        marital_status='Never Married',
        mobile='9876543212',
        email='ananya@gmail.com',
        rasi='Simha',
        nakshatram='Purva Phalguni',
        gothram='Bharadwaja',
        education='Doctor (MD)',
        occupation='Cardiologist',
        image_base64='data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    )
    print("Test female user and profile created.")
EOF


echo "[3/4] Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "[4/4] Starting server..."
exec python manage.py runserver 0.0.0.0:8000

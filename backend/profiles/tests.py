from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Profile
from permissions.models import ImagePermission, Swipe
from datetime import date

User = get_user_model()

class AccountsRegistrationTest(TestCase):
    def test_gmail_only_validator(self):
        # Gmail should succeed
        user_ok = User(username="user1", email="user1@gmail.com", mobile="12345", gender="Male")
        user_ok.full_clean()  # Should not raise exception
        
        # Non-Gmail should fail
        user_fail = User(username="user2", email="user2@yahoo.com", mobile="54321", gender="Female")
        with self.assertRaises(ValidationError):
            user_fail.full_clean()

class MatrimonyWorkflowTests(APITestCase):
    def setUp(self):
        # Create users
        self.user_male = User.objects.create_user(
            username="male_user", email="male@gmail.com", mobile="1111", password="securepassword123", gender="Male"
        )
        self.user_female = User.objects.create_user(
            username="female_user", email="female@gmail.com", mobile="2222", password="securepassword123", gender="Female"
        )

        # Create profiles
        self.profile_male = Profile.objects.create(
            user=self.user_male, name="Male Candidate", dob=date(1995, 5, 5), height=180.0,
            gender="Male", marital_status="Never Married", mobile="1111", email="male@gmail.com",
            image_base64="data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        )
        self.profile_female = Profile.objects.create(
            user=self.user_female, name="Female Candidate", dob=date(1997, 7, 7), height=165.0,
            gender="Female", marital_status="Never Married", mobile="2222", email="female@gmail.com",
            image_base64="data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        )

    def test_matchmaking_opposite_gender(self):
        # Login as Male
        self.client.force_authenticate(user=self.user_male)
        url = reverse('profile-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should return female profile
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], "Female Candidate")
        
        # Image should be blurred by default
        self.assertFalse(response.data['results'][0]['is_image_revealed'])
        # The returned image string should have blurred data (which contains a blurred suffix/header)
        self.assertIn("data:image/jpeg;base64", response.data['results'][0]['image_base64'])

    def test_permission_approval_reveals_image(self):
        # Request access from Male to Female
        self.client.force_authenticate(user=self.user_male)
        req_url = reverse('imagepermission-list')
        response = self.client.post(req_url, {'profile': self.profile_female.id})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        permission_id = response.data['id']
        
        # Login as Female to approve request
        self.client.force_authenticate(user=self.user_female)
        approve_url = reverse('imagepermission-approve', args=[permission_id])
        response = self.client.post(approve_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'approved')
        
        # Request list as Male again, image should be revealed
        self.client.force_authenticate(user=self.user_male)
        list_url = reverse('profile-list')
        response = self.client.get(list_url)
        self.assertTrue(response.data['results'][0]['is_image_revealed'])
        self.assertEqual(response.data['results'][0]['image_base64'], self.profile_female.image_base64)

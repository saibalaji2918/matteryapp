from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, ThrottledTokenObtainPairView, UserMeView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', ThrottledTokenObtainPairView.as_view(), name='auth_login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='auth_token_refresh'),
    path('me/', UserMeView.as_view(), name='auth_user_me'),
]

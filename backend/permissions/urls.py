from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ImagePermissionViewSet, SwipeViewSet

router = DefaultRouter()
router.register(r'image-requests', ImagePermissionViewSet)
router.register(r'swipes', SwipeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

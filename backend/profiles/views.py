from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Profile
from .serializers import ProfileSerializer
from .filters import ProfileFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners of a profile to edit or delete it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Instance must be owned by the user
        return obj.user == request.user

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_class = ProfileFilter

    def get_queryset(self):
        user = self.request.user
        queryset = Profile.objects.all()

        # If requesting own profiles, return them directly
        if self.action == 'mine':
            return queryset.filter(user=user)

        # For general list/retrieve, exclude own profiles and apply opposite gender matchmaking
        if self.action in ['list', 'retrieve']:
            # Exclude profiles created by the user
            queryset = queryset.exclude(user=user)
            
            # Find opposite gender
            my_profiles = Profile.objects.filter(user=user)
            if my_profiles.exists():
                my_genders = set(my_profiles.values_list('gender', flat=True))
                opposite_genders = []
                if 'Male' in my_genders:
                    opposite_genders.append('Female')
                if 'Female' in my_genders:
                    opposite_genders.append('Male')
            else:
                # Fallback to opposite of user account gender
                opposite_genders = ['Female'] if user.gender == 'Male' else ['Male']
            
            queryset = queryset.filter(gender__in=opposite_genders)
            
            # Exclude already swiped profiles
            from permissions.models import Swipe
            swiped_ids = Swipe.objects.filter(user=user).values_list('profile_id', flat=True)
            queryset = queryset.exclude(id__in=swiped_ids)

        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def mine(self, request):
        """
        API endpoint to retrieve profiles owned/managed by the current user.
        """
        own_profiles = self.get_queryset()
        page = self.paginate_queryset(own_profiles)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(own_profiles, many=True)
        return Response(serializer.data)

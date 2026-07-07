from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from .models import ImagePermission, Swipe
from .serializers import ImagePermissionSerializer, SwipeSerializer
from profiles.models import Profile
from django.db import transaction

# Dynamic import helper for notifications to avoid circular dependency
def notify(sender, receiver, message):
    try:
        from notifications.utils import create_and_send_notification
        create_and_send_notification(sender, receiver, message)
    except Exception as e:
        print(f"Notification error: {e}")

class ImagePermissionViewSet(viewsets.ModelViewSet):
    queryset = ImagePermission.objects.all()
    serializer_class = ImagePermissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # By default, list only requests where the user is either the requester or owner
        user = self.request.user
        return ImagePermission.objects.filter(
            Q(request_user=user) | Q(profile_owner=user)
        )

    def perform_create(self, serializer):
        profile = serializer.validated_data['profile']
        permission = serializer.save(
            request_user=self.request.user,
            profile_owner=profile.user,
            status='pending'
        )
        
        # Trigger real-time notification to owner
        notify(
            sender=self.request.user,
            receiver=profile.user,
            message=f"{self.request.user.username} requested access to view {profile.name}'s image."
        )

    @action(detail=False, methods=['get'])
    def incoming(self, request):
        """Requests waiting for my approval"""
        incoming_requests = ImagePermission.objects.filter(profile_owner=request.user, status='pending')
        serializer = self.get_serializer(incoming_requests, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def outgoing(self, request):
        """Requests I have sent to others"""
        outgoing_requests = ImagePermission.objects.filter(request_user=request.user)
        serializer = self.get_serializer(outgoing_requests, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        permission = self.get_object()
        if permission.profile_owner != request.user:
            return Response({"detail": "Not authorized to approve this request."}, status=status.HTTP_403_FORBIDDEN)
            
        permission.status = 'approved'
        permission.approved_at = timezone.now()
        permission.save()

        # Trigger notification to requester
        notify(
            sender=request.user,
            receiver=permission.request_user,
            message=f"{request.user.username} approved your request to view {permission.profile.name}'s image."
        )
        
        return Response(self.get_serializer(permission).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        permission = self.get_object()
        if permission.profile_owner != request.user:
            return Response({"detail": "Not authorized to reject this request."}, status=status.HTTP_403_FORBIDDEN)
            
        permission.status = 'rejected'
        permission.save()

        # Trigger notification to requester
        notify(
            sender=request.user,
            receiver=permission.request_user,
            message=f"{request.user.username} rejected your request to view {permission.profile.name}'s image."
        )
        
        return Response(self.get_serializer(permission).data)

class SwipeViewSet(viewsets.ModelViewSet):
    queryset = Swipe.objects.all()
    serializer_class = SwipeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        swipe = serializer.save(user=self.request.user)
        
        # Check if the other user liked any profile owned by current user
        if swipe.action == 'like':
            target_profile = swipe.profile
            target_user = target_profile.user
            
            # Check if target user has liked any profile owned by the current user
            mutual_like = Swipe.objects.filter(
                user=target_user,
                profile__user=self.request.user,
                action='like'
            ).first()
            
            if mutual_like:
                # Trigger Match notifications
                notify(
                    sender=self.request.user,
                    receiver=target_user,
                    message=f"You have a new mutual match with {self.request.user.username}!"
                )
                notify(
                    sender=target_user,
                    receiver=self.request.user,
                    message=f"You have a new mutual match with {target_user.username}!"
                )

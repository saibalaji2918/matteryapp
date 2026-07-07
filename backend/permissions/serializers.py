from rest_framework import serializers
from .models import ImagePermission, Swipe
from profiles.serializers import ProfileSerializer
from accounts.serializers import UserSerializer

class ImagePermissionSerializer(serializers.ModelSerializer):
    request_user = UserSerializer(read_only=True)
    profile_owner = UserSerializer(read_only=True)
    profile_details = ProfileSerializer(source='profile', read_only=True)

    class Meta:
        model = ImagePermission
        fields = (
            'id', 'request_user', 'profile_owner', 'profile', 'profile_details',
            'status', 'requested_at', 'approved_at'
        )
        read_only_fields = ('id', 'request_user', 'profile_owner', 'status', 'requested_at', 'approved_at')

    def validate(self, attrs):
        request = self.context.get('request')
        profile = attrs.get('profile')
        
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Authentication required.")
            
        if profile.user == request.user:
            raise serializers.ValidationError("You cannot request image access to your own profile.")
            
        # Check if already exists
        if ImagePermission.objects.filter(request_user=request.user, profile=profile).exists():
            raise serializers.ValidationError("You have already requested access to this profile's image.")
            
        return attrs

class SwipeSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Swipe
        fields = ('id', 'user', 'profile', 'action', 'created_at')
        read_only_fields = ('id', 'user', 'created_at')

    def validate(self, attrs):
        request = self.context.get('request')
        profile = attrs.get('profile')
        
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Authentication required.")
            
        if profile.user == request.user:
            raise serializers.ValidationError("You cannot swipe on your own profile.")
            
        if Swipe.objects.filter(user=request.user, profile=profile).exists():
            raise serializers.ValidationError("You have already swiped on this profile.")
            
        return attrs

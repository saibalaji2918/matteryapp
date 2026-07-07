from rest_framework import serializers
from .models import Profile
from .utils import compress_image_to_base64, blur_base64_image

class ProfileSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    image = serializers.ImageField(write_only=True, required=False, allow_null=True)
    image_base64 = serializers.SerializerMethodField()
    is_image_revealed = serializers.SerializerMethodField()
    has_pending_request = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = (
            'id', 'user', 'name', 'house_name', 'dob', 'birth_time', 'birth_place',
            'height', 'complexion', 'education', 'occupation', 'nakshatram', 'rasi',
            'gothram', 'mother_gothram', 'father_name', 'father_occupation', 'mother_name',
            'siblings', 'siblings_occupation', 'inlaw_name', 'address', 'mobile', 'email',
            'gender', 'marital_status', 'image_base64', 'image', 'is_image_revealed',
            'has_pending_request', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'user', 'image_base64', 'created_at', 'updated_at')

    def get_is_image_revealed(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        # Owner can always see their own profile image
        if obj.user == request.user:
            return True
            
        # Check permissions app's approval
        from permissions.models import ImagePermission
        return ImagePermission.objects.filter(
            request_user=request.user,
            profile=obj,
            status='approved'
        ).exists()

    def get_has_pending_request(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
            
        if obj.user == request.user:
            return False
            
        from permissions.models import ImagePermission
        return ImagePermission.objects.filter(
            request_user=request.user,
            profile=obj,
            status='pending'
        ).exists()

    def get_image_base64(self, obj):
        if not obj.image_base64:
            return None
            
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            # Not authenticated, serve blurred image
            return blur_base64_image(obj.image_base64)
            
        # Owner gets original
        if obj.user == request.user:
            return obj.image_base64
            
        # Check if access has been approved
        from permissions.models import ImagePermission
        has_access = ImagePermission.objects.filter(
            request_user=request.user,
            profile=obj,
            status='approved'
        ).exists()
        
        if has_access:
            return obj.image_base64
            
        # Otherwise return the blurred version
        return blur_base64_image(obj.image_base64)

    def create(self, validated_data):
        image = validated_data.pop('image', None)
        request = self.context.get('request')
        
        profile = Profile(**validated_data)
        if request and request.user.is_authenticated:
            profile.user = request.user
            
        if image:
            profile.image_base64 = compress_image_to_base64(image)
            
        profile.save()
        return profile

    def update(self, instance, validated_data):
        image = validated_data.pop('image', None)
        
        # Standard field updates
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if image:
            instance.image_base64 = compress_image_to_base64(image)
            
        instance.save()
        return instance

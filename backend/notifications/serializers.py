from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True, default="System")

    class Meta:
        model = Notification
        fields = ('id', 'sender', 'sender_name', 'receiver', 'message', 'read', 'created_at')
        read_only_fields = ('id', 'sender', 'receiver', 'message', 'created_at')

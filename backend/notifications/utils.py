from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Notification

def create_and_send_notification(sender, receiver, message):
    """
    Creates a Notification database record and sends it in real-time to the receiver via WebSockets.
    """
    # 1. Save to Database
    notification = Notification.objects.create(
        sender=sender,
        receiver=receiver,
        message=message
    )
    
    # 2. Broadcast via Channels
    try:
        channel_layer = get_channel_layer()
        if channel_layer:
            group_name = f"user_{receiver.id}"
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    "type": "send_notification",
                    "id": notification.id,
                    "sender": sender.username if sender else "System",
                    "message": message,
                    "created_at": notification.created_at.isoformat()
                }
            )
    except Exception as e:
        # Fallback log if channels or redis is down
        print(f"Failed to send real-time notification: {e}")
        
    return notification

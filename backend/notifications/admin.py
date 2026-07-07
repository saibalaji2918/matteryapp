from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('receiver', 'sender', 'message', 'read', 'created_at')
    list_filter = ('read',)
    search_fields = ('receiver__username', 'sender__username', 'message')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

from django.contrib import admin
from .models import ImagePermission, Swipe

@admin.register(ImagePermission)
class ImagePermissionAdmin(admin.ModelAdmin):
    list_display = ('request_user', 'profile_owner', 'profile', 'status', 'requested_at', 'approved_at')
    list_filter = ('status',)
    search_fields = ('request_user__username', 'profile_owner__username', 'profile__name')
    ordering = ('-requested_at',)
    readonly_fields = ('requested_at', 'approved_at')

@admin.register(Swipe)
class SwipeAdmin(admin.ModelAdmin):
    list_display = ('user', 'profile', 'action', 'created_at')
    list_filter = ('action',)
    search_fields = ('user__username', 'profile__name')
    ordering = ('-created_at',)

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'mobile', 'gender', 'dob', 'is_active', 'created_at')
    list_filter = ('gender', 'is_active', 'is_staff')
    search_fields = ('username', 'email', 'mobile')
    ordering = ('-created_at',)
    fieldsets = UserAdmin.fieldsets + (
        ('Extra Info', {'fields': ('mobile', 'gender', 'dob')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Extra Info', {'fields': ('email', 'mobile', 'gender', 'dob')}),
    )

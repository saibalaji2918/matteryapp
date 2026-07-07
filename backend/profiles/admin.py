from django.contrib import admin
from .models import Profile

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('name', 'gender', 'dob', 'rasi', 'nakshatram', 'gothram', 'education', 'occupation', 'marital_status', 'created_at')
    list_filter = ('gender', 'marital_status', 'rasi')
    search_fields = ('name', 'email', 'mobile', 'nakshatram', 'rasi', 'gothram')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')

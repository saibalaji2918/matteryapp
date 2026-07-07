from django.db import models
from django.conf import settings
from profiles.models import Profile

class ImagePermission(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    request_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_image_requests',
        help_text="The user requesting access to see the unblurred image"
    )
    profile_owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_image_requests',
        help_text="The user who owns/manages the target profile"
    )
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='image_permissions',
        help_text="The profile whose image is requested"
    )
    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default='pending'
    )
    requested_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['request_user', 'profile'], name='unique_request_per_profile')
        ]
        ordering = ['-requested_at']

    def __str__(self):
        return f"{self.request_user.username} -> {self.profile.name} ({self.status})"

class Swipe(models.Model):
    ACTION_CHOICES = (
        ('like', 'Like'),
        ('pass', 'Pass'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='swipes',
        help_text="The user performing the swipe"
    )
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='swiped_by',
        help_text="The profile being swiped on"
    )
    action = models.CharField(
        max_length=10,
        choices=ACTION_CHOICES
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'profile'], name='unique_swipe_per_profile')
        ]

    def __str__(self):
        return f"{self.user.username} {self.action}ed {self.profile.name}"

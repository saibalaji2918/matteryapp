from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

def validate_gmail(value):
    if not value.lower().endswith('@gmail.com'):
        raise ValidationError(
            _("Only Gmail addresses (ending with @gmail.com) are allowed."),
            code='invalid_gmail'
        )

class User(AbstractUser):
    GENDER_CHOICES = (
        ('Male', 'Male'),
        ('Female', 'Female'),
    )
    
    email = models.EmailField(
        _('email address'),
        unique=True,
        validators=[validate_gmail],
        error_messages={
            'unique': _("A user with that email already exists."),
        },
    )
    mobile = models.CharField(
        max_length=15,
        unique=True,
        help_text=_("Contact mobile number (e.g. +919876543210)")
    )
    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES
    )
    dob = models.DateField(
        null=True,
        blank=True,
        help_text=_("User's Date of Birth")
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Require fields for registration helper
    REQUIRED_FIELDS = ['email', 'mobile', 'gender', 'dob']

    def clean(self):
        super().clean()
        if self.email:
            validate_gmail(self.email)

    def __str__(self):
        return self.username

from django.db import models
from django.conf import settings

class Profile(models.Model):
    GENDER_CHOICES = (
        ('Male', 'Male'),
        ('Female', 'Female'),
    )
    
    MARITAL_STATUS_CHOICES = (
        ('Never Married', 'Never Married'),
        ('Divorced', 'Divorced'),
        ('Widowed', 'Widowed'),
        ('Awaiting Divorce', 'Awaiting Divorce'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profiles',
        help_text="The account owner that created/manages this profile"
    )
    name = models.CharField(max_length=255)
    house_name = models.CharField(max_length=255, blank=True, null=True)
    dob = models.DateField(help_text="Date of birth")
    birth_time = models.TimeField(blank=True, null=True, help_text="Time of birth")
    birth_place = models.CharField(max_length=255, blank=True, null=True)
    height = models.FloatField(help_text="Height in cm or feet (e.g. 175.5)")
    complexion = models.CharField(max_length=100, blank=True, null=True)
    education = models.CharField(max_length=255, blank=True, null=True)
    occupation = models.CharField(max_length=255, blank=True, null=True)
    nakshatram = models.CharField(max_length=100, blank=True, null=True)
    rasi = models.CharField(max_length=100, blank=True, null=True)
    gothram = models.CharField(max_length=100, blank=True, null=True)
    mother_gothram = models.CharField(max_length=100, blank=True, null=True)
    father_name = models.CharField(max_length=255, blank=True, null=True)
    father_occupation = models.CharField(max_length=255, blank=True, null=True)
    mother_name = models.CharField(max_length=255, blank=True, null=True)
    siblings = models.TextField(blank=True, null=True, help_text="Brother/Sister name(s)")
    siblings_occupation = models.CharField(max_length=255, blank=True, null=True, help_text="Brother's/Sister's occupation")
    inlaw_name = models.CharField(max_length=255, blank=True, null=True, help_text="Brother-in-law / Sister-in-law name")
    address = models.TextField(blank=True, null=True)
    mobile = models.CharField(max_length=15, help_text="Contact mobile number")
    email = models.EmailField(help_text="Contact email address")
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    marital_status = models.CharField(max_length=50, choices=MARITAL_STATUS_CHOICES)
    
    # Store original compressed image as Base64 string
    image_base64 = models.TextField(blank=True, null=True, help_text="Base64 encoded profile image")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.gender})"

from django.db import models

# Create your models here.

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField(unique=True)  # Example customization
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    username = models.CharField(
        max_length=150,
        unique=True,
        blank=True,
        null=True,
        help_text="Optional. 150 characters or fewer. Letters, digits and @/./+/-/_ only."
    )

    USERNAME_FIELD = 'email'  # Use email instead of username

    # Since username is no longer required, remove it from REQUIRED_FIELDS
    REQUIRED_FIELDS = []  # You can add other fields like 'first_name' if needed

    def __str__(self):
        return self.email

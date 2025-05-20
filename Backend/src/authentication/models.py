from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import AbstractUser, BaseUserManager, make_password, PermissionsMixin
from django.db import models


class CustomUserManager(BaseUserManager):
    def _create_user(self, email, password, **extra_fields):
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.password = make_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password, **extra_fields):
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150, blank=True, null=True)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    username = models.CharField(
        max_length=150,
        unique=False,
        blank=True,
        help_text="Optional. 150 characters or fewer. Letters, digits and @/./+/-/_ only."
    )
    is_superuser = models.BooleanField(default=False)


    USERNAME_FIELD = 'email'  # Use email instead of username
    objects = CustomUserManager()

    # Since username is no longer required, remove it from REQUIRED_FIELDS
    REQUIRED_FIELDS = []  # Remove Username_Field from REQUIRED_FIELD

    def __str__(self):
        return self.email



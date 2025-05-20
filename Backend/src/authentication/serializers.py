from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator

# This method will return the currently active user model
User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'is_active']
        read_only_fields = ['id', 'is_active']

    def validate_email(self, value):
        # Add custom email validation
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            username=validated_data.get('first_name') + validated_data.get('last_name')
        )
        # Assign the user to the "Visitor" group
        try:
            visitor_group = Group.objects.get(name='visitor')
            user.groups.add(visitor_group)
        except Group.DoesNotExist:
            raise serializers.ValidationError("The 'Visitor' group does not exist. Please create it first.")
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims if needed Add profiles [Student, Prof, It, Vistor]
        token['email'] = user.email
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['full_name'] = user.first_name + user.last_name
        # Add user's role based on their group
        token['role'] = [group.name for group in user.groups.all()] if user.groups.exists() else ['No Role']
        return token


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if email and password:
            user = authenticate(request=self.context.get('request'), email=email, password=password)
            if not user:
                raise serializers.ValidationError("Invalid email or password.")
        else:
            raise serializers.ValidationError("Both email and password are required.")

        data['user'] = user
        return data

    def get_tokens(self, user):
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user with this email exists.")
        return value

    def save(self):
        email = self.validated_data['email']
        user = User.objects.get(email=email)

        # Generate token and uid
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        # Construct reset URL 
        reset_url = f"{settings.FRONTEND_URL}/auth/reset-password/{uid}/{token}/"

        # Send email
        send_mail(
            subject='Password Reset Request',
            message=f'Click this link to reset your password: {reset_url}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8, write_only=True)

    def validate_new_password(self, value):
        # Add any password validation rules you want
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("Password must contain at least one number")
        if not any(char.isupper() for char in value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter")
        return value


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']

    def validate_email(self, value):
        """Ensure email isn't already in use by another user"""
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value

    def validate_username(self, value):
        """Ensure username isn't already in use by another user"""
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long.")
        return value


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_old_password(self, value):
        """Check if old password is correct"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value

    def validate_new_password(self, value):
        """Add password validation rules"""
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("Password must contain at least one number")
        if not any(char.isupper() for char in value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter")
        return value

    def validate(self, data):
        """Ensure new password is different from old password"""
        if data['old_password'] == data['new_password']:
            raise serializers.ValidationError("New password must be different from old password")
        return data

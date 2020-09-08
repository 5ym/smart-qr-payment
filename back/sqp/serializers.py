from .models import User, Verify
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    """ A serializer class for the User model """
    class Meta:
        model = User
        fields = ('id', 'email', 'password')

class ActiveSerializer(serializers.ModelSerializer):
    """ A serializer class for the User model """
    class Meta:
        model = User
        fields = ('id', 'is_active')

class VerifySerializer(serializers.ModelSerializer):
    """ A serializer class for the Verify model """
    class Meta:
        model = Verify
        fields = ('id', 'user', 'code')
from .models import User
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    """ A serializer class for the User model """
    class Meta:
        model = User
        fields = ('id', 'email', 'password', 'is_active', 'is_staff')

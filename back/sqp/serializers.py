from .models import User, Verify, Product, UserProduct
from rest_framework import serializers
import random, string

class ActiveSerializer(serializers.ModelSerializer):
    """ A serializer class for the User model """
    class Meta:
        model = User
        fields = ('id', 'is_active')

class VerifySerializer(serializers.ModelSerializer):
    """ A serializer class for the Verify model """
    class Meta:
        model = Verify
        fields = '__all__'

class UserProductSerializer():
    """ Aserializer class for the UserProduct model """
    class Meta:
        model = UserProduct
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    """ A serializer class for the User model """
    class Meta:
        model = User
        fields = ('id', 'email', 'password')
    def create(self, validated_data):
        user = User.objects.create(email=validated_data['email'], password=validated_data['password'])
        randlst = [random.choice(string.ascii_letters + string.digits) for i in range(16)]
        verify = Verify(user=user, code=''.join(randlst))
        verify.save()
        return user
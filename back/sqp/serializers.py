from .models import User, Verify, Product, UserProduct
from rest_framework import serializers
import random, string

class VerifySerializer(serializers.ModelSerializer):
    """ A serializer class for the Verify model """
    class Meta:
        model = Verify
        fields = ('id', 'code')

class UserVerifySerializer(serializers.ModelSerializer):
    """ A serializer class for the User model """
    verify = VerifySerializer(read_only=True)
    class Meta:
        model = User
        fields = ('id', 'is_active', 'verify')

class UserProductSerializer(serializers.ModelSerializer):
    """ Aserializer class for the UserProduct model """
    class Meta:
        model = UserProduct
        fields = ('id', 'product', 'count')

class UserSerializer(serializers.ModelSerializer):
    """ A serializer class for the User model """
    userproducts = UserProductSerializer(many=True)
    class Meta:
        model = User
        fields = ('id', 'email', 'password', 'userproducts')
    # ユーザー作成時にverifyコードの生成,購入商品の登録
    def create(self, validated_data):
        user = User.objects.create(email=validated_data['email'], password=validated_data['password'])
        randlst = [random.choice(string.ascii_letters + string.digits) for i in range(16)]
        verify = Verify(user=user, code=''.join(randlst))
        verify.save()
        for item in validated_data['userproducts']:
            up = UserProduct(user=user, product=item['product'], count=item['count'])
            up.save()
        return user
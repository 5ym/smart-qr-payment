from .models import User, Verify, Product, UserProduct
from rest_framework import serializers
import random, string
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.hashers import make_password

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
        fields = ('id', 'verify')
    def update(self, instance, validated_data):
        instance.is_active = True
        instance.save()
        instance.verify.delete()
        return instance

class UserProductCreateSerializer(serializers.ModelSerializer):
    """ Aserializer class for the UserProduct model """
    class Meta:
        model = UserProduct
        fields = ('id', 'product', 'count')

class UserSerializer(serializers.ModelSerializer):
    """ A serializer class for the User model """
    userproducts = UserProductCreateSerializer(many=True)
    class Meta:
        model = User
        fields = ('id', 'email', 'password', 'userproducts')
    # ユーザー作成時にverifyコードの生成,購入商品の登録
    def create(self, validated_data):
        user = User.objects.create(email=validated_data['email'], password=make_password(validated_data['password']), is_active=False)
        code = ''.join([random.choice(string.ascii_letters + string.digits) for i in range(16)])
        verify = Verify(user=user, code=code)
        verify.save()
        http = "http://" if settings.DEBUG else "https://"
        send_mail(
            'メールアドレスの確認<Doa>',
            'この度はご注文ありがとうございます。\n下記よりメールアドレスの確認をお願いいたします。確認完了後支払画面に遷移いたします。\n'+http+settings.ALLOWED_HOSTS[0]+"/verify/"+verify.code,
            'no-reply@daco.dev',
            [user.email],
        )
        for item in validated_data['userproducts']:
            up = UserProduct(user=user, product=item['product'], count=item['count'], price=item['product'].price)
            up.save()
        return user

class ProductSerializer(serializers.ModelSerializer):
    """ Aserializer class for the Product model """
    class Meta:
        model = Product
        fields = '__all__'

class UserProductGetSerializer(serializers.ModelSerializer):
    """ Aserializer class for the UserProduct model """
    product = ProductSerializer()
    class Meta:
        model = UserProduct
        fields = ('id', 'product', 'count', 'price')

class OrderGetSerializer(serializers.ModelSerializer):
    """ Aserializer class for the UserProduct and User model """
    userproducts = UserProductGetSerializer(many=True)
    class Meta:
        model = User
        fields = ('id', 'userproducts')
from .models import User, Verify, Product, UserProduct
from rest_framework import serializers
import random, string
from django.core.mail import send_mail
from django.conf import settings

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
        user = User.objects.create(email=validated_data['email'], password=validated_data['password'], is_active=False)
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
            up = UserProduct(user=user, product=item['product'], count=item['count'])
            up.save()
        return user
from .models import User, Verify, Product, UserProduct, Pay
from rest_framework import serializers
import random, string
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.hashers import make_password
import stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

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
        http = "http://" if settings.DEBUG == True else "https://"
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

class PaySerializer(serializers.ModelSerializer):
    """ Aserializer class for the Pay model """
    class Meta:
        model = Pay
        fields = ('id', 'token')
    def create(self, validated_data):
        request = self.context.get('request', None)
        amount = 0
        for product in request.user.userproducts.all():
            amount += product.count * product.price
        intentins = stripe.PaymentIntent.create(
            amount=amount,
            currency="jpy",
            payment_method_types=["card"],
            payment_method=validated_data["token"]
        )
        http = "http://" if settings.DEBUG == True else "https://"
        try:
            intent = stripe.PaymentIntent.confirm(
                intentins,
                return_url=http+settings.ALLOWED_HOSTS[0]+"/pay/secure"
            )
        except stripe.error.CardError as e:
            raise serializers.ValidationError(e.error.message)
        if intent.status == "succeeded":
            code = ''.join([random.choice(string.ascii_letters + string.digits) for i in range(16)])
            pay = Pay.objects.create(user=request.user, token=intent.id, code=code)
            return pay
        else:
            raise serializers.ValidationError(["req", intent.client_secret])

class SecurePaySerializer(serializers.ModelSerializer):
    """ Aserializer class for the Pay model """
    class Meta:
        model = Pay
        fields = ('id', 'token')
    def create(self, validated_data):
        request = self.context.get('request', None)
        intent = stripe.PaymentIntent.retrieve(validated_data["token"])
        if intent.status == "succeeded":
            code = ''.join([random.choice(string.ascii_letters + string.digits) for i in range(16)])
            pay = Pay.objects.create(user=request.user, token=intent.id, code=code)
            return pay
        else:
            raise serializers.ValidationError()

class OrderGetSerializer(serializers.ModelSerializer):
    """ Aserializer class for the UserProduct and User model """
    userproducts = UserProductGetSerializer(many=True)
    pay = PaySerializer()
    class Meta:
        model = User
        fields = ('id', 'email', 'userproducts', 'pay')

class PayCodeSerializer(serializers.ModelSerializer):
    """ Aserializer class for the Pay """
    class Meta:
        model = Pay
        fields = ('id', 'code')

class CodeGetSerializer(serializers.ModelSerializer):
    """ Aserializer class for the Pay and UserProduct"""
    userproducts = UserProductGetSerializer(many=True)
    pay = PayCodeSerializer()
    class Meta:
        model = User
        fields = ('id', 'email', 'userproducts', 'pay')

class EmailGetSerializer(serializers.ModelSerializer):
    """ Aserializer class for the User"""
    userproducts = UserProductGetSerializer(many=True)
    class Meta:
        model = User
        fields = ('id', 'email', 'userproducts')

class OrderAdminSerializer(serializers.ModelSerializer):
    """ Aserializer class for the Pay """
    user = EmailGetSerializer()
    class Meta:
        model = Pay
        fields = ('id', 'code', 'receive', 'user')

class ReceiveAdminSerializer(serializers.ModelSerializer):
    """ Aserializer class for the Pay """
    class Meta:
        model = Pay
        fields = ('id', 'receive', 'code')
    def update(self, instance, validated_data):
        instance.receive = True
        instance.save()
        return instance
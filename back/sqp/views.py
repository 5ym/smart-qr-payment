from .models import User, Verify, Product, Pay
from rest_framework import generics, permissions
from django.shortcuts import get_object_or_404
from .serializers import *

class UserCreate(generics.CreateAPIView):
    """ View to create a new user. Only accepts POST requests """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = ()

class UserVerify(generics.RetrieveUpdateAPIView):
    """ Retrieve a user or update user information.
    Accepts GET and PUT requests and the record id must be provided in the request """
    queryset = User.objects.all()
    serializer_class = UserVerifySerializer
    permission_classes = ()
    lookup_field = 'verify__code'

class ProductList(generics.ListAPIView):
    """ View to list all products """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = ()

class OrderGet(generics.RetrieveAPIView):
    """ View to Order """
    queryset = User.objects.all()
    serializer_class = OrderGetSerializer
    permission_classes = (permissions.IsAuthenticated, )
    def get_object(self):
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, id=self.request.user.id)
        return obj

class PayCreate(generics.CreateAPIView):
    """ View to create a new pay status. Only accepts POST requests """
    queryset = Pay.objects.all()
    serializer_class = PaySerializer
    permission_classes = (permissions.IsAuthenticated, )

class SecurePayCreate(generics.CreateAPIView):
    """ View to create a new pay status. Only accepts POST requests """
    queryset = Pay.objects.all()
    serializer_class = SecurePaySerializer
    permission_classes = (permissions.IsAuthenticated, )

class CodeGet(generics.RetrieveAPIView):
    """ View to Code """
    queryset = User.objects.all()
    serializer_class = CodeGetSerializer
    permission_classes = (permissions.IsAuthenticated, )
    def get_object(self):
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, id=self.request.user.id)
        return obj

class OrderGetAdmin(generics.RetrieveAPIView):
    """ View to Order from admin """
    queryset = Pay.objects.all()
    serializer_class = OrderAdminSerializer
    permission_classes = (permissions.IsAdminUser, )
    lookup_field = 'code'

class OrderSetAdmin(generics.RetrieveUpdateAPIView):
    """ Set to Order from admin """
    queryset = Pay.objects.all()
    serializer_class = ReceiveAdminSerializer
    permission_classes = (permissions.IsAdminUser, )
    lookup_field = 'code'

class OrderListAdmin(generics.ListAPIView):
    """ View to Order from admin """
    queryset = Pay.objects.filter(receive=True).order_by("updated_at")[:3]
    serializer_class = OrderAdminSerializer
    permission_classes = (permissions.IsAdminUser, )

class BuyAdmin(generics.CreateAPIView):
    """ View to create a new user. Only accepts POST requests """
    queryset = User.objects.all()
    serializer_class = BuySerializer
    permission_classes = (permissions.IsAdminUser, )
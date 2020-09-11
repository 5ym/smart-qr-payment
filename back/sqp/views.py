from .models import User, Verify, Product
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

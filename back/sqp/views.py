from .models import User, Verify
from rest_framework import generics, permissions
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
    permission_classes = (permissions.IsAuthenticated, )
    lookup_field = 'activate__code'

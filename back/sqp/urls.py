from django.urls import path
from .views import *

urlpatterns = [
    path('users/', UserList.as_view()),
    path('register/', UserCreate.as_view()),
    path('users/<pk>/', UserRetrieveUpdate.as_view())
]
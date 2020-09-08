from django.urls import path
from .views import *

urlpatterns = [
    path('register/', UserCreate.as_view()),
    path('activate/<pk>/', UserActivate.as_view())
]
from django.urls import path
from .views import *

urlpatterns = [
    path('register/', UserCreate.as_view()),
    path('verify/<activate__code>/', UserVerify.as_view())
]
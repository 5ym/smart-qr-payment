from django.urls import path
from .views import *

urlpatterns = [
    path('register/', UserCreate.as_view()),
    path('verify/<verify__code>/', UserVerify.as_view()),
    path('products', ProductList.as_view()),
    path('order', OrderGet.as_view())
]
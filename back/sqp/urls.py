from django.urls import path
from .views import *

urlpatterns = [
    path('register', UserCreate.as_view()),
    path('verify/<verify__code>', UserVerify.as_view()),
    path('products', ProductList.as_view()),
    path('order', OrderGet.as_view()),
    path('pay', PayCreate.as_view()),
    path('pay/secure', SecurePayCreate.as_view()),
    path('qr', CodeGet.as_view()),
    path('orad/get/<code>', OrderGetAdmin.as_view()),
    path('orad/receive/<code>', OrderSetAdmin.as_view()),
    path('orad/list', OrderListAdmin.as_view()),
    path('buy', BuyAdmin.as_view())
]
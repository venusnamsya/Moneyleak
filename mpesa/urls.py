from django.urls import path
from . import views

urlpatterns = [
    path("callback/", views.mpesa_callback, name="mpesa-callback"),
    path("stkpush/", views.stk_push, name="mpesa-stkpush"),
]
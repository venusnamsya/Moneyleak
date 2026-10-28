from django.urls import path
from . import views
from django.conf import settings
from django.db import models

urlpatterns = [
    path("callback/", views.mpesa_callback, name="mpesa-callback"),
    path("stkpush/", views.stk_push, name="mpesa-stkpush"),
    path(
        "transactions/",
        views.mpesa_transaction_history,
        name="mpesa-transaction-history",
    ),
]
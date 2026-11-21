from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, EmailLoginView, user_profile
from .password_reset_views import (
    RequestPasswordResetOTP,
    ConfirmPasswordResetOTP
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", EmailLoginView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("profile/", user_profile, name="user_profile"),
    path(
        "password-reset/request/",
        RequestPasswordResetOTP.as_view(),
        name="password_reset_request"
    ),
    path(
        "password-reset/confirm/",
        ConfirmPasswordResetOTP.as_view(),
        name="password_reset_confirm"
    ),
]
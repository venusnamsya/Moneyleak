import secrets
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

from .models import UserProfile, PasswordResetOTP
from .sms_service import send_sms

User = get_user_model()


def get_profile_by_phone(raw_phone: str):
    phone = str(raw_phone).strip().replace(" ", "")
    if phone.startswith("+254"):
        local_phone = "0" + phone[4:]
        intl_phone = phone
    elif phone.startswith("254"):
        local_phone = "0" + phone[3:]
        intl_phone = "+" + phone
    elif phone.startswith("0"):
        local_phone = phone
        intl_phone = "+254" + phone[1:]
    else:
        local_phone = intl_phone = phone

    profile = UserProfile.objects.select_related("user").filter(
        phone_number__in=[local_phone, intl_phone]
    ).first()
    return profile, intl_phone


class RequestPasswordResetOTP(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        profile, intl_phone = get_profile_by_phone(
            request.data.get("phone_number", "")
        )

        # Use the same response whether or not the number exists.
        response_message = (
            "If the number is registered, a verification code will be sent."
        )

        if not profile:
            print("DEBUG: No UserProfile found for:", intl_phone)
            return Response({"message": response_message})

        recent_otp = PasswordResetOTP.objects.filter(
            user=profile.user,
            created_at__gte=timezone.now() - timedelta(minutes=1)
        ).exists()

        if recent_otp:
            return Response(
                {"message": "Please wait before requesting another code."},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        otp = str(secrets.randbelow(900000) + 100000)

        PasswordResetOTP.objects.filter(
            user=profile.user,
            is_used=False
        ).update(is_used=True)

        record = PasswordResetOTP.objects.create(
            user=profile.user,
            otp_hash=make_password(otp),
            expires_at=timezone.now() + timedelta(minutes=5)
        )

        try:
            send_sms(
                intl_phone,
                f"Your MoneyLeak password reset code is {otp}. "
                "It expires in 5 minutes."
            )
        except Exception as exc:
            print("DEBUG SMS ERROR:", exc)
            record.delete()
            return Response(
                {"error": "Unable to send SMS. Please try again later."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        return Response({"message": response_message})


class ConfirmPasswordResetOTP(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        profile, _ = get_profile_by_phone(request.data.get("phone_number", ""))
        otp = request.data.get("otp", "").strip()
        new_password = request.data.get("new_password", "")

        if not profile or not otp or not new_password:
            return Response(
                {"error": "Invalid or expired code."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                record = PasswordResetOTP.objects.select_for_update().filter(
                    user=profile.user,
                    is_used=False
                ).order_by("-created_at").first()

                if not record or not record.is_valid():
                    return Response(
                        {"error": "Invalid or expired code."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                record.attempts += 1
                record.save(update_fields=["attempts"])

                if not check_password(otp, record.otp_hash):
                    return Response(
                        {"error": "Invalid or expired code."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                try:
                    validate_password(new_password, profile.user)
                except ValidationError as exc:
                    return Response(
                        {"error": list(exc.messages)},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                profile.user.set_password(new_password)
                profile.user.save(update_fields=["password"])

                record.is_used = True
                record.save(update_fields=["is_used"])

        except Exception:
            return Response(
                {"error": "Password reset failed. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response({"message": "Password successfully reset."})
from django.contrib.auth import get_user_model, authenticate
from django.db import transaction
from rest_framework import serializers
import re

from .models import UserProfile

User = get_user_model()


class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        required=True
    )

    email = serializers.EmailField(required=True)
    phone = serializers.CharField(
        write_only=True,
        required=True
    )

    class Meta:
        model = User
        fields = ["id", "username", "email", "phone", "password"]

    def validate_email(self, value):
        value = value.strip().lower()

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return value

    def validate_phone(self, value):
        digits = re.sub(r"\D", "", value.strip())

        # Convert common Kenyan formats to international format.
        if len(digits) == 10 and digits.startswith("0"):
            digits = "254" + digits[1:]
        elif len(digits) == 9 and digits.startswith(("7", "1")):
            digits = "254" + digits

        if not 8 <= len(digits) <= 15 or digits.startswith("0"):
            raise serializers.ValidationError(
                "Enter a valid international phone number."
            )

        phone = "+" + digits

        if UserProfile.objects.filter(
            phone_number=phone
        ).exists():
            raise serializers.ValidationError(
                "An account with this phone number already exists."
            )

        return phone

    @transaction.atomic
    def create(self, validated_data):
        phone = validated_data.pop("phone")

        user = User.objects.create_user(**validated_data)

        UserProfile.objects.create(
            user=user,
            phone_number=phone
        )

        return user


class EmailLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs["email"].strip()

        user = User.objects.filter(email__iexact=email).first()

        if not user:
            raise serializers.ValidationError(
                "Invalid email or password."
            )

        authenticated_user = authenticate(
            request=self.context.get("request"),
            username=user.get_username(),
            password=attrs["password"]
        )

        if not authenticated_user:
            raise serializers.ValidationError(
                "Invalid email or password."
            )

        attrs["user"] = authenticated_user
        return attrs
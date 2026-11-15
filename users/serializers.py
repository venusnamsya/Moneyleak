from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers

User = get_user_model()


class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        required=True
    )

    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def validate_email(self, value):
        value = value.strip().lower()

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


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
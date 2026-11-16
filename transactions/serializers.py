from rest_framework import serializers

from .models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            "id",
            "date",
            "description",
            "amount",
            "category",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_description(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Description is required."
            )

        return value
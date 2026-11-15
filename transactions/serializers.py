from rest_framework import serializers

from .models import Transaction
from .category_service import CATEGORY_DESCRIPTIONS


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

    def validate(self, data):
        category = data.get(
            "category",
            getattr(self.instance, "category", None)
        )

        description = data.get(
            "description",
            getattr(self.instance, "description", None)
        )

        if category not in CATEGORY_DESCRIPTIONS:
            raise serializers.ValidationError({
                "category": "Please select a valid category."
            })

        if description not in CATEGORY_DESCRIPTIONS[category]:
            raise serializers.ValidationError({
                "description": (
                    f"Please select a valid description for {category}."
                )
            })

        return data
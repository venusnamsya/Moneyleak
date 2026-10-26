from django.db import models


class MpesaTransaction(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("SUCCESS", "Success"),
        ("FAILED", "Failed"),
    ]

    checkout_request_id = models.CharField(
        max_length=100, unique=True
    )
    merchant_request_id = models.CharField(
        max_length=100, blank=True
    )
    receipt_number = models.CharField(
        max_length=30, unique=True, null=True, blank=True
    )
    phone_number = models.CharField(max_length=20)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_date = models.DateTimeField(null=True, blank=True)
    account_reference = models.CharField(
        max_length=100, blank=True
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="PENDING",
    )
    result_description = models.TextField(blank=True)
    callback_data = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return (
            f"{self.checkout_request_id} - "
            f"{self.status} - KSh {self.amount}"
        )
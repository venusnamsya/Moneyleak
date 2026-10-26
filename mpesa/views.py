import json
from datetime import datetime

from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from .models import MpesaTransaction
import os
import re
from decimal import Decimal, InvalidOperation
from django.views.decorators.http import require_POST
from mpesa_service import initiate_stk_push


@csrf_exempt
def mpesa_callback(request):
    if request.method != "POST":
        return JsonResponse(
            {"error": "POST required"}, status=405
        )

    try:
        data = json.loads(request.body)
        callback = data["Body"]["stkCallback"]
        checkout_id = callback["CheckoutRequestID"]
        result_code = callback["ResultCode"]

        transaction = MpesaTransaction.objects.get(
            checkout_request_id=checkout_id
        )

        transaction.result_description = callback.get(
            "ResultDesc", ""
        )
        transaction.callback_data = data

        if result_code == 0:
            items = callback.get(
                "CallbackMetadata", {}
            ).get("Item", [])

            metadata = {
                item["Name"]: item.get("Value")
                for item in items
            }

            receipt = metadata.get("MpesaReceiptNumber")

            if not receipt:
                return JsonResponse(
                    {"error": "Missing receipt number"},
                    status=400,
                )

            transaction.receipt_number = receipt
            transaction.amount = metadata.get(
                "Amount", transaction.amount
            )

            raw_date = metadata.get("TransactionDate")
            if raw_date:
                parsed_date = datetime.strptime(
                    str(raw_date), "%Y%m%d%H%M%S"
                )
                transaction.transaction_date = (
                    timezone.make_aware(parsed_date)
                )

            transaction.status = "SUCCESS"
        else:
            transaction.status = "FAILED"

        transaction.save()

        return JsonResponse({"ResultCode": 0, "ResultDesc": "Accepted"})

    except MpesaTransaction.DoesNotExist:
        return JsonResponse(
            {"error": "Unknown checkout request"}, status=404
        )
    except (KeyError, ValueError, TypeError, json.JSONDecodeError):
        return JsonResponse(
            {"error": "Invalid callback payload"}, status=400
        )


@csrf_exempt
@require_POST
def stk_push(request):
    try:
        body = json.loads(request.body)

        phone = re.sub(r"[\s+]", "", body.get("phone", ""))
        if phone.startswith("0"):
            phone = "254" + phone[1:]
        elif phone.startswith("7") or phone.startswith("1"):
            phone = "254" + phone

        if not re.fullmatch(r"254[17]\d{8}", phone):
            return JsonResponse(
                {"error": "Enter a valid Kenyan mobile number"},
                status=400,
            )

        amount = Decimal(str(body.get("amount", "")))
        if not amount.is_finite() or amount != amount.to_integral_value():
            return JsonResponse(
                {"error": "Amount must be a whole number"},
                status=400,
            )
        if amount < 1 or amount > 150000:
            return JsonResponse(
                {"error": "Amount is outside the allowed test range"},
                status=400,
            )

        result = initiate_stk_push(
            phone=phone,
            amount=int(amount),
        )

        checkout_id = result.get("CheckoutRequestID")
        if not checkout_id:
            return JsonResponse(
                {"error": "Daraja did not return a checkout ID",
                 "daraja": result},
                status=502,
            )

        transaction, created = MpesaTransaction.objects.get_or_create(
            checkout_request_id=checkout_id,
            defaults={
                "merchant_request_id": result.get(
                    "MerchantRequestID", ""
                ),
                "phone_number": phone,
                "amount": amount,
                "account_reference": "MoneyLeak",
                "status": "PENDING",
            },
        )

        return JsonResponse({
            "message": "STK Push requested",
            "status": transaction.status,
            "checkout_request_id": checkout_id,
            "created": created,
            "daraja_response": result,
        }, status=200)

    except (ValueError, InvalidOperation, TypeError, json.JSONDecodeError):
        return JsonResponse(
            {"error": "Invalid phone number, amount or JSON"},
            status=400,
        )
    except Exception:
        return JsonResponse(
            {"error": "Unable to initiate payment. Check server logs."},
            status=502,
        )
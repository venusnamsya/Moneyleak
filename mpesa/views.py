import json
from datetime import datetime

from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from .models import MpesaTransaction


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
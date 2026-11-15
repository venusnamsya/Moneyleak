import json
import re
import logging
from datetime import datetime
from decimal import Decimal, InvalidOperation

from django.db import transaction as db_transaction
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import MpesaTransaction, MpesaCallback
from mpesa_service import initiate_stk_push

logger = logging.getLogger(__name__)


def apply_callback(mpesa_transaction, data):
    callback = data.get("Body", {}).get("stkCallback", {})

    if not callback:
        raise ValueError("Missing stkCallback object")

    result_code = int(callback.get("ResultCode", -1))
    mpesa_transaction.result_description = callback.get("ResultDesc", "")
    mpesa_transaction.callback_data = data

    if result_code == 0:
        items = callback.get("CallbackMetadata", {}).get("Item", [])
        metadata = {
            item.get("Name"): item.get("Value")
            for item in items if item.get("Name")
        }

        receipt = metadata.get("MpesaReceiptNumber")

        if not receipt:
            raise ValueError("Missing M-Pesa receipt number")

        mpesa_transaction.receipt_number = receipt
        mpesa_transaction.amount = metadata.get(
            "Amount", mpesa_transaction.amount
        )

        raw_date = metadata.get("TransactionDate")

        if raw_date:
            parsed_date = datetime.strptime(
                str(raw_date), "%Y%m%d%H%M%S"
            )
            mpesa_transaction.transaction_date = timezone.make_aware(
                parsed_date
            )

        mpesa_transaction.status = "SUCCESS"
    else:
        mpesa_transaction.status = "FAILED"

    mpesa_transaction.save()


@csrf_exempt
@require_POST
def mpesa_callback(request):
    try:
        data = json.loads(request.body)
        callback = data.get("Body", {}).get("stkCallback", {})
        checkout_id = callback.get("CheckoutRequestID")

        if not checkout_id:
            return JsonResponse(
                {"error": "Missing CheckoutRequestID"}, status=400
            )

        with db_transaction.atomic():
            mpesa_transaction = (
                MpesaTransaction.objects.select_for_update()
                .filter(checkout_request_id=checkout_id)
                .first()
            )

            if mpesa_transaction is None:
                MpesaCallback.objects.update_or_create(
                    checkout_request_id=checkout_id,
                    defaults={"payload": data},
                )
            else:
                apply_callback(mpesa_transaction, data)

        return JsonResponse({
            "ResultCode": 0,
            "ResultDesc": "Accepted"
        })

    except (KeyError, ValueError, TypeError, json.JSONDecodeError):
        logger.warning("M-Pesa callback parsing failed")
        return JsonResponse(
            {"error": "Invalid callback payload structure"}, status=400
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def stk_push(request):
    try:
        phone = re.sub(r"[\s+]", "", request.data.get("phone", ""))

        if phone.startswith("0"):
            phone = "254" + phone[1:]
        elif phone.startswith(("7", "1")):
            phone = "254" + phone

        if not re.fullmatch(r"254\d{9}", phone):
            return Response(
                {"error": "Enter a valid Kenyan mobile number."},
                status=status.HTTP_400_BAD_REQUEST
            )

        amount = Decimal(str(request.data.get("amount", "")))

        if not amount.is_finite() or amount != amount.to_integral_value():
            return Response(
                {"error": "Amount must be a whole number."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if amount < 1 or amount > 150000:
            return Response(
                {"error": "Amount is outside the allowed test range."},
                status=status.HTTP_400_BAD_REQUEST
            )

        result = initiate_stk_push(
            phone=phone,
            amount=int(amount)
        )

        checkout_id = result.get("CheckoutRequestID")
        merchant_id = result.get("MerchantRequestID")

        if not checkout_id or not merchant_id:
            return Response(
                {"error": "Daraja did not return the required request IDs."},
                status=status.HTTP_502_BAD_GATEWAY
            )

        with db_transaction.atomic():
            mpesa_transaction, created = (
                MpesaTransaction.objects.get_or_create(
                    checkout_request_id=checkout_id,
                    defaults={
                        "user": request.user,
                        "merchant_request_id": merchant_id,
                        "phone_number": phone,
                        "amount": amount,
                        "account_reference": "MoneyLeak",
                        "status": "PENDING",
                    }
                )
            )

            pending_callback = MpesaCallback.objects.filter(
                checkout_request_id=checkout_id
            ).first()

            if pending_callback:
                apply_callback(
                    mpesa_transaction,
                    pending_callback.payload
                )
                pending_callback.delete()

        return Response({
            "message": "STK Push requested",
            "status": mpesa_transaction.status,
            "checkout_request_id": checkout_id,
            "created": created,
        })

    except (ValueError, InvalidOperation, TypeError):
        return Response(
            {"error": "Invalid phone number, amount or request data."},
            status=status.HTTP_400_BAD_REQUEST
        )

    except Exception:
        logger.exception("STK Push initiation failed")
        return Response(
            {"error": "Unable to initiate payment. Check server logs."},
            status=status.HTTP_502_BAD_GATEWAY
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def mpesa_transaction_history(request):
    transactions = MpesaTransaction.objects.filter(
        user=request.user
    ).order_by("-created_at")

    data = [
        {
            "checkout_request_id": item.checkout_request_id,
            "merchant_request_id": item.merchant_request_id,
            "receipt_number": item.receipt_number,
            "phone_number": item.phone_number,
            "amount": str(item.amount),
            "transaction_date": item.transaction_date,
            "account_reference": item.account_reference,
            "status": item.status,
            "result_description": item.result_description,
            "created_at": item.created_at,
        }
        for item in transactions
    ]

    return Response({
        "count": len(data),
        "transactions": data
    })
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

from rest_framework.decorators import (
    api_view,
    permission_classes,
)
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

    mpesa_transaction.result_description = callback.get(
        "ResultDesc", ""
    )
    mpesa_transaction.callback_data = data

    if result_code == 0:
        items = callback.get(
            "CallbackMetadata", {}
        ).get("Item", [])

        metadata = {
            item.get("Name"): item.get("Value")
            for item in items
            if item.get("Name")
        }

        receipt = metadata.get("MpesaReceiptNumber")

        if not receipt:
            raise ValueError(
                "Missing M-Pesa receipt number in success metadata"
            )

        mpesa_transaction.receipt_number = receipt
        mpesa_transaction.amount = metadata.get(
            "Amount", mpesa_transaction.amount
        )

        raw_date = metadata.get("TransactionDate")

        if raw_date:
            parsed_date = datetime.strptime(
                str(raw_date), "%Y%m%d%H%M%S"
            )
            mpesa_transaction.transaction_date = (
                timezone.make_aware(parsed_date)
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
                {"error": "Missing CheckoutRequestID"},
                status=400,
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
            "ResultDesc": "Accepted",
        })

    except (
        KeyError,
        ValueError,
        TypeError,
        json.JSONDecodeError,
    ) as exc:
        logger.warning("M-Pesa callback parsing failed: %s", exc)
        return JsonResponse(
            {"error": "Invalid callback payload structure"},
            status=400,
        )


@csrf_exempt
@require_POST
def stk_push(request):
    # Require a valid JWT access token.
    from rest_framework_simplejwt.authentication import (
        JWTAuthentication,
    )

    authenticated = JWTAuthentication().authenticate(request)

    if authenticated is None:
        return JsonResponse(
            {"error": "Authentication required. Supply a valid Bearer token."},
            status=401,
        )

    user, token = authenticated

    try:
        body = json.loads(request.body)

        phone = re.sub(r"[\s+]", "", body.get("phone", ""))

        if phone.startswith("0"):
            phone = "254" + phone[1:]
        elif phone.startswith(("7", "1")):
            phone = "254" + phone

        if not re.fullmatch(r"254\d{9}", phone):
            return JsonResponse(
                {
                    "error": "Enter a valid Kenyan mobile number "
                             "(e.g. 2547XXXXXXXX)"
                },
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
        merchant_id = result.get("MerchantRequestID")

        if not checkout_id or not merchant_id:
            return JsonResponse(
                {
                    "error": "Daraja did not return the required request IDs",
                    "daraja": result,
                },
                status=502,
            )

        with db_transaction.atomic():
            mpesa_transaction, created = (
                MpesaTransaction.objects.get_or_create(
                    checkout_request_id=checkout_id,
                    defaults={
                        "user": user,
                        "merchant_request_id": merchant_id,
                        "phone_number": phone,
                        "amount": amount,
                        "account_reference": "MoneyLeak",
                        "status": "PENDING",
                    },
                )
            )

            pending_callback = MpesaCallback.objects.filter(
                checkout_request_id=checkout_id
            ).first()

            if pending_callback:
                apply_callback(
                    mpesa_transaction,
                    pending_callback.payload,
                )
                pending_callback.delete()

        return JsonResponse({
            "message": "STK Push requested",
            "status": mpesa_transaction.status,
            "checkout_request_id": checkout_id,
            "created": created,
            "daraja_response": result,
        })

    except (
        ValueError,
        InvalidOperation,
        TypeError,
        json.JSONDecodeError,
    ):
        return JsonResponse(
            {"error": "Invalid phone number, amount or JSON"},
            status=400,
        )
    except Exception:
        logger.exception("STK Push initiation failed")
        return JsonResponse(
            {"error": "Unable to initiate payment. Check server logs."},
            status=502,
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
        "transactions": data,
    })
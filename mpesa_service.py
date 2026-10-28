import os
import base64
from datetime import datetime
import requests


def get_access_token():
    key = os.getenv("MPESA_CONSUMER_KEY")
    secret = os.getenv("MPESA_CONSUMER_SECRET")

    if not key or not secret:
        raise ValueError("Daraja credentials are missing")

    credentials = f"{key}:{secret}"
    encoded = base64.b64encode(credentials.encode()).decode()

    response = requests.get(
        "https://sandbox.safaricom.co.ke/oauth/v1/generate",
        params={"grant_type": "client_credentials"},
        headers={"Authorization": f"Basic {encoded}"},
        timeout=20,
    )
    response.raise_for_status()
    return response.json()["access_token"]


def initiate_stk_push(phone, amount, account_reference="MoneyLeak",
                      description="MoneyLeak payment"):
    token = get_access_token()

    shortcode = os.getenv("MPESA_SHORTCODE")
    passkey = os.getenv("MPESA_PASSKEY")

    if not shortcode or not passkey:
        raise ValueError("Sandbox shortcode or passkey is missing")

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    password = base64.b64encode(
        f"{shortcode}{passkey}{timestamp}".encode()
    ).decode()

    payload = {
        "BusinessShortCode": shortcode,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(amount),
        "PartyA": phone,
        "PartyB": shortcode,
        "PhoneNumber": phone,
        "CallBackURL": os.getenv("MPESA_CALLBACK_URL"),
        "AccountReference": account_reference,
        "TransactionDesc": description,
    }

    response = requests.post(
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
        timeout=30,
    )
    response.raise_for_status()
    return response.json()
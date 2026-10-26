import os
import base64
import requests
from dotenv import load_dotenv

load_dotenv()

consumer_key = os.getenv("MPESA_CONSUMER_KEY")
consumer_secret = os.getenv("MPESA_CONSUMER_SECRET")

if not consumer_key or not consumer_secret:
    raise ValueError("Missing Daraja credentials in .env")

credentials = f"{consumer_key}:{consumer_secret}"
encoded = base64.b64encode(credentials.encode()).decode()

response = requests.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate",
    params={"grant_type": "client_credentials"},
    headers={"Authorization": f"Basic {encoded}"},
    timeout=20,
)

print("HTTP status:", response.status_code)

if response.ok:
    data = response.json()
    print("Access token received:", bool(data.get("access_token")))
    print("Expires in:", data.get("expires_in"), "seconds")
else:
    print("Request failed. Check your app credentials and API access.")
    print(response.text[:500])
import os
import logging
import africastalking

logger = logging.getLogger(__name__)


def send_sms(phone_number, message):
    phone_number = str(phone_number).strip()
    if phone_number.startswith("0"):
        phone_number = "+254" + phone_number[1:]
    elif phone_number.startswith("254"):
        phone_number = "+" + phone_number

    username = os.getenv("AFRICASTALKING_USERNAME", "sandbox")
    api_key = os.getenv("AFRICASTALKING_API_KEY")

    if not api_key:
        raise ValueError("Africa's Talking API key is missing.")

    africastalking.initialize(username, api_key)

    sms = africastalking.SMS

    response = sms.send(
        message,
        [phone_number],
        timeout=(10, 30)
    )

    logger.info("Africa's Talking response: %s", response)
    print("AT RESPONSE:", response)

    return response
import csv
import io
from datetime import datetime
from decimal import Decimal, InvalidOperation

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

from .models import Transaction


def parse_csv_date(value):
    formats = [
        "%Y-%m-%d",
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%d.%m.%Y",
        "%m/%d/%Y",
        "%Y/%m/%d",
    ]

    for date_format in formats:
        try:
            return datetime.strptime(value.strip(), date_format).date()
        except ValueError:
            continue

    raise ValueError(
        "Invalid date. Use YYYY-MM-DD or DD/MM/YYYY."
    )


def parse_csv_amount(value):
    cleaned = (
        value.strip()
        .replace(",", "")
        .replace("KSh", "")
        .replace("KES", "")
        .replace("ksh", "")
        .replace("kes", "")
        .strip()
    )

    try:
        amount = Decimal(cleaned)
    except InvalidOperation:
        raise ValueError("Invalid amount.")

    if not amount.is_finite() or amount <= 0:
        raise ValueError("Amount must be greater than zero.")

    return amount


class CSVImportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        uploaded_file = request.FILES.get("file")

        if not uploaded_file:
            return Response(
                {"error": "Please select a CSV file."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not uploaded_file.name.lower().endswith(".csv"):
            return Response(
                {"error": "Only CSV files are supported."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            raw_content = uploaded_file.read()

            try:
                content = raw_content.decode("utf-8-sig")
            except UnicodeDecodeError:
                content = raw_content.decode("cp1252")

            reader = csv.DictReader(io.StringIO(content))

            if not reader.fieldnames:
                return Response(
                    {"error": "The CSV file is empty or has no headers."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            headers = {
                (header or "").strip().lower()
                for header in reader.fieldnames
            }

            required = {
                "date",
                "description",
                "amount",
                "category",
            }

            missing = required - headers

            if missing:
                return Response(
                    {
                        "error": (
                            "Missing required columns: "
                            + ", ".join(sorted(missing))
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            allowed_categories = {
                choice[0].lower(): choice[0]
                for choice in Transaction.CATEGORY_CHOICES
            }

            created = 0
            errors = []

            for line_number, row in enumerate(reader, start=2):

                if not row or not any(
                    str(value or "").strip()
                    for value in row.values()
                ):
                    continue

                normalised_row = {
                    (key or "").strip().lower(): (
                        value or ""
                    ).strip()
                    for key, value in row.items()
                    if key is not None
                }

                try:
                    date_value = parse_csv_date(
                        normalised_row.get("date", "")
                    )

                    description = normalised_row.get(
                        "description", ""
                    )

                    if not description:
                        raise ValueError(
                            "Description is required."
                        )

                    if len(description) > 255:
                        raise ValueError(
                            "Description cannot exceed 255 characters."
                        )

                    amount = parse_csv_amount(
                        normalised_row.get("amount", "")
                    )

                    category_input = normalised_row.get(
                        "category", ""
                    ).lower()

                    category = allowed_categories.get(
                        category_input
                    )

                    if not category:
                        raise ValueError(
                            "Unknown category. Check your category name."
                        )

                    Transaction.objects.create(
                        user=request.user,
                        date=date_value,
                        description=description,
                        amount=amount,
                        category=category,
                    )

                    created += 1

                except (
                    ValueError,
                    KeyError,
                    InvalidOperation,
                ) as exc:
                    errors.append({
                        "line": line_number,
                        "error": str(exc),
                    })

            skipped = len(errors)

            if created and skipped:
                message = (
                    f"Imported {created} transactions. "
                    f"{skipped} rows were skipped."
                )
            elif created:
                message = (
                    f"Successfully imported {created} transactions."
                )
            else:
                message = (
                    "No transactions were imported. "
                    "Please check the CSV errors."
                )

            return Response(
                {
                    "message": message,
                    "created": created,
                    "skipped": skipped,
                    "errors": errors,
                },
                status=status.HTTP_200_OK,
            )

        except (UnicodeDecodeError, csv.Error):
            return Response(
                {"error": "Unable to read this CSV file."},
                status=status.HTTP_400_BAD_REQUEST,
            )
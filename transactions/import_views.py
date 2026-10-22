import csv
import io
from datetime import datetime
from decimal import Decimal, InvalidOperation

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

from .models import Transaction


class CSVImportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        uploaded_file = request.FILES.get("file")

        if not uploaded_file:
            return Response(
                {"error": "Upload a CSV file using the 'file' field."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            content = uploaded_file.read().decode("utf-8-sig")
            reader = csv.DictReader(io.StringIO(content))

            required = {"date", "description", "amount", "category"}
            headers = {
                (header or "").strip().lower()
                for header in (reader.fieldnames or [])
            }

            if not required.issubset(headers):
                return Response(
                    {
                        "error": "CSV must contain date, description, amount, category columns."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            created = 0
            errors = []
            allowed_categories = {
                choice[0] for choice in Transaction.CATEGORY_CHOICES
            }

            for line_number, row in enumerate(reader, start=2):
                row = {
                    (key or "").strip().lower(): (value or "").strip()
                    for key, value in row.items()
                }

                try:
                    date_value = datetime.strptime(
                        row["date"], "%Y-%m-%d"
                    ).date()
                    description = row["description"]
                    amount = Decimal(row["amount"])
                    category = row["category"]

                    if not description:
                        raise ValueError("Description is required.")
                    if not amount.is_finite():
                        raise ValueError("Amount must be finite.")
                    if amount <= 0:
                        raise ValueError("Amount must be greater than zero.")
                    if category not in allowed_categories:
                        raise ValueError("Unknown category.")

                    Transaction.objects.create(
                        user=request.user,
                        date=date_value,
                        description=description,
                        amount=amount,
                        category=category,
                    )
                    created += 1

                except (ValueError, KeyError, InvalidOperation) as exc:
                    errors.append({
                        "line": line_number,
                        "error": str(exc),
                    })

            return Response(
                {"created": created, "errors": errors},
                status=status.HTTP_200_OK,
            )

        except (UnicodeDecodeError, csv.Error):
            return Response(
                {"error": "Invalid CSV file."},
                status=status.HTTP_400_BAD_REQUEST,
            )


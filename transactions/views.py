from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from django.db.models.functions import Coalesce
from django.db.models import DecimalField
from decimal import Decimal

from .models import Transaction
from .serializers import TransactionSerializer


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(
            user=self.request.user
        ).order_by("-date", "-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        transactions = Transaction.objects.filter(
            user=request.user
        )

        category = request.query_params.get("category")
        search = request.query_params.get("search")
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")

        if category and category.lower() != "all":
            transactions = transactions.filter(
                category__iexact=category
            )

        if search:
            transactions = transactions.filter(
                description__icontains=search
            )

        if start_date:
            transactions = transactions.filter(
                date__gte=start_date
            )

        if end_date:
            transactions = transactions.filter(
                date__lte=end_date
            )

        total_income = transactions.filter(
            category="Income"
        ).aggregate(
            total=Coalesce(
                Sum("amount"),
                Decimal("0.00"),
                output_field=DecimalField()
            )
        )["total"]

        total_expenses = transactions.exclude(
            category="Income"
        ).aggregate(
            total=Coalesce(
                Sum("amount"),
                Decimal("0.00"),
                output_field=DecimalField()
            )
        )["total"]

        category_breakdown = (
            transactions.exclude(category="Income")
            .values("category")
            .annotate(total=Sum("amount"))
            .order_by("-total")
        )

        return Response({
            "total_income": total_income,
            "total_expenses": total_expenses,
            "balance": total_income - total_expenses,
            "category_breakdown": list(category_breakdown),
            "transaction_count": transactions.count(),
        })
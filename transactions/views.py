from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Q
from .models import Transaction
from .serializers import TransactionSerializer


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        transactions = Transaction.objects.filter(user=request.user)

        income = transactions.filter(
            category="Income"
        ).aggregate(total=Sum("amount"))["total"] or 0

        expenses = transactions.exclude(
            category="Income"
        ).aggregate(total=Sum("amount"))["total"] or 0

        spending = (
            transactions.exclude(category="Income")
            .values("category")
            .annotate(total=Sum("amount"))
            .order_by("-total")
        )

        return Response({
            "total_income": f"{income:.2f}",
            "total_expenses": f"{expenses:.2f}",
            "balance": f"{income - expenses:.2f}",
            "spending_by_category": [
                {
                    "category": item["category"],
                    "total": f'{item["total"]:.2f}'
                }
                for item in spending
            ]
        })
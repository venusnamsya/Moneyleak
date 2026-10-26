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

    def get_queryset(self):
        queryset = Transaction.objects.filter(user=self.request.user)

        category = self.request.query_params.get("category")
        search = self.request.query_params.get("search")
        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")

        if category:
            queryset = queryset.filter(category=category)

        if search:
            queryset = queryset.filter(description__icontains=search)

        if start_date:
             queryset = queryset.filter(date__gte=start_date)

        if end_date:
            queryset = queryset.filter(date__lte=end_date)

        return queryset

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
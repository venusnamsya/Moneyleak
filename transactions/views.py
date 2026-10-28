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
        queryset = Transaction.objects.filter(user=self.request.user)
       
        search = self.request.query_params.get("search")

        if search:
            queryset = queryset.filter(description__icontains=search)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        queryset = Transaction.objects.filter(user=request.user)

        category = request.query_params.get("category")
        search = request.query_params.get("search")
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")

        if category:
            queryset = queryset.filter(category=category)

        if search:
            queryset = queryset.filter(description__icontains=search)

        if start_date:
            queryset = queryset.filter(date__gte=start_date)

        if end_date:
            queryset = queryset.filter(date__lte=end_date)

        income = queryset.filter(
            amount__gt=0
        ).aggregate(total=Sum("amount"))["total"] or 0

        expenses = abs(
            queryset.filter(
                amount__lt=0
            ).aggregate(total=Sum("amount"))["total"] or 0
        )

        spending = (
            queryset.filter(amount__lt=0)
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
                    "total": f"{abs(item['total']):.2f}"
                }
                for item in spending
            ]
        })
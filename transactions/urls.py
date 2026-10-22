from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet, AnalyticsView
from .import_views import CSVImportView

router = DefaultRouter()
router.register(
    "transactions",
    TransactionViewSet,
    basename="transaction"
)

urlpatterns = [
    path("analytics/", AnalyticsView.as_view(), name="analytics"),
    path("import-csv/", CSVImportView.as_view(), name="csv-import"),
] + router.urls
from rest_framework import generics, permissions
from .serializers import RegistrationSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.AllowAny]

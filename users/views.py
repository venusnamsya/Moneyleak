from rest_framework import generics, permissions
from .serializers import RegistrationSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response


class RegisterView(generics.CreateAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.AllowAny]

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request):
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
    })
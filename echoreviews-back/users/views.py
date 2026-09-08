from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegistroSerializer


def datos_publicos(user):
    """Los campos del usuario que la aplicación necesita mostrar."""
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "full_name": f"{user.first_name} {user.last_name}".strip() or user.username,
        "date_joined": user.date_joined,
    }


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(datos_publicos(request.user))


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """Crear una cuenta.

    Devuelve el par de tokens junto con el usuario, así que quien se registra
    queda con la sesión iniciada. La alternativa —registrarse y después pedir
    que inicie sesión con lo que acaba de escribir— es un paso de más sin
    ninguna ganancia: el servidor ya comprobó esas credenciales al crearlas.
    """
    serializer = RegistroSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = serializer.save()
    refresh = RefreshToken.for_user(user)

    return Response(
        {
            "user": datos_publicos(user),
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        },
        status=status.HTTP_201_CREATED,
    )

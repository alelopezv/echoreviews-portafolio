from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


class SoftJWTAuthentication(JWTAuthentication):
    """
    Igual que JWTAuthentication pero si el token es inválido o expirado
    simplemente retorna None en vez de lanzar 401.
    Esto permite que endpoints públicos (AllowAny) sigan funcionando
    aunque el cliente envíe un token expirado.
    """
    def authenticate(self, request):
        try:
            return super().authenticate(request)
        except (InvalidToken, TokenError):
            return None

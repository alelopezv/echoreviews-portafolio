from drf_spectacular.extensions import OpenApiAuthenticationExtension
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


class SoftJWTScheme(OpenApiAuthenticationExtension):
    """Le explica a drf-spectacular cómo se autentica esta API.

    Sin esto, el generador avisaba «could not resolve authenticator» en cada
    una de las veinte vistas y las dejaba sin ningún esquema de seguridad: la
    documentación mostraba todos los endpoints como si fueran públicos, y no
    aparecía el botón para pegar un token y probarlos.

    Es una clase de solo declaración —drf-spectacular la encuentra sola al
    importarse este módulo— y por eso vive al lado de la clase que describe,
    donde se ve si una cambia y la otra no.
    """

    target_class = "echoreviews.authentication.SoftJWTAuthentication"
    name = "jwtAuth"

    def get_security_definition(self, auto_schema):
        return {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": (
                "Token de acceso obtenido en `/api/token/`. Se manda en la "
                "cabecera `Authorization: Bearer <token>` y dura una hora."
            ),
        }

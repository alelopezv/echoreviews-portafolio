from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as ErrorDeDjango
from rest_framework import serializers


class RegistroSerializer(serializers.Serializer):
    """Alta de una cuenta nueva.

    Es un Serializer a secas y no un ModelSerializer a propósito. Un
    ModelSerializer sobre User expone los campos del modelo, y ese modelo
    incluye `is_staff` y `is_superuser`: bastaría con que alguien mandara
    {"username": "x", "password": "y", "is_superuser": true} para darse
    permisos de administrador. Declarando los tres campos a mano, la
    superficie de escritura es exactamente la que se ve acá.
    """

    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)

    # El nombre con el que la persona firma sus reseñas. Va entero a
    # first_name en vez de partirse en nombre y apellido: separar por el
    # primer espacio funciona en inglés y falla acá, donde casi todo el mundo
    # tiene dos apellidos. Si alguien quiere afinarlo, están los dos campos
    # del modelo disponibles desde el admin.
    #
    # Es opcional: sin él, full_name cae al nombre de usuario.
    first_name = serializers.CharField(
        max_length=150, required=False, allow_blank=True
    )

    def validate_username(self, valor):
        nombre = valor.strip()

        if not nombre:
            raise serializers.ValidationError("El nombre de usuario no puede estar vacío.")

        # __iexact y no un filtro exacto: Django distingue mayúsculas en el
        # username, así que "Admin" y "admin" serían dos cuentas distintas.
        # En un sitio donde el nombre aparece firmando reseñas, eso es una
        # puerta abierta a hacerse pasar por otra persona.
        if User.objects.filter(username__iexact=nombre).exists():
            raise serializers.ValidationError("Ese nombre de usuario ya está tomado.")

        return nombre

    def validate(self, attrs):
        """Las reglas de contraseña de Django, aplicadas acá.

        Se valida en el nivel del objeto y no en validate_password() porque
        UserAttributeSimilarityValidator necesita al usuario para comparar:
        sin él no puede detectar que "alejandro2026" se parece demasiado al
        nombre de quien la está eligiendo.
        """
        # Se le pasa también el nombre: el validador de similitud compara
        # contra username, first_name, last_name y email, así que sin el
        # nombre no podría detectar que "Martina2026" se parece demasiado a
        # quien la está eligiendo.
        tentativo = User(
            username=attrs.get("username", ""),
            email=attrs.get("email", ""),
            first_name=attrs.get("first_name", ""),
        )

        try:
            validate_password(attrs["password"], user=tentativo)
        except ErrorDeDjango as error:
            # Django lanza su propia excepción; DRF espera la suya. Sin esta
            # traducción el error saldría como un 500 en vez de un 400 con
            # el motivo.
            raise serializers.ValidationError({"password": list(error.messages)})

        return attrs

    def create(self, validated_data):
        # create_user() y no User(...): es el que aplica el hash a la
        # contraseña. Guardarla con User.objects.create() la dejaría en la
        # base tal cual se escribió.
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
            first_name=validated_data.get("first_name", "").strip(),
        )

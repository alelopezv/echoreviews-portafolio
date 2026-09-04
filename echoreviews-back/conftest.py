"""Fixtures compartidas por todos los tests.

Una *fixture* de pytest es un dato de partida que se prepara antes del test.
Se pide poniendo su nombre como parámetro de la función de prueba: pytest lo
reconoce y lo inyecta. Evita repetir el mismo montaje en cada test.
"""
import io

import pytest
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from rest_framework.test import APIClient

from media.models import Media
from reviews.models import Review


@pytest.fixture
def api():
    """Cliente HTTP de DRF, sin sesión iniciada."""
    return APIClient()


@pytest.fixture
def portada():
    """Una imagen real, no un archivo falso.

    ImageField valida que el archivo sea una imagen de verdad: si mandáramos
    un texto con nombre .jpg, la validación lo rechazaría y el test fallaría
    por el motivo equivocado.
    """
    buffer = io.BytesIO()
    Image.new("RGB", (60, 90), "teal").save(buffer, format="JPEG")
    return SimpleUploadedFile("portada.jpg", buffer.getvalue(), content_type="image/jpeg")


@pytest.fixture
def usuario(db):
    """Un usuario normal. El parámetro `db` le da acceso a la base de datos."""
    return User.objects.create_user("ana", password="clave-de-prueba")


@pytest.fixture
def admin(db):
    return User.objects.create_user("moderador", password="clave-de-prueba", is_staff=True)


@pytest.fixture
def obra(db, portada):
    """Una obra ya aprobada, del catálogo."""
    return Media.objects.create(
        title="Cowboy Bebop",
        type="anime",
        description="Cazarrecompensas en el espacio.",
        image=portada,
        status="approved",
    )


@pytest.fixture
def resena_aprobada(db, usuario, obra):
    return Review.objects.create(
        user=usuario,
        media=obra,
        title="Una obra maestra",
        content="El jazz y el vacío.",
        rating=5,
        status="approved",
    )

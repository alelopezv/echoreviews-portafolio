"""Moderar desde el admin tiene que dejar la base igual que moderar por la API.

Son dos caminos hacia la misma decisión, y mientras solo uno registraba quién
aprobó y cuándo, el historial dependía de por dónde hubiera entrado el
moderador.
"""
import pytest
from django.contrib.admin.sites import AdminSite

from reviews.admin import ReviewAdmin, ReviewAdminForm
from reviews.models import Review


class PeticionFalsa:
    """Lo único que save_model necesita de la petición es quién la hace."""

    def __init__(self, user):
        self.user = user


@pytest.fixture
def admin_de_resenas():
    return ReviewAdmin(Review, AdminSite())


@pytest.mark.django_db
def test_aprobar_desde_el_admin_registra_quien_y_cuando(admin_de_resenas, usuario, admin, obra):
    resena = Review.objects.create(
        user=usuario, media=obra, title="Pendiente",
        content="...", rating=4, status="pending",
    )

    resena.status = "approved"
    admin_de_resenas.save_model(PeticionFalsa(admin), resena, form=None, change=True)

    resena.refresh_from_db()
    assert resena.approved_by == admin      # el moderador de la sesión
    assert resena.approved_at is not None


@pytest.mark.django_db
def test_volver_a_guardar_no_reasigna_la_aprobacion(admin_de_resenas, usuario, admin, obra):
    """Quien aprobó fue quien aprobó, no el último que abrió el formulario."""
    from django.contrib.auth.models import User
    otro = User.objects.create_user("otro-moderador", password="x", is_staff=True)

    resena = Review.objects.create(
        user=usuario, media=obra, title="R", content="...", rating=4, status="pending",
    )

    resena.status = "approved"
    admin_de_resenas.save_model(PeticionFalsa(admin), resena, form=None, change=True)
    aprobada_en = resena.approved_at

    # Otro moderador abre la misma reseña y guarda sin cambiar el estado.
    admin_de_resenas.save_model(PeticionFalsa(otro), resena, form=None, change=True)

    resena.refresh_from_db()
    assert resena.approved_by == admin
    assert resena.approved_at == aprobada_en


@pytest.mark.django_db
def test_quitar_la_aprobacion_borra_el_registro(admin_de_resenas, usuario, admin, resena_aprobada):
    """Una reseña que vuelve a la cola no puede seguir diciendo que está aprobada."""
    resena_aprobada.approved_by = admin
    resena_aprobada.save()

    resena_aprobada.status = "pending"
    admin_de_resenas.save_model(PeticionFalsa(admin), resena_aprobada, form=None, change=True)

    resena_aprobada.refresh_from_db()
    assert resena_aprobada.approved_by is None
    assert resena_aprobada.approved_at is None


@pytest.mark.django_db
def test_el_admin_no_puede_firmar_la_aprobacion_a_nombre_de_otro(admin_de_resenas):
    """approved_by es un registro, no un campo del formulario.

    Mientras fue editable, el admin mostraba un desplegable con todos los
    usuarios del sitio —incluidos los que no son staff— y se podía atribuir la
    aprobación a cualquiera de ellos.
    """
    de_solo_lectura = admin_de_resenas.readonly_fields
    assert "approved_by" in de_solo_lectura
    assert "approved_at" in de_solo_lectura


@pytest.mark.django_db
def test_devolver_una_resena_a_la_cola_borra_el_motivo(admin_de_resenas, usuario, obra, admin):
    """Un motivo colgando de una reseña que ya no está rechazada miente.

    El texto se limpiaba solo al aprobar, así que una reseña rechazada y
    devuelta a "pendiente" se quedaba con la explicación del rechazo anterior:
    el estado decía una cosa y el campo de al lado, otra.
    """
    resena = Review.objects.create(
        user=usuario, media=obra, title="R", content="...", rating=3,
        status="rejected", rejection_reason="Falta desarrollar la idea.",
    )

    resena.status = "pending"
    admin_de_resenas.save_model(PeticionFalsa(admin), resena, form=None, change=True)

    resena.refresh_from_db()
    assert resena.rejection_reason == ""


@pytest.mark.django_db
def test_rechazar_conserva_el_motivo(admin_de_resenas, usuario, obra, admin):
    """El caso contrario, que es el que se rompe si se limpia de más.

    Sin este test, vaciar el motivo SIEMPRE pasaría la prueba de arriba y
    dejaría todos los rechazos sin explicación.
    """
    resena = Review.objects.create(
        user=usuario, media=obra, title="R", content="...", rating=3,
    )

    resena.status = "rejected"
    resena.rejection_reason = "Desarrolla la comparación con el resto del disco."
    admin_de_resenas.save_model(PeticionFalsa(admin), resena, form=None, change=True)

    resena.refresh_from_db()
    assert resena.rejection_reason == "Desarrolla la comparación con el resto del disco."


@pytest.mark.django_db
def test_rechazar_sin_motivo_no_pasa_la_validacion(usuario, obra):
    """La misma regla que exige la API, también acá."""
    resena = Review.objects.create(
        user=usuario, media=obra, title="R", content="...", rating=3,
    )

    formulario = ReviewAdminForm(
        instance=resena,
        data={"status": "rejected", "rejection_reason": "   ", "rating": 3},
    )

    assert not formulario.is_valid()
    assert "rejection_reason" in formulario.errors

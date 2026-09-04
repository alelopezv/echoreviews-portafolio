"""Las reglas de negocio de las reseñas, cada una con su test.

No se busca cubrir cada línea: se busca que cada decisión importante del
proyecto quede escrita como una prueba que falla si alguien la rompe.
"""
import pytest
from rest_framework.test import APIClient

from media.models import Media, MediaSuggestion
from media.views import aprobar_sugerencia
from reviews.models import Review


# --------------------------------------------------------------------------
# 1. Quién puede publicar
# --------------------------------------------------------------------------

@pytest.mark.django_db
def test_publicar_sin_sesion_devuelve_401(api, obra):
    """Sin token no se crea nada.

    Esta es la línea que sostiene todo el sistema: esconder el botón en React
    no impide nada, porque cualquiera puede llamar la API con Postman.
    """
    respuesta = api.post("/api/reviews/create/", {
        "title": "Colada", "content": "...", "rating": 5, "media": obra.id,
    })

    assert respuesta.status_code == 401
    assert Review.objects.count() == 0


@pytest.mark.django_db
def test_publicar_con_sesion_devuelve_201(api, usuario, obra):
    api.force_authenticate(user=usuario)

    respuesta = api.post("/api/reviews/create/", {
        "title": "Mi reseña", "content": "Me gustó.", "rating": 4, "media": obra.id,
    })

    assert respuesta.status_code == 201
    assert Review.objects.count() == 1


# --------------------------------------------------------------------------
# 2. Nadie se auto-aprueba
# --------------------------------------------------------------------------

@pytest.mark.django_db
def test_el_estado_lo_decide_el_backend_no_el_cliente(api, usuario, obra):
    """Aunque el cliente mande status="approved", la reseña nace pendiente.

    La vista pisa ese valor a propósito. Sin esto, cualquiera se publicaría
    solo saltándose la moderación entera.
    """
    api.force_authenticate(user=usuario)

    api.post("/api/reviews/create/", {
        "title": "Cuela", "content": "...", "rating": 5, "media": obra.id,
        "status": "approved",          # ← el intento
        "user": 999,                   # ← y de paso, hacerse pasar por otro
    })

    resena = Review.objects.get()
    assert resena.status == "pending"
    assert resena.user == usuario      # el autor sale del token, no del formulario


@pytest.mark.django_db
def test_el_listado_publico_solo_muestra_aprobadas(api, usuario, obra, resena_aprobada):
    Review.objects.create(
        user=usuario, media=obra, title="Pendiente",
        content="...", rating=3, status="pending",
    )

    respuesta = api.get("/api/reviews/")

    assert respuesta.status_code == 200
    titulos = [r["title"] for r in respuesta.json()]
    assert titulos == ["Una obra maestra"]


# --------------------------------------------------------------------------
# 3. El contrato de salida es estable
# --------------------------------------------------------------------------

@pytest.mark.django_db
def test_todas_las_resenas_traen_las_mismas_claves(api, usuario, obra, portada, resena_aprobada):
    """Una reseña con obra aprobada y otra con propuesta pendiente deben
    devolver la MISMA forma.

    Este es el bug que motivó media parte del proyecto: los campos declarados
    con source="media.title" desaparecían del JSON cuando media era None, así
    que el frontend recibía objetos de formas distintas según el caso.
    """
    propuesta = MediaSuggestion.objects.create(
        title="Serial Experiments Lain", type="anime",
        description="Cables y soledad.", image=portada, created_by=usuario,
    )
    Review.objects.create(
        user=usuario, media=None, media_suggestion=propuesta,
        title="Con propuesta", content="...", rating=5, status="approved",
    )

    datos = api.get("/api/reviews/").json()
    assert len(datos) == 2

    claves_primera, claves_segunda = set(datos[0]), set(datos[1])
    assert claves_primera == claves_segunda

    # Y ninguna se queda sin obra: la que espera aprobación saca los datos
    # de su propuesta y se marca como pendiente.
    por_titulo = {r["title"]: r for r in datos}
    assert por_titulo["Una obra maestra"]["media"]["pending"] is False
    assert por_titulo["Con propuesta"]["media"]["pending"] is True
    assert por_titulo["Con propuesta"]["media"]["title"] == "Serial Experiments Lain"


# --------------------------------------------------------------------------
# 4. Toda reseña habla de una obra completa
# --------------------------------------------------------------------------

@pytest.mark.django_db
def test_una_obra_nueva_incompleta_se_rechaza(api, usuario):
    """Sin imagen ni descripción no se puede proponer una obra.

    El 400 debe decir QUÉ falta, no solo que algo falló.
    """
    api.force_authenticate(user=usuario)

    respuesta = api.post("/api/reviews/create/", {
        "title": "Reseña", "content": "...", "rating": 4,
        "media_title": "Perfect Blue", "media_type": "anime",
        # faltan media_description e image
    })

    assert respuesta.status_code == 400
    assert set(respuesta.json()) == {"media_description", "image"}
    assert Review.objects.count() == 0


# --------------------------------------------------------------------------
# 5. Aprobar una propuesta reengancha TODAS sus reseñas
# --------------------------------------------------------------------------

@pytest.mark.django_db
def test_aprobar_una_propuesta_reengancha_las_resenas_hermanas(usuario, admin, portada):
    """Ana y Bruno proponen la misma obra; el admin elige una.

    Las dos reseñas deben quedar apuntando a la misma obra del catálogo. Antes
    solo se reenganchaban las de la propuesta elegida y las demás quedaban
    huérfanas para siempre.
    """
    from django.contrib.auth.models import User
    bruno = User.objects.create_user("bruno", password="x")

    de_ana = MediaSuggestion.objects.create(
        title="Paprika", type="anime", description="La de Ana.",
        image=portada, created_by=usuario,
    )
    de_bruno = MediaSuggestion.objects.create(
        title="Paprika", type="anime", description="La de Bruno.",
        image=portada, created_by=bruno,
    )
    r_ana = Review.objects.create(user=usuario, media=None, media_suggestion=de_ana,
                                  title="Ana", content="...", rating=5)
    r_bruno = Review.objects.create(user=bruno, media=None, media_suggestion=de_bruno,
                                    title="Bruno", content="...", rating=4)

    obra_creada, error = aprobar_sugerencia(de_ana)

    assert error is None
    assert Media.objects.filter(title="Paprika").count() == 1
    assert obra_creada.description == "La de Ana."   # la del autor elegido

    for resena in (r_ana, r_bruno):
        resena.refresh_from_db()
        assert resena.media == obra_creada
        assert resena.media_suggestion is None


# --------------------------------------------------------------------------
# 6. Moderar no es reescribir
# --------------------------------------------------------------------------

@pytest.mark.django_db
def test_un_admin_no_puede_editar_la_resena_de_otro(api, admin, resena_aprobada):
    """El admin modera por estado, no cambiando el texto ajeno.

    Antes ReviewDetailView dejaba al staff editar cualquier reseña sin dejar
    rastro: cambiar la opinión de alguien y dejarla firmada con su nombre.
    """
    api.force_authenticate(user=admin)
    texto_original = resena_aprobada.content

    respuesta = api.patch(f"/api/reviews/{resena_aprobada.id}/",
                          {"content": "Texto puesto por el admin"}, format="json")

    assert respuesta.status_code == 403
    resena_aprobada.refresh_from_db()
    assert resena_aprobada.content == texto_original


@pytest.mark.django_db
def test_el_ciclo_de_rechazo_devuelve_la_resena_a_su_autor(api, usuario, admin, resena_aprobada):
    """Rechazar exige motivo; corregir devuelve la reseña a la cola."""
    # Sin motivo no se puede rechazar.
    api.force_authenticate(user=admin)
    sin_motivo = api.patch(f"/api/reviews/{resena_aprobada.id}/reject/", {}, format="json")
    assert sin_motivo.status_code == 400

    # Con motivo, sí.
    api.patch(f"/api/reviews/{resena_aprobada.id}/reject/",
              {"reason": "Desarrolla más la opinión."}, format="json")
    resena_aprobada.refresh_from_db()
    assert resena_aprobada.status == "rejected"
    assert resena_aprobada.rejection_reason == "Desarrolla más la opinión."

    # Desaparece del listado público…
    assert api.get("/api/reviews/").json() == []

    # …pero su autor la ve, con el motivo.
    api.force_authenticate(user=usuario)
    mias = api.get("/api/reviews/mine/").json()
    assert mias[0]["rejection_reason"] == "Desarrolla más la opinión."

    # Y al corregirla vuelve a la cola de moderación.
    api.patch(f"/api/reviews/{resena_aprobada.id}/",
              {"content": "Opinión ampliada."}, format="json")
    resena_aprobada.refresh_from_db()
    assert resena_aprobada.status == "pending"
    assert resena_aprobada.rejection_reason == ""

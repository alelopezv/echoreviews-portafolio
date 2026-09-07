"""Las reglas de los hashtags, cada una con su test.

Un hashtag no es solo una palabra guardada: es la etiqueta por la que alguien
va a llegar a una reseña. Si se aprueba mal, la reseña queda inalcanzable
aunque el hashtag exista.
"""
import pytest

from hashtags.models import Hashtag, HashtagSuggestion
from hashtags.views import aprobar_sugerencia_hashtag
from reviews.models import Review


# --------------------------------------------------------------------------
# 1. Aprobar una sugerencia hace el trabajo completo
# --------------------------------------------------------------------------

@pytest.mark.django_db
def test_aprobar_una_sugerencia_publica_el_hashtag_y_etiqueta_sus_resenas(usuario, resena_aprobada):
    """Aprobar es crear el hashtag Y colgarlo de las reseñas que lo pidieron.

    Media aprobación —marcar la sugerencia y no etiquetar nada— deja la reseña
    sin la etiqueta por la que su autor quería que la encontraran.
    """
    sugerencia = HashtagSuggestion.objects.create(name="Space Jazz", created_by=usuario)
    sugerencia.reviews.add(resena_aprobada)

    hashtag, error = aprobar_sugerencia_hashtag(sugerencia)

    assert error is None
    assert hashtag.name == "space jazz"        # normalizado en minúsculas
    assert hashtag.status == "approved"

    sugerencia.refresh_from_db()
    assert sugerencia.status == "approved"
    assert sugerencia.approved_hashtag == hashtag

    # Y lo que de verdad importa: la reseña quedó etiquetada.
    assert list(resena_aprobada.hashtags.all()) == [hashtag]


@pytest.mark.django_db
def test_reaprobar_repara_una_sugerencia_marcada_a_mano(usuario, resena_aprobada):
    """El destrozo del desplegable del admin tiene arreglo.

    Cuando `list_editable` dejaba escribir "approved" directo en la lista, la
    sugerencia quedaba marcada sin crear el hashtag ni etiquetar nada. Si
    aprobar se negara con un "ya está aprobada", ese estado sería irreparable
    para siempre. Por eso la función es idempotente.
    """
    sugerencia = HashtagSuggestion.objects.create(
        name="synthwave", created_by=usuario, status="approved",   # ← el daño
    )
    sugerencia.reviews.add(resena_aprobada)

    assert Hashtag.objects.count() == 0          # nunca se creó
    assert resena_aprobada.hashtags.count() == 0  # nunca se etiquetó

    hashtag, error = aprobar_sugerencia_hashtag(sugerencia)

    assert error is None
    assert list(resena_aprobada.hashtags.all()) == [hashtag]


@pytest.mark.django_db
def test_una_sugerencia_rechazada_no_se_aprueba(usuario):
    sugerencia = HashtagSuggestion.objects.create(
        name="spam", created_by=usuario, status="rejected",
    )

    hashtag, error = aprobar_sugerencia_hashtag(sugerencia)

    assert hashtag is None
    assert error is not None
    assert Hashtag.objects.count() == 0


@pytest.mark.django_db
def test_dos_sugerencias_del_mismo_hashtag_no_lo_duplican(usuario, admin, obra):
    """Ana y el moderador piden la misma etiqueta con distinta grafía.

    El modelo normaliza a minúsculas al guardar, así que "Anime" y "anime"
    son el mismo hashtag y las dos reseñas terminan colgando de la misma fila.
    """
    de_ana = Review.objects.create(user=usuario, media=obra, title="A",
                                   content="...", rating=5, status="approved")
    del_otro = Review.objects.create(user=admin, media=obra, title="B",
                                     content="...", rating=4, status="approved")

    primera = HashtagSuggestion.objects.create(name="Anime", created_by=usuario)
    primera.reviews.add(de_ana)
    segunda = HashtagSuggestion.objects.create(name="anime", created_by=admin)
    segunda.reviews.add(del_otro)

    h1, _ = aprobar_sugerencia_hashtag(primera)
    h2, _ = aprobar_sugerencia_hashtag(segunda)

    assert h1 == h2
    assert Hashtag.objects.filter(name="anime").count() == 1
    assert list(de_ana.hashtags.all()) == list(del_otro.hashtags.all()) == [h1]


# --------------------------------------------------------------------------
# 2. La lista pública muestra lo que tiene que mostrar
# --------------------------------------------------------------------------

@pytest.mark.django_db
def test_el_listado_publico_solo_muestra_los_aprobados(api):
    Hashtag.objects.create(name="publicado", status="approved")
    Hashtag.objects.create(name="a-la-espera", status="pending")

    respuesta = api.get("/api/hashtags/")

    assert respuesta.status_code == 200
    assert [h["name"] for h in respuesta.json()] == ["publicado"]


@pytest.mark.django_db
def test_un_hashtag_creado_por_un_admin_aparece_en_la_lista(api, admin):
    """Crearlo siendo admin ES aprobarlo.

    El modelo nace en "pending" y la lista pública filtra por "approved", así
    que sin pedir el estado explícitamente el hashtag se guardaba y no
    aparecía en ninguna parte: ni un error ni un resultado, solo silencio.
    """
    api.force_authenticate(user=admin)

    creacion = api.post("/api/hashtags/create/", {"name": "Post Rock"}, format="json")
    assert creacion.status_code == 201

    api.force_authenticate(user=None)
    publicos = [h["name"] for h in api.get("/api/hashtags/").json()]
    assert publicos == ["post rock"]

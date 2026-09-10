"""El seed tiene que bastarse solo.

Alguien clona el repositorio, levanta los contenedores, corre `loaddata` y
tiene que ver la aplicación completa. Si el seed nombra una portada que no
está versionada, esa persona ve una imagen rota y no tiene forma de saber
por qué: el archivo existe, pero solo en la máquina de quien lo subió.

Ya pasó dos veces —al renombrar las portadas y al agregar Chihayafuru—, y
las dos se descubrió mirando el sitio. Estos tests lo descubren en la CI.
"""
import json
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parent
SEED = RAIZ / "seed.json"
ASSETS = RAIZ / "seed_assets"

CON_PORTADA = ("media.media", "media.mediasuggestion")


@pytest.fixture(scope="module")
def seed():
    with SEED.open(encoding="utf-8") as fh:
        return json.load(fh)


def test_todas_las_portadas_del_seed_estan_versionadas(seed):
    """Cada imagen que nombra el seed existe dentro de seed_assets/.

    No vale que esté en mediafiles/: esa carpeta está en .gitignore porque
    ahí van también las subidas de los usuarios. Lo que viaja en el
    repositorio es seed_assets/, y el contenedor la copia al arrancar.
    """
    faltan = [
        f"{o['model']} «{o['fields']['title']}» → {o['fields']['image']}"
        for o in seed
        if o["model"] in CON_PORTADA
        and not (ASSETS / o["fields"]["image"]).exists()
    ]

    assert not faltan, (
        "El seed nombra portadas que no están en seed_assets/:\n  "
        + "\n  ".join(faltan)
    )


def test_toda_resena_del_seed_habla_de_una_obra(seed):
    """Sin excepción: o una obra del catálogo, o una propuesta pendiente.

    Es la regla que sostiene el proyecto entero. Una reseña sin obra no
    tiene de qué hablar, y el frontend no tendría qué mostrar en la tarjeta.
    """
    huerfanas = [
        f"pk {o['pk']} «{o['fields']['title']}»"
        for o in seed
        if o["model"] == "reviews.review"
        and not o["fields"].get("media")
        and not o["fields"].get("media_suggestion")
    ]

    assert not huerfanas, f"Reseñas del seed sin obra: {huerfanas}"


def test_el_motivo_de_rechazo_solo_vive_en_las_rechazadas(seed):
    """La misma regla que el admin y la API, comprobada sobre los datos.

    Un motivo colgando de una reseña aprobada o pendiente es basura
    heredada: el estado dice una cosa y el campo de al lado, otra.
    """
    for o in seed:
        if o["model"] != "reviews.review":
            continue
        estado = o["fields"]["status"]
        motivo = (o["fields"].get("rejection_reason") or "").strip()

        if estado == "rejected":
            assert motivo, f"reseña {o['pk']} rechazada sin motivo"
        else:
            assert not motivo, f"reseña {o['pk']} está «{estado}» con motivo de rechazo"


def test_el_seed_muestra_los_tres_estados_de_moderacion(seed):
    """Un seed con todo aprobado esconde la funcionalidad más distintiva.

    Quien clone el repositorio y abra el admin tiene que ver la cola: algo
    esperando revisión y algo devuelto con su explicación, no ocho filas
    idénticas que dicen «aprobado».
    """
    estados = {o["fields"]["status"] for o in seed if o["model"] == "reviews.review"}

    assert estados == {"approved", "pending", "rejected"}, (
        f"El seed solo cubre estos estados: {sorted(estados)}"
    )

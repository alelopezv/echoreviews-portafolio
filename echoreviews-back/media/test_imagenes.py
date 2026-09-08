"""El recorte de portadas.

Lo que se guarda es el archivo ya recortado, así que un fallo acá no se nota
al publicar: se nota después, en cada sitio donde esa portada aparezca, y ya
no hay original al que volver.
"""
import io

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image

from media.imagenes import LADO_MAXIMO, recortar_portada
from media.models import MediaSuggestion
from reviews.models import Review


def imagen_de(ancho, alto, formato="JPEG"):
    """Un archivo subido de verdad, del tamaño que se pida."""
    buffer = io.BytesIO()
    Image.new("RGB", (ancho, alto), "teal").save(buffer, format=formato)
    extension = "png" if formato == "PNG" else "jpg"
    return SimpleUploadedFile(
        f"portada.{extension}", buffer.getvalue(), content_type=f"image/{extension}"
    )


def medidas(archivo):
    archivo.seek(0)
    with Image.open(archivo) as imagen:
        return imagen.size


# --------------------------------------------------------------------------
# 1. El recorte hace lo que dice
# --------------------------------------------------------------------------

def test_recorta_el_rectangulo_pedido():
    recortada = recortar_portada(imagen_de(800, 600), x=100, y=50, ancho=400, alto=300)
    assert medidas(recortada) == (400, 300)


def test_sin_recorte_devuelve_la_imagen_intacta():
    """Cero significa "no se recortó", no "recorte de tamaño cero".

    Es el caso de quien sube una portada y publica sin abrir el editor. Antes
    los valores por defecto eran 100 y 150, que parecen un recorte legítimo:
    esas portadas se habrían cortado a una esquina.
    """
    original = imagen_de(800, 600)
    resultado = recortar_portada(original, x=0, y=0, ancho=0, alto=0)

    assert resultado is original
    assert medidas(resultado) == (800, 600)


@pytest.mark.parametrize("recorte", [
    (0, 0, -50, 100),          # ancho negativo
    (0, 0, 100, 0),            # alto cero
    ("hola", 0, 100, 100),     # basura donde va un número
    (0, 0, None, 100),         # falta un valor
])
def test_un_recorte_invalido_no_rompe_ni_recorta(recorte):
    original = imagen_de(400, 400)
    assert recortar_portada(original, *recorte) is original


def test_un_recorte_fuera_de_la_imagen_se_ajusta_al_borde():
    """Pillow no protesta si el rectángulo se sale: rellena con negro.

    Sin ajustar los bordes, un cliente con otro tamaño de referencia produciría
    portadas con franjas negras y nadie se enteraría.
    """
    recortada = recortar_portada(imagen_de(200, 200), x=150, y=150, ancho=500, alto=500)

    ancho, alto = medidas(recortada)
    assert (ancho, alto) == (50, 50)


def test_una_imagen_enorme_se_reduce():
    recortada = recortar_portada(
        imagen_de(4000, 3000), x=0, y=0, ancho=4000, alto=3000
    )

    ancho, alto = medidas(recortada)
    assert max(ancho, alto) == LADO_MAXIMO
    assert ancho / alto == pytest.approx(4000 / 3000, rel=0.01)


def test_un_png_con_transparencia_no_revienta():
    """El formato se conserva, así que el canal alfa sobrevive."""
    buffer = io.BytesIO()
    Image.new("RGBA", (300, 300), (0, 128, 128, 128)).save(buffer, format="PNG")
    archivo = SimpleUploadedFile("t.png", buffer.getvalue(), content_type="image/png")

    recortada = recortar_portada(archivo, x=0, y=0, ancho=100, alto=100)
    assert medidas(recortada) == (100, 100)


# --------------------------------------------------------------------------
# 2. Y llega hasta la base de datos
# --------------------------------------------------------------------------

@pytest.mark.django_db
def test_publicar_una_obra_nueva_guarda_la_portada_ya_recortada(api, usuario):
    """La prueba que importa: el archivo en disco está recortado.

    Recorrer la vista entera y no solo la función es lo que comprueba que los
    cuatro números llegan desde el formulario hasta Pillow. Un envío multipart
    los manda como texto, y un `int()` olvidado en el camino dejaría el recorte
    sin aplicar sin que nada fallara.
    """
    api.force_authenticate(user=usuario)

    respuesta = api.post("/api/reviews/create/", {
        "title": "Reseña", "content": "...", "rating": 5,
        "media_title": "Perfect Blue", "media_type": "anime",
        "media_description": "Una obra sobre la identidad.",
        "image": imagen_de(800, 600),
        "crop_x": 100, "crop_y": 50, "crop_width": 300, "crop_height": 450,
    }, format="multipart")

    assert respuesta.status_code == 201

    propuesta = MediaSuggestion.objects.get()
    with Image.open(propuesta.image) as guardada:
        assert guardada.size == (300, 450)

    # Y los números quedan guardados como registro de lo que se cortó.
    assert (propuesta.crop_x, propuesta.crop_y) == (100, 50)
    assert (propuesta.crop_width, propuesta.crop_height) == (300, 450)

    assert Review.objects.count() == 1

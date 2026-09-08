"""Tratamiento de las portadas al subirlas.

El recorte lo elige el usuario en el navegador con react-easy-crop, que
devuelve un rectángulo en píxeles del archivo original. Acá se aplica ese
rectángulo al archivo, una sola vez, antes de guardarlo.

La alternativa era guardar la imagen entera y recortarla al mostrarla, con
CSS. Se descartó: esa regla habría tenido que repetirse en cada componente
que muestre una portada —la tarjeta, el catálogo, la ficha— y este proyecto
ya nos enseñó lo que pasa con las reglas repetidas. Recortando el archivo, la
imagen sale bien en todas partes sin que nadie tenga que acordarse de nada.

El precio es que el original no se conserva: cambiar el encuadre exige volver
a subir la portada.
"""
import io
import os

from django.core.files.uploadedfile import InMemoryUploadedFile
from PIL import Image

# Ninguna vista del sitio muestra una portada a más de ~420 píxeles. Guardar
# un archivo de 4000 no mejora nada y se lo descarga entero cada visitante.
LADO_MAXIMO = 1600

CALIDAD_JPEG = 88


def recortar_portada(archivo, x, y, ancho, alto):
    """Devuelve el archivo recortado al rectángulo (x, y, ancho, alto).

    Si el rectángulo no sirve —falta, mide cero o el archivo no es una imagen
    legible— devuelve el archivo original sin tocar. Recortar mal es peor que
    no recortar: deja la obra con una portada inservible y sin ninguna señal
    de que algo salió mal.
    """
    if not archivo:
        return archivo

    try:
        x, y, ancho, alto = int(x), int(y), int(ancho), int(alto)
    except (TypeError, ValueError):
        return archivo

    if ancho <= 0 or alto <= 0:
        return archivo

    archivo.seek(0)
    try:
        imagen = Image.open(archivo)
        imagen.load()
    except Exception:
        # Que el archivo no sea una imagen no es asunto de esta función: el
        # ImageField del modelo lo va a rechazar con su propio mensaje.
        archivo.seek(0)
        return archivo

    formato = (imagen.format or "JPEG").upper()

    # El rectángulo se ajusta a los bordes. Un cliente puede mandar uno que se
    # salga de la imagen, y Pillow no protesta: rellena lo que falta con negro.
    izquierda = max(0, min(x, imagen.width - 1))
    arriba = max(0, min(y, imagen.height - 1))
    derecha = max(izquierda + 1, min(x + ancho, imagen.width))
    abajo = max(arriba + 1, min(y + alto, imagen.height))

    recortada = imagen.crop((izquierda, arriba, derecha, abajo))
    recortada.thumbnail((LADO_MAXIMO, LADO_MAXIMO), Image.Resampling.LANCZOS)

    if formato in ("JPEG", "JPG") and recortada.mode not in ("RGB", "L"):
        # JPEG no guarda transparencia. Sin esta conversión, un PNG con canal
        # alfa reventaría al escribirse como JPEG.
        recortada = recortada.convert("RGB")

    opciones = (
        {"quality": CALIDAD_JPEG, "optimize": True}
        if formato in ("JPEG", "JPG")
        else {}
    )

    buffer = io.BytesIO()
    recortada.save(buffer, format=formato, **opciones)
    buffer.seek(0)

    return InMemoryUploadedFile(
        buffer,
        field_name="image",
        name=os.path.basename(getattr(archivo, "name", "portada.jpg")),
        content_type=Image.MIME.get(formato, "image/jpeg"),
        size=buffer.getbuffer().nbytes,
        charset=None,
    )

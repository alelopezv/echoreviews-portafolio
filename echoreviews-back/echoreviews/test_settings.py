"""Ajustes para correr los tests.

Hereda todo de settings.py y solo cambia lo que no debe depender del entorno:
la base de datos y el almacenamiento de archivos. Así los tests corren igual en
tu máquina, en el contenedor y en GitHub Actions, sin MySQL levantado.
"""
import tempfile

from .settings import *  # noqa: F401,F403

# SQLite en memoria: no necesita servidor, se crea y destruye con cada corrida
# y es varias veces más rápido que MySQL. La diferencia entre motores no afecta
# a lo que estos tests comprueban, que es lógica de permisos y de serialización.
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

# Las pruebas suben imágenes. Sin esto irían a mediafiles/ y ensuciarían el
# proyecto con archivos basura en cada corrida.
MEDIA_ROOT = tempfile.mkdtemp()

# El hasher por defecto es lento a propósito, para que una contraseña robada
# cueste de romper. En los tests esa lentitud no aporta nada y se nota.
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]

ALLOWED_HOSTS = ["*", "testserver"]

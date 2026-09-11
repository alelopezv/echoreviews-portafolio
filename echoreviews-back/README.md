# ⚙️ EchoReviews · Backend

API REST de EchoReviews, construida con Django y Django REST Framework.

> Para levantar el proyecto completo (backend + frontend), mira el
> [README principal](../README.md). Este documento cubre solo la API.

---

## 🚀 Stack

Django 5.2 · Django REST Framework · MySQL 8.4 · Docker Compose · SimpleJWT · Pillow

---

## ▶️ Levantar la API

```bash
docker compose up --build
```

Queda disponible en http://localhost:8000.

El `entrypoint.sh` espera a que MySQL acepte conexiones y aplica las migraciones
antes de arrancar el servidor, así que **no hace falta ejecutar `migrate` a mano**
después de un `makemigrations`.

Las variables de entorno son opcionales en local. Para personalizarlas:

```bash
cp .env.example .env
```

---

## 🌱 Datos de prueba

### Cargar

```bash
docker exec -it echoreviews-api-container python manage.py loaddata seed.json
```

Incluye 2 usuarios, 3 obras con portada, 3 reseñas y 7 hashtags.
Usuario administrador: `admin` / `12345678`.

### Regenerar

⚠️ **No uses la redirección `>` de la shell para esto.** En PowerShell y en algunas
consolas de Windows, `> seed.json` escribe el archivo en UTF-16 y con la página de
códigos del terminal, lo que corrompe las tildes y las eñes. El resultado es un
fixture que `loaddata` no puede leer:

```
UnicodeDecodeError: 'utf-8' codec can't decode byte 0xff in position 0
```

Usa el parámetro `--output`, que hace que Django escriba el archivo directamente
en UTF-8:

```bash
docker exec -it echoreviews-api-container python manage.py dumpdata \
  auth.user reviews media hashtags \
  --indent 2 --output seed.json
```

Nombrar las apps explícitamente evita arrastrar `contenttypes`, `auth.permission`,
`sessions` y `admin.logentry`, que Django recrea solo y solo generan conflictos
al cargar el fixture en una base limpia.

---

## 🔐 Autenticación

JWT vía SimpleJWT. El token va en la cabecera `Authorization: Bearer <token>`.

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/token/` | Obtener el par `access` / `refresh` |
| `POST` | `/api/token/refresh/` | Renovar el `access` |
| `GET` | `/api/users/me/` | Perfil del usuario autenticado |

La clase `SoftJWTAuthentication` (en `echoreviews/authentication.py`) extiende la
autenticación estándar para que un token inválido o expirado no rompa los endpoints
públicos: en vez de devolver 401, trata la petición como anónima.

---

## 📡 Endpoints

### Reseñas

| Método | Endpoint | Acceso |
|---|---|---|
| `GET` | `/api/reviews/` | Público — solo aprobadas |
| `POST` | `/api/reviews/create/` | Autenticado |
| `GET` | `/api/reviews/mine/` | Autenticado |
| `GET` `PATCH` `DELETE` | `/api/reviews/<id>/` | Autor o admin |
| `PATCH` | `/api/reviews/<id>/approve/` | Admin |

### Obras (media)

| Método | Endpoint | Acceso |
|---|---|---|
| `GET` | `/api/media/` | Público — solo aprobadas |
| `GET` `PATCH` `DELETE` | `/api/media/<id>/` | Lectura pública, escritura admin |
| `POST` | `/api/media/suggestions/create/` | Autenticado |
| `PATCH` | `/api/media/suggestions/<id>/approve/` | Admin |

### Hashtags

| Método | Endpoint | Acceso |
|---|---|---|
| `GET` | `/api/hashtags/` | Público |

---

## 🗄 Modelos

- **`Review`** — reseña con puntuación de 1 a 5 y estado de moderación. Puede
  apuntar a una `Media` del catálogo o, mientras espera aprobación, a una
  `MediaSuggestion`.
- **`Media`** — obra del catálogo, con portada y valores de recorte.
- **`MediaSuggestion`** — obra propuesta por un usuario. Al aprobarla se crea la
  `Media` definitiva y las reseñas asociadas se reenlazan a ella.
- **`Hashtag`** — etiqueta, normalizada a minúsculas en `save()` para evitar
  duplicados como `Anime` y ` anime `.
- **`HashtagSuggestion`** — etiqueta propuesta, pendiente de aprobación.

---

## 🧪 Comandos útiles

```bash
# Abrir una shell de Django dentro del contenedor
docker exec -it echoreviews-api-container python manage.py shell

# Crear un superusuario
docker exec -it echoreviews-api-container python manage.py createsuperuser

# Ver el estado de las migraciones
docker exec -it echoreviews-api-container python manage.py showmigrations

# Ver los logs de la API
docker logs -f echoreviews-api-container
```

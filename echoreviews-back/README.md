# ⚙️ EchoReviews Backend

API REST para la plataforma EchoReviews.

## 🚀 Tecnologías

* Django
* Django REST Framework
* MySQL
* Docker
* JWT (SimpleJWT)

## 📦 Instalación

```bash
git clone <repo-url>
cd echoreviews-back
docker-compose up --build
```

## ▶️ Ejecución

http://localhost:8000

## 🌱 Seeds (datos de prueba)

Este proyecto incluye un dump de datos para facilitar la evaluación.

### 📄 Generar seeds

```bash
docker exec -it echoreviews-api-container python manage.py dumpdata > seed.json

### 📥 Cargar seeds

```bash
docker exec -it echoreviews-api-container python manage.py loaddata seed.json


### 📌 Contenido del seed

- Usuarios (incluye usuario admin de prueba)
- Reviews
- Media (anime, música, videojuegos)
- Hashtags
- Relaciones entre modelos

## 🌐 Endpoints principales

### 🔐 Autenticación

* `POST /api/token/`
* `POST /api/token/refresh/`

### 👤 Usuario

* `GET /api/users/me/`

### 📝 Reviews

* `GET /api/reviews/` → públicas
* `POST /api/reviews/` → crear (auth)
* `GET /api/reviews/my-reviews/` → propias

### 🏷 Hashtags

* CRUD básico

### 🎬 Media

* Gestión de contenido (anime, música, juegos)

## 🧠 Lógica importante

* Sistema de moderación (`pending`, `approved`)
* Sugerencias de media y hashtags
* Relación usuario → reseñas

## 🔐 Autenticación

Se usa JWT:

```json
Authorization: Bearer <token>
```

## 🗄 Base de datos

* MySQL (Docker)
* Relaciones:

  * User → Reviews
  * Review → Media
  * Review → Hashtags

## 📁 Estructura

```
echoreviews-back/
│
├── .env
├── db.sqlite3
├── docker-compose.yml
├── Dockerfile
├── manage.py
├── requirements.txt
├── README.md
│
├── echoreviews/              # Configuración principal del proyecto Django
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
│
├── users/                   # Gestión de usuarios (auth + perfil)
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── urls.py
│   ├── views.py
│   ├── tests.py
│   └── migrations/
│
├── reviews/                 # Reseñas de usuarios
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── serializers.py
│   ├── urls.py
│   ├── views.py
│   ├── tests.py
│   └── migrations/
│
├── media/                   # Contenido (anime, música, juegos)
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── serializers.py
│   ├── urls.py
│   ├── views.py
│   ├── tests.py
│   ├── media/               # Archivos subidos (imágenes)
│   └── migrations/
│
├── hashtags/                # Sistema de etiquetas
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── serializers.py
│   ├── urls.py
│   ├── views.py
│   ├── tests.py
│   └── migrations/
```

## ⚠️ Notas

* Proyecto orientado a portafolio
* No incluye aún sistema completo de permisos avanzados

## 👨‍💻 Autor

Alejandro López
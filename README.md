# ⚙️ EchoReviews

EchoReviews es una plataforma de crítica cultural donde los usuarios escriben y exploran
reseñas de anime, música y videojuegos, con un flujo de moderación para el contenido
que proponen.

El proyecto está dividido en dos partes:

- 🔧 **Backend** — API REST con Django y Django REST Framework, sobre MySQL y Docker
- 🎨 **Frontend** — React + Vite + TypeScript

---

## 🚀 Tecnologías

**Backend** · Django 5.2 · Django REST Framework · MySQL 8.4 · Docker Compose · JWT (SimpleJWT)

**Frontend** · React 18 · Vite 6 · TypeScript · TailwindCSS · Axios · React Router

---

## 📦 Puesta en marcha

Necesitas **Docker** y **Node.js 18+**.

### 1. Clonar el repositorio

```bash
git clone https://github.com/alelopezv/echoreviews-portafolio.git
cd echoreviews-portafolio
```

### 2. Levantar el backend

```bash
cd echoreviews-back
docker compose up --build
```

Al arrancar, el contenedor espera a que MySQL esté listo y **aplica las migraciones
automáticamente**, así que no hay que correr `migrate` a mano.

> Las variables de entorno son opcionales para desarrollo local: los valores por
> defecto del `docker-compose.yml` ya funcionan. Si quieres personalizarlas,
> copia el archivo de ejemplo con `cp .env.example .env`.

### 3. Cargar los datos de prueba

Con los contenedores corriendo, en otra terminal:

```bash
docker exec -it echoreviews-api-container python manage.py loaddata seed.json
```

### 4. Levantar el frontend

```bash
cd ../echoreviews-front
npm install
npm run dev
```

### 5. Acceder

| Servicio | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API | http://localhost:8000/api/ |
| Admin de Django | http://localhost:8000/admin/ |

---

## 🌱 Datos de prueba

El archivo `seed.json` incluye un catálogo mínimo para que la aplicación se vea
poblada apenas la levantas: 2 usuarios, 3 obras con sus portadas, 3 reseñas y
7 hashtags con sus relaciones.

**Usuario administrador:** `admin` / `12345678`

Las imágenes de las obras se versionan en `seed_assets/media/` y el contenedor las
copia a `mediafiles/` al arrancar. La carpeta `mediafiles/` guarda además lo que
suben los usuarios y por eso está en `.gitignore`.

---

## 🔐 Autenticación

La API usa **JSON Web Tokens**. Se envían en la cabecera `Authorization: Bearer <token>`.

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/token/` | Iniciar sesión y obtener el par de tokens |
| `POST` | `/api/token/refresh/` | Renovar el token de acceso |
| `GET` | `/api/users/me/` | Perfil del usuario autenticado |

---

## 📡 Endpoints principales

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/reviews/` | Público | Reseñas aprobadas |
| `POST` | `/api/reviews/create/` | Autenticado | Crear una reseña |
| `GET` | `/api/reviews/mine/` | Autenticado | Mis reseñas |
| `GET` `PATCH` `DELETE` | `/api/reviews/<id>/` | Autenticado | Detalle, edición y borrado |
| `PATCH` | `/api/reviews/<id>/approve/` | Admin | Aprobar una reseña |
| `GET` | `/api/media/` | Público | Catálogo de obras aprobadas |
| `POST` | `/api/media/suggestions/create/` | Autenticado | Proponer una obra nueva |
| `PATCH` | `/api/media/suggestions/<id>/approve/` | Admin | Aprobar una propuesta |
| `GET` | `/api/hashtags/` | Público | Hashtags |

---

## 📝 Funcionalidades

### Backend
- **Reseñas** — CRUD completo con permisos por usuario y por rol.
- **Moderación** — las reseñas y las obras propuestas pasan por estados
  `pending` / `approved` / `rejected` antes de publicarse.
- **Propuestas de contenido** — si un usuario reseña una obra que no está en el
  catálogo, se crea una `MediaSuggestion`. Al aprobarla, se genera la `Media`
  definitiva y las reseñas que quedaron colgando se reenlazan automáticamente.
- **Hashtags** — normalizados en minúsculas para evitar duplicados.

### Frontend
- Sesión persistente con JWT y renovación automática del token al expirar.
- Formulario de reseñas con selección de obra existente o propuesta de una nueva,
  incluyendo carga y recorte de la portada.
- Feed de reseñas, catálogo de obras, navegación por hashtags y vista de perfil.

---

## 🗄 Modelo de datos

| Entidad | Rol |
|---|---|
| `User` | Usuarios y roles (usa el modelo de Django) |
| `Review` | Reseña: contenido, puntuación y estado de moderación |
| `Media` | Obra del catálogo (anime, música o videojuego) |
| `MediaSuggestion` | Obra propuesta por un usuario, pendiente de aprobación |
| `Hashtag` | Etiqueta de búsqueda |
| `HashtagSuggestion` | Etiqueta propuesta, pendiente de aprobación |

---

## 📁 Organización

```text
echoreviews-portafolio/
├── echoreviews-back/          # API REST con Django
│   ├── echoreviews/           # settings, urls y autenticación JWT
│   ├── reviews/               # reseñas y moderación
│   ├── media/                 # catálogo de obras y propuestas
│   ├── hashtags/              # etiquetas
│   ├── users/                 # perfil del usuario
│   ├── seed_assets/           # imágenes de los datos de prueba
│   ├── docker-compose.yml
│   └── entrypoint.sh          # espera a MySQL y aplica migraciones
│
└── echoreviews-front/         # Interfaz en React + Vite
    └── src/
        ├── app/components/    # páginas y componentes
        └── services/          # cliente HTTP con interceptores JWT
```

---

## ⚠️ Estado del proyecto

Proyecto de portafolio, en desarrollo activo. Trabajo pendiente conocido:

- No hay tests automatizados ni integración continua todavía.
- Falta configuración de TypeScript (`tsconfig.json`), así que los tipos no se
  verifican en build.
- Los valores de recorte de portada se guardan en la base de datos pero el
  frontend aún no los aplica al mostrar las imágenes.
- No existe endpoint de registro de usuarios: las cuentas se crean desde el admin.

---

## 👨‍💻 Autor

**Alejandro López** — [GitHub](https://github.com/alelopezv)

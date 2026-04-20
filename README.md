# ⚙️ EchoReviews

EchoReviews es una plataforma de crítica cultural donde los usuarios pueden escribir y explorar reseñas de anime, música y videojuegos.

El proyecto está dividido en:

- 🔧 Backend (Django REST API)
- 🎨 Frontend (React + Vite)

---

## 🚀 Tecnologías

### Backend
- Django
- Django REST Framework
- MySQL (Docker)
- JWT (SimpleJWT)

### Frontend
- React
- Vite
- TypeScript
- TailwindCSS
- Axios
- React Router DOM

---

## 📦 Instalación

### 1. Clonar repositorio

```bash
git clone <repo-url>
cd echoreviews

## 🚀 Ejecución del proyecto

### 2. Levantar backend (Docker)

```bash
cd echoreviews-back
docker-compose up --build

### 3. Levantar frontend

```bash
cd echoreviews-front
npm install
npm run dev

## 🚀 Acceso al Proyecto
* **Frontend:** [http://localhost:5173](http://localhost:5173)
* **Backend API:** [http://localhost:8000](http://localhost:8000)

---

## 🌱 Datos de Prueba (Seeds)
El proyecto incluye un volcado de datos iniciales para facilitar la navegación y evaluación inmediata de las funcionalidades.

### 📥 Cargar seeds
Ejecuta el siguiente comando para poblar la base de datos:
```bash
docker exec -it echoreviews-api-container python manage.py loaddata seed.json

### 📌 El dump incluye:
* **Usuario Administrador:**
    * **Username:** `admin`
    * **Password:** `12345678`
* **Usuarios convencionales** con actividad previa.
* **Reviews** detalladas.
* **Media:** Catálogo precargado de anime, música y videojuegos.
* **Hashtags y Relaciones:** Conexiones completas entre modelos.

---

## 🔐 Autenticación
La seguridad se gestiona mediante **JSON Web Tokens (JWT)**.

* **Header:** `Authorization: Bearer <token>`
* **Endpoints principales:**
    * `POST /api/token/` → Iniciar sesión y obtener par de tokens.
    * `POST /api/token/refresh/` → Refrescar el token de acceso.
    * `GET /api/users/me/` → Obtener información del perfil actual.

---

## 📝 Funcionalidades Principales

### Backend (Django REST Framework)
* **Gestión de Reseñas:** CRUD completo para la creación y edición de contenido.
* **Sistema de Moderación:** Flujo de estados para publicaciones (`pending` / `approved`).
* **Inteligencia de Datos:** Sugerencias automáticas de media y hashtags.
* **Arquitectura de Relaciones:** Vínculos sólidos entre `User` → `Reviews` → `Media`.

### Frontend (React)
* **Gestión de Sesión:** Login persistente y manejo de estados con JWT.
* **Formularios Dinámicos:** Interfaz intuitiva para la creación de nuevas reseñas.
* **Exploración:** Feed de noticias, búsqueda por hashtags y vista de perfil.
* **Vistas de Detalle:** Páginas específicas para profundizar en cada review.

---

## 🗄 Base de Datos y Estructura
El proyecto utiliza **MySQL** orquestado mediante **Docker**.

### Entidades Principales:
* `User` (Perfiles y roles)
* `Review` (Contenido central)
* `Media` (Categorización de productos)
* `Hashtag` (Etiquetas de búsqueda)
* `MediaSuggestion` (Propuestas de contenido)

---

## 📁 Organización del Repositorio
```text
echoreviews/
│
├── echoreviews-back/      # Django REST API (Servidor de datos)
├── echoreviews-front/     # React frontend (Interfaz de usuario)

---

## ⚠️ Notas
* Este es un proyecto orientado a portafolio; algunas funcionalidades complejas han sido simplificadas para facilitar la demostración.
* Se recomienda utilizar los datos de prueba (seed) para una mejor experiencia de visualización.

---

## 👨‍💻 Autor
**Alejandro López** - *Desarrollador del proyecto*
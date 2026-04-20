# 🎨 EchoReviews Frontend

Frontend de EchoReviews, una plataforma de crítica cultural enfocada en anime, música, videojuegos y cine.

## 🚀 Tecnologías

* React
* Vite
* TypeScript
* TailwindCSS
* Axios
* React Router DOM

## 📦 Instalación

```bash
git clone <repo-url>
cd echoreviews-front
npm install
```

## ▶️ Ejecutar proyecto

```bash
npm run dev
```

La app estará disponible en:

```
http://localhost:5173
```

## 🔐 Autenticación

El frontend utiliza JWT para autenticación:

* Login mediante `/api/token/`
* Tokens guardados en `localStorage`
* Interceptor de Axios para enviar automáticamente el token

## 📁 Estructura

```
echoreviews-front/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── figma/
│   │   │   ├── RootLayout.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── LoginModal.tsx
│   │   │   ├── ReviewDetailPage.tsx
│   │   │   ├── ReviewForm.tsx
│   │   │   ├── HashtagPage.tsx
│   │   │   ├── AllHashtagsPage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   │
│   │   ├── data/
│   │   │   └── mockData.ts
│   │   │
│   │   ├── App.tsx
│   │   └── routes.tsx
│   │
│   ├── services/
│   │   ├── api.ts
│   │   └── reviews.ts
│   │
│   ├── styles/
│   │   ├── index.css
│   │   ├── tailwind.css
│   │   ├── theme.css
│   │   └── fonts.css
│   │
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── index.html
├── package.json
├── vite.config.ts
└── README.md
```

## 🌐 Endpoints utilizados

* `POST /api/token/` → login
* `GET /api/users/me/` → perfil
* `GET /api/reviews/my-reviews/` → reseñas del usuario
* `GET /api/reviews/` → reseñas públicas

## ✨ Features

* Login con modal
* Perfil dinámico
* Consumo de API real
* Logout
* Navegación con React Router

## ⚠️ Notas

Este proyecto está pensado como parte de un portafolio. Algunas funcionalidades están simplificadas.

## 👨‍💻 Autor

Alejandro López

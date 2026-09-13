# Construcción en dos etapas.
#
# La primera etapa necesita Node, npm y las 86 dependencias para compilar. La
# segunda no necesita nada de eso: `vite build` deja tres archivos estáticos
# —un HTML, un JS y un CSS— y los archivos no se ejecutan, se sirven.
#
# Por eso la imagen final parte de nginx y no de node: copia el resultado de
# la primera etapa y descarta todo lo demás. La diferencia es de unos 400 MB
# a unos 50.

# ── Etapa 1: compilar ───────────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Primero el manifiesto y el lockfile, y recién después el código. Docker
# cachea cada instrucción por separado: así `npm ci` solo se vuelve a ejecutar
# cuando cambian las dependencias, no cada vez que se toca un componente.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite reemplaza import.meta.env.VITE_API_URL por su valor AL COMPILAR, no al
# arrancar: por eso es un ARG de construcción y no una variable del contenedor.
# Definirla en el docker-compose como `environment` no serviría de nada.
#
# El valor por defecto es una ruta relativa a propósito: nginx hace de
# intermediario hacia el backend, así que el navegador solo habla con el
# puerto 80 y nunca necesita saber dónde vive Django. De paso desaparece el
# problema de CORS, porque para el navegador todo viene del mismo origen.
ARG VITE_API_URL=/api/
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Etapa 2: servir ─────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY proxy_params_echoreviews /etc/nginx/proxy_params_echoreviews
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

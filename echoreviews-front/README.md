# 🎨 EchoReviews · Frontend

Interfaz de [EchoReviews](../README.md) en React + Vite + TypeScript.

**La documentación del proyecto está en el [README de la raíz](../README.md)**:
qué hace, cómo levantarlo entero, capturas y decisiones de diseño. Este archivo
solo cubre lo específico de esta carpeta.

Se mantiene corto a propósito. El README anterior describía carpetas que ya no
existían, un archivo de datos falsos borrado hace meses y un endpoint con un
nombre que nunca fue (`/api/reviews/my-reviews/` en vez de `/mine/`). Dos
documentos que cuentan lo mismo se desincronizan siempre: gana el que nadie
actualiza.

## Correr solo el frontend

Necesita el backend levantado (ver el README de la raíz).

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run typecheck` | `tsc --noEmit`: comprueba los tipos sin generar nada |
| `npm run build` | Compila a `dist/` para producción |

## Configuración

Una sola variable, y solo hace falta al desplegar:

```bash
cp .env.example .env
```

`VITE_API_URL` dice dónde vive la API. Sin `.env`, apunta a
`http://127.0.0.1:8000/api/`, que es donde la deja `docker compose`.

**Vite la reemplaza en el código al compilar**, no la lee al arrancar: hay que
definirla *antes* de `npm run build`, no después de subir el sitio.

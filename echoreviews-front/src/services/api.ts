import axios from "axios";

/** Dónde vive la API.
 *
 * Estaba escrita a mano —y dos veces, porque el reintento de abajo llamaba a
 * axios directo saltándose esta instancia—. Con la dirección fija dentro del
 * código, el sitio solo puede hablar con un backend que corra en la máquina de
 * quien lo abre: desplegado en cualquier lado, `127.0.0.1` es el computador del
 * visitante, no el servidor.
 *
 * Vite reemplaza `import.meta.env.VITE_API_URL` por su valor AL COMPILAR, así
 * que hay que definirla antes de `npm run build`, no después. El valor por
 * defecto deja el desarrollo local funcionando sin configurar nada.
 */
export const URL_DE_LA_API =
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api/";

const api = axios.create({
  baseURL: URL_DE_LA_API,
});

// 🔒 Adjuntar access token a cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔄 Si una request falla con 401, intentar refresh y reintentar
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Solo intentar refresh si es 401 y no es la request de refresh misma
    // y no hemos reintentado ya (evitar bucle infinito)
    // `?? ""` porque una petición cancelada o mal formada puede llegar sin
    // url, y ahí `.includes` reventaría dentro del manejador de errores:
    // un fallo tapando otro, que es el peor lugar donde puede pasar.
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !(originalRequest.url ?? "").includes("token/refresh")
    ) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem("refresh");

      if (refresh) {
        try {
          // axios "pelado" y no `api`, a propósito: si el refresco fallara con
          // 401 pasaría otra vez por este interceptor y se llamaría a sí mismo.
          const res = await axios.post(`${URL_DE_LA_API}token/refresh/`, { refresh });

          const newAccess = res.data.access;
          localStorage.setItem("access", newAccess);

          // Reintentar la request original con el nuevo token
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch {
          // Refresh también falló — sesión expirada, limpiar y redirigir
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.href = "/";
        }
      } else {
        // No hay refresh token, limpiar
        localStorage.removeItem("access");
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
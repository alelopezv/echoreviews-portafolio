import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
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
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("token/refresh")
    ) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem("refresh");

      if (refresh) {
        try {
          const res = await axios.post(
            "http://127.0.0.1:8000/api/token/refresh/",
            { refresh }
          );

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
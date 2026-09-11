import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
}

type Modo = "entrar" | "registrarse";

/**
 * Traduce el fallo de una petición a un texto que se le pueda mostrar a
 * alguien.
 *
 * El backend contesta de dos formas distintas: con {"detail": "..."} cuando
 * es un error general, y con {"campo": ["motivo", ...]} cuando falló la
 * validación de un formulario. El registro usa la segunda —una contraseña
 * puede fallar por varias razones a la vez— así que quedarse solo con
 * `detail` dejaría al usuario sin saber qué corregir.
 */
function mensajeDeError(err: unknown, porDefecto: string): string {
  if (!axios.isAxiosError(err) || !err.response) return porDefecto;

  const datos = err.response.data;
  if (typeof datos?.detail === "string") return datos.detail;

  if (datos && typeof datos === "object") {
    const motivos = Object.values(datos)
      .flat()
      .filter((valor): valor is string => typeof valor === "string");
    if (motivos.length > 0) return motivos.join("\n");
  }

  return porDefecto;
}

export function LoginModal({ onClose, onSuccess }: Props) {
  const [modo, setModo] = useState<Modo>("entrar");
  const [username, setUsername] = useState("");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const registrando = modo === "registrarse";

  const cambiarModo = () => {
    setModo(registrando ? "entrar" : "registrarse");
    setError("");
  };

  const entrar = (access: string, refresh: string) => {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);

    // Primero notificar éxito (actualiza estado en RootLayout)
    onSuccess?.();
    // Luego cerrar modal
    onClose();
    // Luego navegar
    navigate("/profile");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (registrando) {
        const res = await api.post("users/register/", {
          username,
          first_name: nombre,
          email,
          password,
        });
        // El alta devuelve el par de tokens, así que quien se registra entra
        // directo en vez de tener que escribir lo mismo otra vez.
        entrar(res.data.access, res.data.refresh);
      } else {
        const res = await api.post("token/", { username, password });
        entrar(res.data.access, res.data.refresh);
      }
    } catch (err) {
      const credencialIncorrecta =
        !registrando && axios.isAxiosError(err) && err.response?.status === 401;

      setError(
        credencialIncorrecta
          ? "Usuario o contraseña incorrectos"
          : mensajeDeError(
              err,
              registrando
                ? "No se pudo crear la cuenta"
                : "Error al conectar con el servidor"
            )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 p-6 rounded-xl w-full max-w-md border border-slate-700">
        <h2 className="text-white text-xl mb-1">
          {registrando ? "Crear una cuenta" : "Iniciar sesión"}
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          {registrando
            ? "Para escribir reseñas y proponer obras al catálogo."
            : "Con tu cuenta de EchoReviews."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 rounded bg-slate-800 text-white"
            autoFocus
          />

          {registrando && (
            <>
              <input
                type="text"
                placeholder="Nombre con el que firmas (opcional)"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full p-3 rounded bg-slate-800 text-white"
              />
              <input
                type="email"
                placeholder="Correo (opcional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded bg-slate-800 text-white"
              />
            </>
          )}

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded bg-slate-800 text-white"
          />

          {registrando && (
            <p className="text-xs text-slate-500 px-1">
              Al menos 8 caracteres, que no sean solo números ni se parezcan a
              tu nombre de usuario.
            </p>
          )}

          {error && (
            // whitespace-pre-line respeta los saltos de línea: la validación
            // puede devolver varios motivos y se leen mejor uno por renglón.
            <p className="text-red-400 text-sm px-1 whitespace-pre-line">{error}</p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed p-3 rounded text-white font-semibold transition-colors"
            >
              {loading
                ? registrando
                  ? "Creando..."
                  : "Ingresando..."
                : registrando
                  ? "Crear cuenta"
                  : "Entrar"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 p-3 rounded text-white transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>

        <button
          type="button"
          onClick={cambiarModo}
          className="w-full mt-4 text-sm text-slate-400 hover:text-purple-400 transition-colors"
        >
          {registrando
            ? "¿Ya tienes cuenta? Inicia sesión"
            : "¿No tienes cuenta? Créala aquí"}
        </button>
      </div>
    </div>
  );
}

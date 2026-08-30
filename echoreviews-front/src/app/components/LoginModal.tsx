import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
}

export function LoginModal({ onClose, onSuccess }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("token/", { username, password });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      // Primero notificar éxito (actualiza estado en RootLayout)
      onSuccess?.();
      // Luego cerrar modal
      onClose();
      // Luego navegar
      navigate("/profile");
    } catch (err: any) {
      const msg =
        err.response?.status === 401
          ? "Usuario o contraseña incorrectos"
          : "Error al conectar con el servidor";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 p-6 rounded-xl w-full max-w-md border border-slate-700">
        <h2 className="text-white text-xl mb-4">Iniciar sesión</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 rounded bg-slate-800 text-white"
            autoFocus
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded bg-slate-800 text-white"
          />

          {error && (
            <p className="text-red-400 text-sm px-1">{error}</p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed p-3 rounded text-white font-semibold transition-colors"
            >
              {loading ? "Ingresando..." : "Entrar"}
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
      </div>
    </div>
  );
}

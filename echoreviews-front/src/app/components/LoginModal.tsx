import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

interface Props {
  onClose: () => void;
}

export function LoginModal({ onClose }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await api.post("token/", {
        username,
        password,
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      alert("Login exitoso");
      onClose();
      navigate("/profile");
    } catch (err) {
      console.error(err);
      alert("Credenciales incorrectas");
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
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded bg-slate-800 text-white"
          />

          <div className="flex gap-2">
            <button className="flex-1 bg-purple-600 p-3 rounded text-white">
              Entrar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 p-3 rounded text-white"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
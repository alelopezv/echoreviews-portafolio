import { useEffect, useState } from "react";
import api from "../services/api";
import type { User } from "../types";

/**
 * El usuario de la sesión actual, o null si no hay ninguna.
 *
 * Hace falta preguntárselo al servidor: el token guardado en localStorage
 * dice que hay una sesión abierta, pero no de quién. Y aunque el token
 * contiene el id del usuario, leerlo desde el cliente sería confiar en un
 * dato que el propio cliente podría haber modificado.
 *
 * `recargarCuando` es el valor que dispara una nueva consulta al cambiar.
 * RootLayout le pasa su estado de sesión, para volver a preguntar cuando
 * alguien entra o sale; el resto no le pasa nada y consulta una sola vez.
 */
export function useUsuarioActual(recargarCuando: unknown = null) {
  const [usuario, setUsuario] = useState<User | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("access")) {
      setUsuario(null);
      return;
    }

    api.get("users/me/")
      .then((res) => setUsuario(res.data))
      // Un token vencido o inválido no debería romper nada: se sigue sin
      // usuario y quien llame decide qué esconder.
      .catch(() => setUsuario(null));
  }, [recargarCuando]);

  return usuario;
}

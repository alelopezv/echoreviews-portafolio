import { Navigate, useLocation } from "react-router-dom";

/**
 * Envuelve una ruta que solo tiene sentido con sesión iniciada.
 *
 * Esconder el enlace del menú no basta: cualquiera puede escribir /write en la
 * barra de direcciones. Esto es comodidad para el usuario, no seguridad — la
 * seguridad de verdad está en el backend, donde CreateReviewView exige
 * IsAuthenticated. Aquí solo evitamos que alguien llegue a un formulario que
 * no va a poder enviar.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const haySesion = !!localStorage.getItem("access");

  if (!haySesion) {
    // replace evita que quede en el historial: si el visitante aprieta
    // "atrás" no vuelve a rebotar contra la misma redirección.
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

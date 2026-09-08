import type { ReactNode } from "react";

interface Props {
  cargando: boolean;
  error: boolean;
  vacio: boolean;
  /** Qué decir cuando la petición salió bien pero no hay nada que mostrar. */
  mensajeVacio: string;
  children: ReactNode;
}

/**
 * Los tres estados en los que una lista puede no tener nada que mostrar.
 *
 * Antes las páginas hacían `.catch(err => console.error(err))` y nada más: si
 * el backend no respondía, la lista se quedaba vacía y la página se dibujaba
 * como si simplemente no hubiera contenido. Para quien mira, "el servidor
 * está caído" y "todavía nadie escribió nada" se veían exactamente igual, y
 * el único rastro del fallo quedaba en la consola del navegador, donde no
 * mira nadie que no sea programador.
 *
 * Son tres situaciones distintas y merecen tres respuestas distintas:
 * esperar, reintentar, o participar.
 */
export function EstadoDeLista({
  cargando,
  error,
  vacio,
  mensajeVacio,
  children,
}: Props) {
  if (cargando) {
    return <p className="text-slate-400 text-center py-16">Cargando…</p>;
  }

  if (error) {
    return (
      <div className="text-center py-16 px-4">
        <p className="text-slate-300 mb-2">No se pudo conectar con el servidor.</p>
        <p className="text-sm text-slate-500 mb-6">
          Comprueba que el backend esté levantado en{" "}
          <code className="text-slate-400">localhost:8000</code>.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:border-purple-500/50 text-slate-300 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (vacio) {
    return <p className="text-slate-400 text-center py-16">{mensajeVacio}</p>;
  }

  return <>{children}</>;
}

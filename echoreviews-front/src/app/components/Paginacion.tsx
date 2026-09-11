import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  /** Página actual, empezando en 1 (es como las numera DRF). */
  pagina: number;
  /** Total de elementos —el `count` de la respuesta—, no los de esta página. */
  total: number;
  porPagina: number;
  alCambiar: (pagina: number) => void;
}

/** Los controles de página, para las tres listas que los necesitan.
 *
 * Existe como componente y no copiado en cada página por el motivo de siempre
 * en este proyecto: una regla repetida termina desincronizándose. Ya pasó con
 * los colores por categoría, con la interfaz Media, con la proporción de las
 * portadas y con el aire lateral de los contenedores.
 */
export function Paginacion({ pagina, total, porPagina, alCambiar }: Props) {
  const paginas = Math.ceil(total / porPagina);

  // Con una sola página no se dibuja nada. Unos botones deshabilitados que
  // nunca van a poder usarse solo ocupan espacio y prometen algo que no hay.
  if (paginas <= 1) return null;

  const boton =
    "flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-700 text-slate-300 " +
    "hover:border-purple-500 hover:text-white transition-colors " +
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-700 " +
    "disabled:hover:text-slate-300";

  return (
    <nav
      className="flex items-center justify-center gap-3 mt-10"
      aria-label="Paginación"
    >
      <button
        type="button"
        onClick={() => alCambiar(pagina - 1)}
        disabled={pagina <= 1}
        className={boton}
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Anterior</span>
      </button>

      {/* aria-live para que un lector de pantalla anuncie el cambio: al pasar
          de página el contenido se reemplaza sin que nada más lo avise. */}
      <span className="text-sm text-slate-400 tabular-nums" aria-live="polite">
        Página {pagina} de {paginas}
      </span>

      <button
        type="button"
        onClick={() => alCambiar(pagina + 1)}
        disabled={pagina >= paginas}
        className={boton}
      >
        <span className="hidden sm:inline">Siguiente</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}

/** El tamaño de página que usa el backend (`PaginacionDeResenas.page_size`).
 *
 * Vive acá porque los controles necesitan saberlo para calcular cuántas
 * páginas hay: DRF manda `count` y `next`, pero no el tamaño de página. */
export const POR_PAGINA = 5;

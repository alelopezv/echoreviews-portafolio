import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import type { CatalogMedia } from "../../types";
import { claseDeAspecto, TIPOS_DE_OBRA } from "../../lib/media";
import { EstadoDeLista } from "./EstadoDeLista";

export function MediaPage() {
  const [mediaList, setMediaList] = useState<CatalogMedia[]>([]);

  // El filtro vive en la URL y no en un useState, así /media?tipo=music es un
  // enlace que se puede compartir, marcar como favorito y al que el botón
  // "atrás" del navegador vuelve. Con el estado en memoria, filtrar no dejaba
  // rastro: al recargar volvías a "Todos" y no había forma de enlazar a una
  // categoría desde el pie de página.
  const [params, setParams] = useSearchParams();
  const filtro = params.get("tipo") ?? "todos";

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get("media/")
      .then((res) => {
        setMediaList(res.data.results || res.data);
      })
      .catch((err) => {
        console.error(err);
        setError(true);
      })
      .finally(() => setCargando(false));
  }, []);

  const filteredMedia =
    filtro === "todos"
      ? mediaList
      : mediaList.filter((m) => m.type === filtro);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">

      <h1 className="text-4xl font-bold text-white mb-8">
        Biblioteca de Medios
      </h1>

      {/* FILTROS */}
      <div className="flex flex-wrap gap-3 mb-8">
        {[{ valor: "todos", etiqueta: "Todos" }, ...TIPOS_DE_OBRA].map(
          ({ valor, etiqueta }) => {
            const activo = filtro === valor;
            return (
              <button
                key={valor}
                onClick={() =>
                  // "todos" no se escribe en la URL: la ausencia del parámetro
                  // ya significa "sin filtrar", y /media queda limpio.
                  setParams(valor === "todos" ? {} : { tipo: valor })
                }
                className={`px-4 py-2 rounded-lg transition-colors border ${
                  activo
                    ? "bg-purple-600 text-white border-purple-400"
                    : "bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500"
                }`}
              >
                {etiqueta}
              </button>
            );
          }
        )}
      </div>

      {/* GRID DE POSTERS */}
      <EstadoDeLista
        cargando={cargando}
        error={error}
        vacio={filteredMedia.length === 0}
        mensajeVacio={
          filtro === "todos"
            ? "El catálogo está vacío."
            : "No hay obras de esta categoría todavía."
        }
      >
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">

        {filteredMedia.map((media) => {

          return (
            <Link
              key={media.id}
              to={`/media/${media.id}`}
              className="group"
            >
            <div className="rounded-xl overflow-hidden bg-slate-800 border border-slate-700 hover:border-purple-500 transition-all">

              <div className={`overflow-hidden ${claseDeAspecto(media.type)}`}>

                <img
                  src={media.image || "/no-poster.png"}
                  alt={media.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

              </div>

              <div className="p-3">

                <h2 className="text-white font-semibold line-clamp-2">
                  {media.title}
                </h2>

                <p className="text-slate-400 text-sm capitalize">
                  {media.type}
                </p>

              </div>

            </div>
          </Link>
          );
        })}

      </div>
      </EstadoDeLista>

    </div>
  );
}
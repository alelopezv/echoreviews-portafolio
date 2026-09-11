import type { Pagina, Review } from "../../types";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { ReviewListItem } from "./ReviewListItem";
import { EstadoDeLista } from "./EstadoDeLista";
import { Paginacion, POR_PAGINA } from "./Paginacion";
import { AIRE_LATERAL } from "../../lib/estilos";

export function AllReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  // El término y la página viven en la URL, igual que el filtro del catálogo:
  // así una búsqueda es un enlace que se puede compartir, guardar en favoritos
  // y al que el botón "atrás" vuelve. Con el estado en memoria, recargar la
  // página borraba lo buscado.
  const [params, setParams] = useSearchParams();
  const termino = params.get("q") ?? "";
  const pagina = Number(params.get("page")) || 1;

  useEffect(() => {
    // Se reinician al empezar CADA búsqueda, no solo la primera: sin esto, la
    // segunda búsqueda mostraría los resultados de la anterior mientras llega
    // la nueva, como si ya hubiera contestado.
    setCargando(true);
    setError(false);

    // El término se manda por `params` y no pegado a la cadena: axios lo
    // codifica por nosotros, así que un "rock & roll" viaja entero.
    api.get<Pagina<Review>>("reviews/", {
      params: { page: pagina, ...(termino ? { q: termino } : {}) },
    })
      .then(res => {
        setReviews(res.data.results);
        setTotal(res.data.count);
      })
      .catch(err => {
        console.error(err);
        setError(true);
      })
      .finally(() => setCargando(false));
  }, [termino, pagina]);

  /** Buscar algo nuevo devuelve a la página 1: los resultados son otros y
   *  seguir en la 3 mostraría una página vacía de una búsqueda distinta. */
  const irA = (n: number) =>
    setParams(termino ? { q: termino, page: String(n) } : { page: String(n) });

  return (
    <div className={`max-w-5xl mx-auto ${AIRE_LATERAL} py-12`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          {termino ? "Resultados de la búsqueda" : "Todas las reseñas"}
        </h1>

        {termino && (
          <p className="mt-2 text-slate-400">
            {cargando ? "Buscando" : `${total} ${total === 1 ? "reseña" : "reseñas"}`}
            {" "}para <span className="text-purple-300">«{termino}»</span>
            {" · "}
            <Link to="/all-reviews" className="text-slate-500 hover:text-purple-400 transition-colors">
              ver todas
            </Link>
          </p>
        )}
      </div>

      <EstadoDeLista
        cargando={cargando}
        error={error}
        vacio={reviews.length === 0}
        mensajeVacio={
          termino
            ? `Ninguna reseña menciona «${termino}». Se busca en el título, en el texto, en el nombre de la obra y en las etiquetas.`
            : "Todavía no hay reseñas publicadas."
        }
      >
        {/* Usa la misma tarjeta que la portada y la página de un hashtag.
            Antes esta página tenía su propia tarjeta reducida —solo título y
            obra, sin portada ni autor ni puntuación—, así que "todas las
            reseñas" mostraba menos de cada una que la portada. */}
        <div className="space-y-8">
          {reviews.map((review) => (
            <ReviewListItem key={review.id} review={review} />
          ))}
        </div>
      </EstadoDeLista>

      <Paginacion
        pagina={pagina}
        total={total}
        porPagina={POR_PAGINA}
        alCambiar={irA}
      />
    </div>
  );
}

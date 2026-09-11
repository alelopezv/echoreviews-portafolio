import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Hash, ArrowLeft } from "lucide-react";
import api from "../../services/api";
import { ReviewListItem } from "./ReviewListItem";
import { Paginacion, POR_PAGINA } from "./Paginacion";
import type { Pagina, Review } from "../../types";
import { AIRE_LATERAL } from "../../lib/estilos";

export function HashtagPage() {
  const { tag } = useParams();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  // La página vive en la URL, como el término del buscador y el filtro del
  // catálogo: /hashtag/sci-fi?page=2 es un enlace que se puede compartir y al
  // que el botón "atrás" vuelve.
  const [params, setParams] = useSearchParams();
  const pagina = Number(params.get("page")) || 1;

  useEffect(() => {
    if (!tag) return;

    setCargando(true);
    setError(false);

    // El filtro lo hace el servidor. Antes esta página pedía TODAS las reseñas
    // y se quedaba con las que llevaran la etiqueta; con la paginación eso
    // dejó de funcionar, porque solo habrían llegado cinco y una reseña de la
    // sexta en adelante sencillamente no habría existido para el filtro.
    api.get<Pagina<Review>>("reviews/", { params: { hashtag: tag, page: pagina } })
      .then((res) => {
        setReviews(res.data.results);
        setTotal(res.data.count);
      })
      .catch((err) => {
        console.error(err);
        setError(true);
      })
      .finally(() => setCargando(false));
  }, [tag, pagina]);

  return (
    <div className={`max-w-7xl mx-auto ${AIRE_LATERAL} py-12`}>
      <Link
        to="/hashtags"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-purple-400 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Ver todos los hashtags</span>
      </Link>

      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Hash className="w-6 h-6 text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold text-white">#{tag}</h1>
        </div>

        {!cargando && !error && (
          /* `total` y no `reviews.length`: el primero es cuántas hay, el
             segundo cuántas caben en esta página. */
          <p className="text-slate-400">
            {total} {total === 1 ? "reseña encontrada" : "reseñas encontradas"}
          </p>
        )}
      </div>

      {cargando ? (
        <p className="text-slate-400 text-center py-16">Cargando reseñas…</p>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-slate-400 mb-4">No se pudieron cargar las reseñas.</p>
          <Link to="/" className="text-purple-400 hover:text-purple-300">
            Volver a la portada
          </Link>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 mb-4">No hay reseñas con este hashtag todavía.</p>
          <Link to="/" className="text-purple-400 hover:text-purple-300">
            Explorar todas las reseñas
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-8">
            {reviews.map((review) => (
              <ReviewListItem key={review.id} review={review} highlightTag={tag} />
            ))}
          </div>

          <Paginacion
            pagina={pagina}
            total={total}
            porPagina={POR_PAGINA}
            alCambiar={(n) => setParams({ page: String(n) })}
          />
        </>
      )}
    </div>
  );
}

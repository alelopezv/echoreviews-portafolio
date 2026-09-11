import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Hash, ArrowLeft } from "lucide-react";
import api from "../../services/api";
import { ReviewListItem } from "./ReviewListItem";
import type { Review } from "../../types";
import { AIRE_LATERAL } from "../../lib/estilos";

export function HashtagPage() {
  const { tag } = useParams();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!tag) return;

    setCargando(true);
    setError(false);

    // No hay endpoint que filtre reseñas por hashtag, así que se pide el
    // listado y se filtra acá. Es la misma decisión que en MediaDetailPage y
    // está anotada en el README: con este volumen alcanza, y el día que no
    // alcance se resuelve con un ?hashtag= en el backend, no con más código
    // en el cliente.
    api.get("reviews/")
      .then((res) => {
        const todas: Review[] = res.data.results || res.data;
        setReviews(todas.filter((r) => (r.hashtags ?? []).includes(tag)));
      })
      .catch((err) => {
        console.error(err);
        setError(true);
      })
      .finally(() => setCargando(false));
  }, [tag]);

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
          <p className="text-slate-400">
            {reviews.length} {reviews.length === 1 ? "reseña encontrada" : "reseñas encontradas"}
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
        <div className="space-y-8">
          {reviews.map((review) => (
            <ReviewListItem key={review.id} review={review} highlightTag={tag} />
          ))}
        </div>
      )}
    </div>
  );
}

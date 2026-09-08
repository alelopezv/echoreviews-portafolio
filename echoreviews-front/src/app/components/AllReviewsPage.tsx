import type { Review } from "../../types";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { ReviewListItem } from "./ReviewListItem";
import { EstadoDeLista } from "./EstadoDeLista";

export function AllReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get("reviews/")
      .then(res => setReviews(res.data.results || res.data))
      .catch(err => {
        console.error(err);
        setError(true);
      })
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">
        Todas las reseñas
      </h1>

      <EstadoDeLista
        cargando={cargando}
        error={error}
        vacio={reviews.length === 0}
        mensajeVacio="Todavía no hay reseñas publicadas."
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
    </div>
  );
}

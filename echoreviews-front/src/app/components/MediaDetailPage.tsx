import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import api from "../../services/api";

export function MediaDetailPage() {
  // useParams lee el trozo variable de la URL. Como la ruta se declara
  // "media/:id", en /media/3 esto devuelve { id: "3" }.
  // Ojo: siempre es texto, nunca número — viene de la barra de direcciones.
  const { id } = useParams();

  const [media, setMedia] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Promise.all lanza las dos peticiones a la vez en vez de esperar una y
    // después la otra. Con dos llamadas independientes, tarda lo que la más
    // lenta y no la suma de ambas.
    Promise.all([
      api.get(`media/${id}/`),
      api.get("reviews/"),
    ])
      .then(([mediaRes, reviewsRes]) => {
        setMedia(mediaRes.data);

        // No hay endpoint que filtre reseñas por obra, así que se filtra acá.
        // Para un catálogo chico está bien; si algún día crecen las reseñas,
        // esto se resuelve en el backend con un ?media=<id>.
        setReviews(
          reviewsRes.data.filter((r: any) => r.media?.title === mediaRes.data.title)
        );
      })
      .catch((err) => {
        console.error(err);
        setError(true);
      })
      // finally corre pase lo que pase: así el "Cargando…" desaparece
      // también cuando la petición falla.
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-400 text-lg">Cargando obra...</p>
      </div>
    );
  }

  if (error || !media) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-400 text-lg mb-4">No encontramos esta obra.</p>
        <Link to="/media" className="text-purple-400 hover:text-purple-300">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Link
        to="/media"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Portada */}
        <div className="md:col-span-1">
          <div
            className={`overflow-hidden rounded-xl border border-slate-700 ${
              media.type === "music" ? "aspect-square" : "aspect-[2/3]"
            }`}
          >
            <img
              src={media.image || "/no-poster.png"}
              alt={media.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Ficha */}
        <div className="md:col-span-2">
          <h1 className="text-4xl font-bold text-white mb-2">{media.title}</h1>

          <p className="text-purple-400 capitalize mb-6">{media.type}</p>

          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">
            Sinopsis
          </h2>
          <p className="text-slate-300 leading-relaxed">{media.description}</p>
        </div>
      </div>

      {/* Reseñas de esta obra */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-white mb-6">
          Reseñas de esta obra ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <p className="text-slate-500">
            Todavía nadie ha reseñado esta obra. Podrías ser el primero.
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Link
                key={review.id}
                to={`/review/${review.id}`}
                className="block p-4 rounded-xl bg-slate-800/30 border border-slate-700 hover:border-purple-500 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-white font-semibold mb-1">{review.title}</h3>
                    <p className="text-slate-400 text-sm line-clamp-2">
                      {review.content}
                    </p>
                    <p className="text-slate-500 text-xs mt-2">
                      por {review.full_name || review.username}
                    </p>
                  </div>

                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-semibold flex-none">
                    <Star className="w-4 h-4 fill-current" />
                    {review.rating}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

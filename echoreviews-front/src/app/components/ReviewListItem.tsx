import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import type { MediaType, Review } from "../../types";

interface ReviewListItemProps {
  review: Review;
  /**
   * Cuando la tarjeta se muestra dentro de la página de un hashtag, ese
   * hashtag se resalta entre los demás para que se vea por qué está acá.
   */
  highlightTag?: string;
}

const COLOR_POR_TIPO: Record<MediaType, string> = {
  anime: "text-purple-400",
  music: "text-pink-400",
  game: "text-blue-400",
};

function colorDeCategoria(tipo?: MediaType) {
  return tipo ? COLOR_POR_TIPO[tipo] : "text-gray-400";
}

function formatearFecha(fecha: string) {
  return new Intl.DateTimeFormat("es-ES", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(fecha));
}

/** 200 palabras por minuto es el promedio que usan Medium y compañía. */
function minutosDeLectura(texto: string) {
  return Math.max(1, Math.ceil(texto.trim().split(/\s+/).length / 200));
}

/**
 * La tarjeta de una reseña en un listado.
 *
 * Vive en su propio archivo porque la usan la portada y la página de cada
 * hashtag. Cuando estaba duplicada, el mapa de colores tenía las categorías
 * "games" y "film" —que no existen en el modelo— en los dos lugares: un
 * mismo error copiado es un error que se arregla una vez y sobrevive en otra
 * parte.
 */
export function ReviewListItem({ review, highlightTag }: ReviewListItemProps) {
  const etiquetas = review.hashtags ?? [];

  return (
    <Link to={`/review/${review.id}`} className="group block">
      <article className="rounded-2xl overflow-hidden bg-slate-800/30 border border-slate-700/50 hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-500/10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portada */}
          <div className="lg:col-span-1 aspect-[4/3] overflow-hidden">
            <img
              src={review.media?.image || "/no-poster.png"}
              alt={review.media?.title ?? review.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Contenido */}
          <div className="lg:col-span-2 p-6 lg:py-6 lg:pr-6 lg:pl-0">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(review.username)}&background=7c3aed&color=fff`}
                  alt={review.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm text-slate-300">{review.username}</span>
              </div>
              <span className="text-slate-600">•</span>
              <span className="text-sm text-slate-400">{formatearFecha(review.created_at)}</span>
              <span className="text-slate-600">•</span>
              <span className="text-sm text-slate-400">
                ~{minutosDeLectura(review.content)} min de lectura
              </span>
              <span className="text-slate-600">•</span>
              <span className={`text-sm font-medium capitalize ${colorDeCategoria(review.media?.type)}`}>
                {review.media?.type}
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
              {review.title}
            </h3>

            {review.media?.pending && (
              <span className="inline-block mb-3 px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Obra pendiente de aprobación
              </span>
            )}

            <p className="text-slate-400 mb-4 line-clamp-2">
              {review.content.length > 120
                ? `${review.content.slice(0, 120)}…`
                : review.content}
            </p>

            <div className="flex items-center justify-between">
              {/* Etiquetas. Son <span> y no <Link> a propósito: la tarjeta
                  entera ya es un enlace, y un <a> dentro de otro <a> es HTML
                  inválido — el navegador lo desarma y el resultado depende de
                  cada uno. Para navegar por hashtags está la página /hashtags. */}
              <div className="flex flex-wrap gap-2">
                {etiquetas.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className={`text-xs px-2 py-1 rounded-full ${
                      tag === highlightTag
                        ? "bg-purple-500/30 text-purple-300 border border-purple-500/50"
                        : "bg-slate-700/50 text-slate-300"
                    }`}
                  >
                    #{tag}
                  </span>
                ))}
                {etiquetas.length > 3 && (
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-700/50 text-slate-400">
                    +{etiquetas.length - 3}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-yellow-500/20">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-bold text-yellow-400">{review.rating}</span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

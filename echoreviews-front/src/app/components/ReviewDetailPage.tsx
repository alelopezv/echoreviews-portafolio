import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Star, Hash, User, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../services/api";
import type { Media, Review } from "../../types"
import { claseDeAspecto } from "../../lib/media";
import { useUsuarioActual } from "../../lib/sesion";
import { AIRE_LATERAL } from "../../lib/estilos";

export function ReviewDetailPage() {
  const { id } = useParams();
  const [review, setReview] = useState<Review | null>(null);
  const usuario = useUsuarioActual();

  useEffect(() => {
    if (!id) return;

    api.get(`reviews/${id}/`)
      .then(res => setReview(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!review) {
    return (
        <div className={`max-w-4xl mx-auto ${AIRE_LATERAL} py-16 text-center`}>
          <p className="text-slate-400 text-lg">Cargando reseña...</p>
        </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getCategoryColor = (category?: Media["type"]) => {
    const colors: Record<Media["type"], string> = {
      anime: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      music: "bg-pink-500/20 text-pink-300 border-pink-500/30",
      game: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    };
    return category ? colors[category] : "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <div className={`max-w-5xl mx-auto ${AIRE_LATERAL} pt-8 flex items-center justify-between`}>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-purple-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver</span>
        </Link>

        {/* Solo el autor. El backend responde 403 a cualquier otro, así que
            esconder el enlace no es la seguridad: es no ofrecer una puerta
            que va a estar cerrada. */}
        {usuario?.username === review.username && (
          <Link
            to={`/review/${review.id}/edit`}
            className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Editar
          </Link>
        )}
      </div>

      {/* La portada a la izquierda y la reseña a la derecha.
          Antes la portada era una banda <div aspect-[21/9]> a todo el ancho con
          la imagen en object-cover: una portada vertical forzada a proporción
          panorámica, recortada a una franja del medio y ampliada a más de 1000
          píxeles. De ahí venía el pixelado, y no del recorte.

          Acá la columna mide 240px y la imagen conserva su proporción, así que
          nunca se muestra más grande que su tamaño real. */}
      <div className={`max-w-5xl mx-auto ${AIRE_LATERAL} py-8`}>
        {/* minmax(0,1fr) en la segunda columna, y min-w-0 en el <article>:
            sin eso, una palabra larga o un bloque ancho estiran la columna de
            texto y descuadran toda la rejilla. Es el ajuste que casi siempre
            falta cuando un grid "se sale" de la pantalla. */}
        <div className="grid grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)] gap-8 lg:gap-12 items-start">

          {/* Columna de la portada */}
          <div className="md:sticky md:top-8 space-y-3">
            <div
              className={`overflow-hidden rounded-xl border border-slate-700 ${claseDeAspecto(
                review.media?.type
              )}`}
            >
              <img
                src={review.media?.image || "/no-poster.png"}
                alt={review.media?.title ?? review.title}
                className="w-full h-full object-cover"
              />
            </div>

            <span
              className={`block text-center px-4 py-2 rounded-full border capitalize text-sm font-medium ${getCategoryColor(
                review.media?.type
              )}`}
            >
              {review.media?.type}
            </span>

            {review.media?.pending && (
              <p className="text-xs text-center text-amber-400">
                Obra pendiente de aprobación
              </p>
            )}
          </div>

          {/* Columna de la reseña */}
          <article className="min-w-0 pb-16">
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
          {review.title}
        </h1>

        {/* Media Title */}
        <div className="text-xl text-slate-400 mb-8 italic">
          {review.media?.title}
        </div>

        {/* Author & Meta */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-8 border-b border-slate-700/50">
          <div className="flex items-center gap-4">
            <img
              src={`https://ui-avatars.com/api/?name=${review.full_name}&background=7c3aed&color=fff`}
              alt={review.full_name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <div className="font-semibold text-white">{review.full_name}</div>
              <div className="text-sm text-slate-400">@{review.username}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(review.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>~{Math.max(1, Math.ceil(review.content.split(/\s+/).length / 200))} min</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/20">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="font-bold text-yellow-400">{review.rating}/5</span>
            </div>
          </div>
        </div>

        {/* Acá había un "extracto" con review.content.slice(0, 120) dentro de
            un recuadro con borde morado, seguido del texto completo que
            empieza exactamente igual. O sea: repetía palabra por palabra lo
            que venía tres líneas más abajo.

            Un extracto tiene sentido en un listado, donde reemplaza al texto
            completo. En el detalle, donde el texto está entero a la vista, no
            resume nada: solo lo dice dos veces. */}

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none">
          {review.content.split('\n\n').map((paragraph: string, index: number) => (
            <p key={index} className="text-slate-300 mb-6 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Hashtags */}
        <div className="mt-12 pt-8 border-t border-slate-700/50">
          <div className="flex items-center gap-2 mb-4">
            <Hash className="w-5 h-5 text-slate-400" />
            <span className="font-semibold text-white">Etiquetas</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {review.hashtags?.map((tag: string) => (
              <Link
                key={tag}
                to={`/hashtag/${tag}`}
                className="px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 hover:border-purple-500/50 text-slate-300 hover:text-purple-300 transition-colors text-sm"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Author Bio */}
        <div className="mt-12 p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500
                flex items-center justify-center flex-none">
              <span className="text-2xl font-bold text-white">
                {review.full_name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-purple-400" />
                <span className="font-semibold text-white">{review.full_name}</span>
              </div>
              <p className="text-slate-400 text-sm">
                Crítico cultural especializado en arte audiovisual de culto.
                Escribiendo sobre las obras que merecen atención y análisis profundo.
              </p>
            </div>
          </div>
        </div>

        {/* More Reviews CTA */}
        <div className="mt-12 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all"
          >
            <span>Leer más reseñas</span>
            <span>→</span>
          </Link>
        </div>
          </article>
        </div>
      </div>
    </div>
  );
}

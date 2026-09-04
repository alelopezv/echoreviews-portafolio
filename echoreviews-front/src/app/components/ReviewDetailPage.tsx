import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Star, Hash, User } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../services/api";

export function ReviewDetailPage() {
  const { id } = useParams();
  const [review, setReview] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    api.get(`reviews/${id}/`)
      .then(res => setReview(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!review) {
    return (
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
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

  const getCategoryColor = (category: string) => {
    const colors = {
      anime: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      music: "bg-pink-500/20 text-pink-300 border-pink-500/30",
      games: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      film: "bg-green-500/20 text-green-300 border-green-500/30"
    };
    return colors[category as keyof typeof colors] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-purple-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver</span>
        </Link>
      </div>

      {/* Hero Image */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="aspect-[21/9] rounded-2xl overflow-hidden">
          <img
            src={review.media?.image || "/no-poster.png"}
            alt={review.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Category Badge */}
        <div className="flex justify-center mb-6">
          <span className={`inline-flex items-center px-4 py-2 rounded-full border capitalize text-sm font-medium ${getCategoryColor(review.media?.type)}`}>
            {review.media?.type}
          </span>
        </div>

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
              src="https://via.placeholder.com/100"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <div className="font-semibold text-white">{review.full_name}</div> {/* ALGO TEMPORAL review.author.name */}
              {/* <div className="text-sm text-slate-400">@{review.author.username}</div> */}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(review.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>~5 min</span> {/* ALGO TEMPORAL review.readTime */}
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/20">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="font-bold text-yellow-400">{review.rating}/5</span>
            </div>
          </div>
        </div>

        {/* Excerpt */}
        <div className="text-xl text-slate-300 mb-8 p-6 border-l-4 border-purple-500 bg-slate-800/30 rounded-r-xl">
          {review.content.slice(0, 120)}
        </div>

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
                {/* <span className="text-slate-500">@{review.author.username}</span> */}
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
  );
}

import { Link } from "react-router-dom";
import { Pen, Hash, TrendingUp, Clock, Star } from "lucide-react";
import { reviewsData } from "../data/mockData";
import { useEffect, useState } from "react";
import api from "../../services/api.ts";

export function HomePage() {
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    api.get("reviews/")
      .then(res => {
        setReviews(res.data.results || res.data);
      })
      .catch(err => console.error(err));
  }, []);

  const latestReviews = reviews.slice(0, 6);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      anime: "text-purple-400",
      music: "text-pink-400",
      games: "text-blue-400",
      film: "text-green-400"
    };
    return colors[category as keyof typeof colors] || "text-gray-400";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 mb-6">
          <Pen className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-purple-300">Crítica cultural independiente</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
          EchoReviews
        </h1>

        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
          Un espacio para reseñas profundas sobre arte audiovisual de culto.
          Anime, música y videojuegos que merece ser analizado.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/write"
            className="group flex items-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all"
          >
            <Pen className="w-5 h-5" />
            <span className="font-semibold">Escribir Reseña</span>
          </Link>

          <Link
            to="/hashtags"
            className="group flex items-center gap-3 px-6 py-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-purple-500/50 text-white transition-all"
          >
            <Hash className="w-5 h-5" />
            <span className="font-semibold">Explorar Hashtags</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Pen className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white">{reviewsData.length}</div>
          </div>
          <p className="text-slate-400">Reseñas publicadas</p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-pink-400" />
            </div>
            <div className="text-3xl font-bold text-white">42</div>
          </div>
          <p className="text-slate-400">Escritores activos</p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Hash className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white">156</div>
          </div>
          <p className="text-slate-400">Hashtags únicos</p>
        </div>
      </div>

      {/* Latest Reviews */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <Clock className="w-6 h-6 text-purple-400" />
          <h2 className="text-3xl font-bold text-white">Últimas Reseñas</h2>
        </div>

        <div className="space-y-8">
          {latestReviews.map((review) => (
            <Link
              key={review.id}
              to={`/review/${review.id}`}
              className="group block"
            >
              <article className="rounded-2xl overflow-hidden bg-slate-800/30 border border-slate-700/50 hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-500/10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Image */}
                  <div className="lg:col-span-1 aspect-[4/3] overflow-hidden">
                    <img
                      src={review.media?.image || "https://via.placeholder.com/400x300"}
                      alt={review.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Content */}
                  <div className="lg:col-span-2 p-6 lg:py-6 lg:pr-6 lg:pl-0">
                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://ui-avatars.com/api/?name=${review.user}&background=7c3aed&color=fff`}
                          alt={review.user}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-sm text-slate-300">{review.user}</span>
                      </div>
                      <span className="text-slate-600">•</span>
                      <span className="text-sm text-slate-400">{formatDate(review.created_at)}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-sm text-slate-400">~5 min de lectura</span>
                      <span className="text-slate-600">•</span>
                      <span className={`text-sm font-medium capitalize ${getCategoryColor(review.media?.type)}`}>
                        {review.media?.type}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                      {review.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-slate-400 mb-4 line-clamp-2">
                      {review.content.slice(0, 120) + "..."}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      {/* Hashtags */}
                      <div className="flex flex-wrap gap-2">
                        {(review.hashtags || []).slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 rounded-full bg-slate-700/50 text-slate-300 hover:bg-purple-500/20 hover:text-purple-300 transition-colors"
                          >
                            #{tag}
                          </span>
                        ))}
                        {review.hashtags.length > 3 && (
                          <span className="text-xs px-2 py-1 rounded-full bg-slate-700/50 text-slate-400">
                            +{(review.hashtags || []).length - 3}
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-yellow-500/20">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-bold text-yellow-400">{review.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            to="/all-reviews"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-purple-500/50 text-white transition-all"
          >
            <span>Ver todas las reseñas</span>
            <span>→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

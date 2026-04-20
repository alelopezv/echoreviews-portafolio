import { useParams, Link } from "react-router-dom";
import { Hash, ArrowLeft, Star, Calendar, Clock } from "lucide-react";
import { getReviewsByHashtag } from "../data/mockData";

export function HashtagPage() {
  const { tag } = useParams();
  const reviews = getReviewsByHashtag(tag!);

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
      {/* Back Button */}
      <Link
        to="/hashtags"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-purple-400 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Ver todos los hashtags</span>
      </Link>

      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Hash className="w-6 h-6 text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold text-white">#{tag}</h1>
        </div>
        <p className="text-slate-400">
          {reviews.length} {reviews.length === 1 ? 'reseña encontrada' : 'reseñas encontradas'}
        </p>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 mb-4">No hay reseñas con este hashtag todavía.</p>
          <Link to="/" className="text-purple-400 hover:text-purple-300">
            Explorar todas las reseñas
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {reviews.map((review) => (
            <Link
              key={review.id}
              to={`/review/${review.id}`}
              className="group block"
            >
              <article className="rounded-2xl overflow-hidden bg-slate-800/30 border border-slate-700/50 hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-500/10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Image */}
                  <div className="lg:col-span-1 aspect-[4/3] lg:aspect-auto overflow-hidden">
                    <img
                      src={review.coverImage}
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
                          src={review.author.avatar}
                          alt={review.author.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-sm text-slate-300">{review.author.name}</span>
                      </div>
                      <span className="text-slate-600">•</span>
                      <span className="text-sm text-slate-400">{formatDate(review.date)}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-sm text-slate-400">{review.readTime} min</span>
                      <span className="text-slate-600">•</span>
                      <span className={`text-sm font-medium capitalize ${getCategoryColor(review.category)}`}>
                        {review.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                      {review.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-slate-400 mb-4 line-clamp-2">
                      {review.excerpt}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      {/* Hashtags */}
                      <div className="flex flex-wrap gap-2">
                        {review.hashtags.slice(0, 3).map((hashtag) => (
                          <span
                            key={hashtag}
                            className={`text-xs px-2 py-1 rounded-full ${
                              hashtag === tag
                                ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                                : 'bg-slate-700/50 text-slate-300'
                            }`}
                          >
                            #{hashtag}
                          </span>
                        ))}
                        {review.hashtags.length > 3 && (
                          <span className="text-xs px-2 py-1 rounded-full bg-slate-700/50 text-slate-400">
                            +{review.hashtags.length - 3}
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
      )}
    </div>
  );
}

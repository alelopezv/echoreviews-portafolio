import { Link } from "react-router-dom";
import { Hash, TrendingUp } from "lucide-react";
import { getAllHashtags, getReviewsByHashtag } from "../data/mockData";

export function AllHashtagsPage() {
  const allHashtags = getAllHashtags();

  const getHashtagCount = (tag: string) => {
    return getReviewsByHashtag(tag).length;
  };

  const popularHashtags = allHashtags
    .map(tag => ({ tag, count: getHashtagCount(tag) }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Hash className="w-6 h-6 text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold text-white">Explorar Hashtags</h1>
        </div>
        <p className="text-slate-400">
          Descubre reseñas por tema, género, artista o lo que estés buscando
        </p>
      </div>

      {/* Popular Tags Section */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-pink-400" />
          <h2 className="text-2xl font-bold text-white">Más Populares</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {popularHashtags.slice(0, 12).map(({ tag, count }) => (
            <Link
              key={tag}
              to={`/hashtag/${tag}`}
              className="group p-6 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10"
            >
              <div className="flex items-start justify-between mb-2">
                <Hash className="w-5 h-5 text-purple-400" />
                <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
                  {count}
                </span>
              </div>
              <div className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                {tag}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* All Tags Section */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Todos los Hashtags</h2>
        <div className="flex flex-wrap gap-3">
          {allHashtags.map((tag) => {
            const count = getHashtagCount(tag);
            return (
              <Link
                key={tag}
                to={`/hashtag/${tag}`}
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all"
              >
                <span className="text-slate-300 group-hover:text-purple-300 transition-colors">
                  #{tag}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400 group-hover:bg-purple-500/20 group-hover:text-purple-300">
                  {count}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

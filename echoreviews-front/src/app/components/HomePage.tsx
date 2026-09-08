import { Link } from "react-router-dom";
import { Pen, Hash, TrendingUp, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { ReviewListItem } from "./ReviewListItem";
import { EstadoDeLista } from "./EstadoDeLista";
import type { Review } from "../../types";

export function HomePage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get("reviews/")
      .then(res => {
        setReviews(res.data.results || res.data);
      })
      .catch(err => {
        console.error(err);
        setError(true);
      })
      .finally(() => setCargando(false));
  }, []);

  const latestReviews = reviews.slice(0, 6);

  // Los tres números de la portada salen de las reseñas que acaban de llegar.
  // Antes dos de ellos eran constantes escritas a mano —42 escritores, 156
  // hashtags— que no cambiaban aunque la base estuviera vacía.
  const escritores = new Set(reviews.map((r) => r.username)).size;
  const hashtagsEnUso = new Set(reviews.flatMap((r) => r.hashtags ?? [])).size;

  // Si la petición falló, `reviews` está vacío y las tres cifras darían cero.
  // Un cero afirma que no hay reseñas, y eso no es lo que pasó: lo que pasó es
  // que no sabemos cuántas hay.
  const cifra = (n: number) => (error ? "—" : cargando ? "…" : n);

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
            <div className="text-3xl font-bold text-white">{cifra(reviews.length)}</div>
          </div>
          <p className="text-slate-400">Reseñas publicadas</p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-pink-400" />
            </div>
            <div className="text-3xl font-bold text-white">{cifra(escritores)}</div>
          </div>
          <p className="text-slate-400">Escritores activos</p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Hash className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white">{cifra(hashtagsEnUso)}</div>
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

        <EstadoDeLista
          cargando={cargando}
          error={error}
          vacio={reviews.length === 0}
          mensajeVacio="Todavía no hay reseñas publicadas. Podrías escribir la primera."
        >
          <div className="space-y-8">
            {latestReviews.map((review) => (
              <ReviewListItem key={review.id} review={review} />
            ))}
          </div>
        </EstadoDeLista>

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

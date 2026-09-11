import { Link } from "react-router-dom";
import { Pen, Hash, TrendingUp, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { ReviewListItem } from "./ReviewListItem";
import { EstadoDeLista } from "./EstadoDeLista";
import type { Estadisticas, Pagina, Review } from "../../types";
import { AIRE_LATERAL } from "../../lib/estilos";

export function HomePage() {
  const [latestReviews, setLatestReviews] = useState<Review[]>([]);
  const [cifras, setCifras] = useState<Estadisticas | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Dos peticiones a la vez, porque piden cosas distintas: la primera página
    // de reseñas y los totales del sitio.
    //
    // Antes era una sola: se pedían TODAS las reseñas y de ahí salía todo, la
    // lista y los tres números. Con la paginación eso dejó de servir —el
    // navegador solo recibe cinco— y de paso se arregla lo que siempre estuvo
    // mal: los totales no son algo que se deduzca de los datos que uno tenga a
    // mano, son una pregunta aparte.
    Promise.all([
      api.get<Pagina<Review>>("reviews/"),
      api.get<Estadisticas>("reviews/stats/"),
    ])
      .then(([listado, estadisticas]) => {
        setLatestReviews(listado.data.results);
        setCifras(estadisticas.data);
      })
      .catch(err => {
        console.error(err);
        setError(true);
      })
      .finally(() => setCargando(false));
  }, []);

  // La portada muestra las cinco más recientes; el resto está detrás de "Ver
  // todas las reseñas". El corte ya no lo hace el navegador: la primera página
  // del endpoint SON las cinco más recientes, así que no se descarga nada que
  // no se vaya a mostrar.

  // Si la petición falló no sabemos cuántas hay, y un cero afirmaría que no hay
  // ninguna. Son cosas distintas y la portada no debería confundirlas.
  const cifra = (n?: number) =>
    error ? "—" : cargando || n === undefined ? "…" : n;

  return (
    <div className={`max-w-7xl mx-auto ${AIRE_LATERAL} py-12`}>
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
      {/* Tres en fila también en el teléfono.
          Apiladas (`grid-cols-1`) ocupaban tres tarjetas de ancho completo con
          el contenido pegado a la izquierda: mucho espacio muerto al lado, y
          unos 500 px de scroll antes de llegar a las reseñas, que es lo que la
          gente vino a ver. De a tres son compactas y se leen igual. */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-10 sm:mb-16">
        <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:gap-3 gap-1 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Pen className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white">{cifra(cifras?.reviews)}</div>
          </div>
          <p className="text-slate-400">Reseñas publicadas</p>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:gap-3 gap-1 mb-2">
            <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-pink-400" />
            </div>
            <div className="text-3xl font-bold text-white">{cifra(cifras?.writers)}</div>
          </div>
          <p className="text-slate-400">Escritores activos</p>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:gap-3 gap-1 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Hash className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white">{cifra(cifras?.hashtags)}</div>
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
          vacio={latestReviews.length === 0}
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

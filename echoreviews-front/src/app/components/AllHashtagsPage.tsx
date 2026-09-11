import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Hash, TrendingUp } from "lucide-react";
import api from "../../services/api";
import type { Hashtag, Review } from "../../types";
import { AIRE_LATERAL } from "../../lib/estilos";

interface EtiquetaConUso {
  name: string;
  count: number;
}

export function AllHashtagsPage() {
  const [etiquetas, setEtiquetas] = useState<EtiquetaConUso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Dos fuentes distintas y las dos hacen falta:
    //   /api/hashtags/ es el catálogo aprobado — la verdad sobre qué
    //     etiquetas existen, incluidas las que todavía no usa nadie.
    //   /api/reviews/ da el uso real, porque cada reseña trae sus etiquetas.
    // Promise.all las pide a la vez: tarda lo que la más lenta, no la suma.
    Promise.all([
      api.get("hashtags/"),
      api.get("reviews/"),
    ])
      .then(([hashtagsRes, reviewsRes]) => {
        const catalogo: Hashtag[] = hashtagsRes.data.results || hashtagsRes.data;
        const reviews: Review[] = reviewsRes.data.results || reviewsRes.data;

        // Cuántas reseñas usan cada etiqueta. Se cuenta una sola vez sobre
        // todas las reseñas en vez de recorrerlas por cada hashtag.
        const usos = new Map<string, number>();
        for (const review of reviews) {
          for (const tag of review.hashtags ?? []) {
            usos.set(tag, (usos.get(tag) ?? 0) + 1);
          }
        }

        setEtiquetas(
          catalogo.map((h) => ({ name: h.name, count: usos.get(h.name) ?? 0 }))
        );
      })
      .catch((err) => {
        console.error(err);
        setError(true);
      })
      .finally(() => setCargando(false));
  }, []);

  const populares = etiquetas
    .filter((e) => e.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  return (
    <div className={`max-w-7xl mx-auto ${AIRE_LATERAL} py-12`}>
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

      {cargando ? (
        <p className="text-slate-400 text-center py-16">Cargando hashtags…</p>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-slate-400 mb-4">No se pudieron cargar los hashtags.</p>
          <Link to="/" className="text-purple-400 hover:text-purple-300">
            Volver a la portada
          </Link>
        </div>
      ) : etiquetas.length === 0 ? (
        <p className="text-slate-400 text-center py-16">
          Todavía no hay hashtags aprobados.
        </p>
      ) : (
        <>
          {populares.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-pink-400" />
                <h2 className="text-2xl font-bold text-white">Más Populares</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {populares.map(({ name, count }) => (
                  <Link
                    key={name}
                    to={`/hashtag/${name}`}
                    className="group p-6 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Hash className="w-5 h-5 text-purple-400" />
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
                        {count}
                      </span>
                    </div>
                    <div className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                      {name}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Todos los Hashtags</h2>
            <div className="flex flex-wrap gap-3">
              {etiquetas.map(({ name, count }) => (
                <Link
                  key={name}
                  to={`/hashtag/${name}`}
                  className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all"
                >
                  <span className="text-slate-300 group-hover:text-purple-300 transition-colors">
                    #{name}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400 group-hover:bg-purple-500/20 group-hover:text-purple-300">
                    {count}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import api from "../../services/api";
import { useUsuarioActual } from "../../lib/sesion";
import type { Hashtag, Review } from "../../types";
import { AIRE_LATERAL, AIRE_VERTICAL } from "../../lib/estilos";

/**
 * Corregir una reseña propia.
 *
 * Existe porque el ciclo de moderación lo necesitaba y estaba a medias: el
 * backend devuelve una reseña rechazada a la cola cuando su autor la corrige,
 * y el perfil le decía al usuario "corrígela y volverá a revisión" sin
 * ofrecerle ningún sitio donde hacerlo.
 *
 * Solo se edita el texto, la puntuación y las etiquetas. La obra de la que
 * habla no se cambia: eso no es corregir una reseña, es escribir otra. Y las
 * etiquetas se eligen del catálogo aprobado, sin proponer nuevas — proponer
 * pertenece al momento de publicar.
 */
export function EditReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const usuario = useUsuarioActual();

  const [review, setReview] = useState<Review | null>(null);
  const [hashtagsDisponibles, setHashtagsDisponibles] = useState<Hashtag[]>([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [elegidos, setElegidos] = useState<number[]>([]);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    Promise.all([api.get(`reviews/${id}/`), api.get("hashtags/")])
      .then(([resenaRes, hashtagsRes]) => {
        const r: Review = resenaRes.data;
        const catalogo: Hashtag[] = hashtagsRes.data.results || hashtagsRes.data;

        setReview(r);
        setHashtagsDisponibles(catalogo);
        setTitle(r.title);
        setContent(r.content);
        setRating(r.rating);

        // La reseña trae sus etiquetas por nombre y el formulario las manda
        // por id, así que hay que cruzarlas contra el catálogo.
        const nombres = new Set(r.hashtags ?? []);
        setElegidos(catalogo.filter((h) => nombres.has(h.name)).map((h) => h.id));
      })
      .catch((err) => {
        console.error(err);
        setError("No se pudo cargar la reseña.");
      })
      .finally(() => setCargando(false));
  }, [id]);

  const alternar = (idHashtag: number) => {
    setElegidos((actuales) =>
      actuales.includes(idHashtag)
        ? actuales.filter((x) => x !== idHashtag)
        : [...actuales, idHashtag]
    );
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setGuardando(true);

    try {
      await api.patch(`reviews/${id}/`, {
        title,
        content,
        rating,
        hashtags: elegidos,
      });
      navigate(`/review/${id}`);
    } catch (err) {
      console.error(err);

      const sinPermiso = axios.isAxiosError(err) && err.response?.status === 403;
      setError(
        sinPermiso
          ? "Solo el autor puede editar esta reseña."
          : "No se pudieron guardar los cambios."
      );
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <p className="text-slate-400 text-center py-16">Cargando reseña…</p>;
  }

  if (!review) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400 mb-4">{error || "No encontramos esta reseña."}</p>
        <Link to="/profile" className="text-purple-400 hover:text-purple-300">
          Volver a mi perfil
        </Link>
      </div>
    );
  }

  // El backend responde 403 igual, pero avisar antes evita que alguien
  // escriba una corrección entera para que se la rechacen al guardar.
  if (usuario && usuario.username !== review.username) {
    return (
      <div className={`max-w-3xl mx-auto ${AIRE_LATERAL} py-16 text-center`}>
        <p className="text-slate-300 mb-2">Esta reseña no es tuya.</p>
        <p className="text-sm text-slate-500 mb-6">
          Cada quien corrige lo que escribió: moderar una reseña ajena se hace
          aprobándola o rechazándola con un motivo, no reescribiéndola.
        </p>
        <Link to={`/review/${id}`} className="text-purple-400 hover:text-purple-300">
          Leer la reseña
        </Link>
      </div>
    );
  }

  return (
    <div className={`max-w-3xl mx-auto ${AIRE_LATERAL} ${AIRE_VERTICAL}`}>
      <Link
        to={`/review/${id}`}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-purple-400 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a la reseña</span>
      </Link>

      <h1 className="text-3xl font-bold text-white mb-1">Editar reseña</h1>
      <p className="text-slate-400 mb-8">
        Sobre <span className="italic">{review.media?.title}</span>
      </p>

      {review.status === "rejected" && (
        <div className="mb-8 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <p className="text-sm font-semibold text-amber-300 mb-1">
            Esta reseña fue rechazada
          </p>
          <p className="text-sm text-slate-300 mb-2">{review.rejection_reason}</p>
          <p className="text-xs text-slate-400">
            Al guardar los cambios vuelve a la cola de revisión.
          </p>
        </div>
      )}

      <form onSubmit={guardar} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Título
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Tu reseña
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={14}
            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white leading-relaxed"
          />
          <p className="text-xs text-slate-500 mt-1">
            Separa los párrafos con una línea en blanco.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Tu calificación
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((valor) => (
              <button
                key={valor}
                type="button"
                onClick={() => setRating(valor)}
                className={`w-10 h-10 rounded-lg font-bold transition-all ${
                  valor <= rating
                    ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/20"
                    : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                }`}
              >
                {valor}
              </button>
            ))}
          </div>
        </div>

        {hashtagsDisponibles.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Etiquetas
            </label>
            <div className="flex flex-wrap gap-2">
              {hashtagsDisponibles.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => alternar(h.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    elegidos.includes(h.id)
                      ? "bg-purple-500/30 text-purple-200 border-purple-500/50"
                      : "bg-slate-700/50 text-slate-300 border-transparent hover:border-slate-500"
                  }`}
                >
                  #{h.name}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Solo etiquetas ya aprobadas. Para proponer una nueva, se hace al
              publicar una reseña.
            </p>
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm whitespace-pre-line">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={guardando || !title.trim() || !content.trim() || rating === 0}
            className="px-6 py-3 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-all"
          >
            {guardando ? "Guardando…" : "Guardar cambios"}
          </button>
          <Link
            to={`/review/${id}`}
            className="px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-300 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}

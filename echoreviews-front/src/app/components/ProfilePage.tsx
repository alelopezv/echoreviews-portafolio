import { Award, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ReviewCard } from "./ReviewCard";
import { EstadoDeLista } from "./EstadoDeLista";
import api from "../../services/api";
import type { Review, User } from "../../types";

export function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, reviewsRes] = await Promise.all([
          api.get("users/me/"),
          api.get("reviews/mine/")
        ]);

        setUser(userRes.data);
        setReviews(reviewsRes.data.results || reviewsRes.data);

      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setCargando(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-purple-500/30">
          <span className="text-4xl font-bold text-white">{user?.username?.charAt(0).toUpperCase() || "U"}</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {user?.full_name || user?.username}
        </h1>
        <p className="text-slate-400">
          {user && `Miembro desde ${new Intl.DateTimeFormat("es-ES", {
            month: "long", year: "numeric",
          }).format(new Date(user.date_joined))}`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white">{reviews.length}</div>
          </div>
          <p className="text-slate-400">Reseñas Totales</p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Actividad Reciente</h2>

        <EstadoDeLista
          cargando={cargando}
          error={error}
          vacio={reviews.length === 0}
          mensajeVacio="Todavía no has escrito ninguna reseña."
        >
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id}>
                <Link to={`/review/${review.id}`} className="block">
                  <ReviewCard review={review} />
                </Link>

                <div className="mt-2 flex justify-end">
                  <Link
                    to={`/review/${review.id}/edit`}
                    className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </Link>
                </div>

                {review.status === "rejected" && (
                  <div className="mt-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30">
                    <p className="text-sm font-semibold text-red-400 mb-1">Reseña rechazada</p>
                    <p className="text-sm text-slate-300">{review.rejection_reason}</p>
                    {/* Esto decía "corrígela y volverá a la cola" desde hacía
                        tiempo, sin que existiera ningún lugar donde corregirla.
                        Ahora el texto es un enlace y la promesa se cumple. */}
                    <Link
                      to={`/review/${review.id}/edit`}
                      className="inline-block text-xs text-purple-400 hover:text-purple-300 mt-2"
                    >
                      Corrígela y volverá a la cola de revisión →
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </EstadoDeLista>
      </div>
    </div>
  );
}

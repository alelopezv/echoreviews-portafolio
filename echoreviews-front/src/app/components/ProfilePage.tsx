import { Award } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ReviewCard } from "./ReviewCard";
import api from "../../services/api";

export function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, reviewsRes] = await Promise.all([
          api.get("users/me/"),
          api.get("reviews/mine/")
        ]);

        setUser(userRes.data);
        setReviews(reviewsRes.data);

      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);
  const stats = {
    totalReviews: reviews.length,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-purple-500/30">
          <span className="text-4xl font-bold text-white">{user?.username?.charAt(0).toUpperCase() || "U"}</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {user?.full_name || user?.username}
        </h1>
        <p className="text-slate-400">Miembro desde Marzo 2026</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalReviews}</div>
          </div>
          <p className="text-slate-400">Reseñas Totales</p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Actividad Reciente</h2>

        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id}>
              <Link to={`/review/${review.id}`} className="block">
                <ReviewCard review={review} />
              </Link>

              {review.status === "rejected" && (
                <div className="mt-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30">
                  <p className="text-sm font-semibold text-red-400 mb-1">Reseña rechazada</p>
                  <p className="text-sm text-slate-300">{review.rejection_reason}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Corrígela y volverá a la cola de revisión.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { Star, Tv, Music, Gamepad2, Award } from "lucide-react";
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

  const recentActivity = [
    {
      id: "1",
      type: "anime",
      title: "Steins;Gate",
      rating: 10,
      date: "2026-03-15",
    },
    {
      id: "2",
      type: "music",
      title: "OK Computer",
      rating: 10,
      date: "2026-03-12",
    },
    {
      id: "3",
      type: "game",
      title: "The Last of Us Part II",
      rating: 9,
      date: "2026-03-10",
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "anime":
        return <Tv className="w-4 h-4" />;
      case "music":
        return <Music className="w-4 h-4" />;
      case "game":
        return <Gamepad2 className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "anime":
        return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      case "music":
        return "text-pink-400 bg-pink-500/10 border-pink-500/20";
      case "game":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      default:
        return "";
    }
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
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-500">
            Este es un perfil de demostración. En producción se conectaría a una base de datos real.
          </p>
        </div>
      </div>
    </div>
  );
}

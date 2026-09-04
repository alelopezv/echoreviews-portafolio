import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export function AllReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    api.get("reviews/")
      .then(res => setReviews(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">
        Todas las reseñas
      </h1>

      <div className="space-y-6">
        {reviews.map((r) => (
          <Link
            key={r.id}
            to={`/review/${r.id}`}
            className="block p-4 rounded-xl bg-slate-800/30 border border-slate-700 hover:border-purple-500"
          >
            <h2 className="text-white font-semibold">{r.title}</h2>
            <p className="text-slate-400 text-sm">
              {r.media?.title} • {r.media?.type}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
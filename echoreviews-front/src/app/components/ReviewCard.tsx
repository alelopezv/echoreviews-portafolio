interface ReviewCardProps {
  review: any;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 flex items-center gap-4">
      
      {/* 🖼 Imagen */}
      {review.media?.image && (
        <img
          src={review.media.image}
          alt={review.media.title}
          className={`w-16 object-cover rounded-lg ${
            review.media.type === "music" ? "aspect-square" : "aspect-[2/3]"
          }`}
        />
      )}

      {/* 📄 Info */}
      <div className="flex-1">
        <p className="font-bold text-white mb-1">
          {review.title}
        </p>
        {review.media?.pending && (
          <span className="inline-block px-2 py-0.5 rounded text-xs
                          bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Obra pendiente de aprobación
          </span>
        )}
        <p className="text-sm text-slate-500">
          {new Date(review.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* ⭐ Rating */}
      <div className="px-3 py-1 rounded-full bg-yellow-500/20">
        <span className="font-bold text-yellow-400">
          ⭐ {review.rating}
        </span>
      </div>
    </div>
  );
}
interface ReviewCardProps {
  review: any;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 flex items-center gap-4">
      
      {/* 🖼 Imagen */}
      {review.media_image && (
        <img
          src={review.media_image}
          alt={review.title}
          className="w-16 h-16 object-cover rounded-lg"
        />
      )}

      {/* 📄 Info */}
      <div className="flex-1">
        <p className="font-bold text-white mb-1">
          {review.title}
        </p>
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
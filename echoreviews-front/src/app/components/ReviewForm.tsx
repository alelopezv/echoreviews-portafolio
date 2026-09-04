import { useState, useEffect } from "react";
import api from "../../services/api";
import { MediaPosterEditor } from "./MediaPosterEditor";

interface ReviewFormProps {
  onClose: () => void;
}

export function ReviewForm({ onClose }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [mediaListError, setMediaListError] = useState(false);
  const [mediaId, setMediaId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [mediaTitle, setMediaTitle] = useState("");
  const [mediaType, setMediaType] = useState("anime");
  const [cropData, setCropData] = useState<any>(null);
  const [mediaDescription, setMediaDescription] = useState("");

  useEffect(() => {
    api
      .get("media/")
      .then((res) => {
        setMediaList(res.data);
        setMediaListError(false);
      })
      .catch((err) => {
        console.error(err);
        setMediaListError(true);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("content", comment);
      formData.append("rating", rating.toString());

      if (mediaId) {
        formData.append("media", mediaId.toString());
      } else {
        formData.append("media_title", mediaTitle);
        formData.append("media_type", mediaType);
        formData.append("media_description", mediaDescription); 
      }

      if (image) {
        formData.append("image", image);
      }

      if (cropData) {
        formData.append("crop_x", cropData.x.toString());
        formData.append("crop_y", cropData.y.toString());
        formData.append("crop_width", cropData.width.toString());
        formData.append("crop_height", cropData.height.toString());
      }

      await api.post("reviews/create/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Reseña enviada correctamente");
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Error al enviar la reseña");
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
      <h3 className="text-xl font-bold text-white mb-4">Escribe tu Reseña</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 📝 TÍTULO */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título de la reseña"
          className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white"
        />

        {/* 🎬 MEDIA SELECT */}
        <div>
          <label className="block text-sm text-slate-300 mb-2">Media</label>

          {mediaListError ? (
            <p className="text-xs text-red-400 mb-2">
              No se pudo cargar la lista de medias. Puedes crear una nueva igual.
            </p>
          ) : mediaList.length === 0 ? (
            <p className="text-xs text-slate-500 mb-2">
              No hay medias aprobadas aún — crea una nueva abajo.
            </p>
          ) : null}

          <select
            value={mediaId ?? ""}
            onChange={(e) =>
              setMediaId(e.target.value ? Number(e.target.value) : null)
            }
            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white"
          >
            <option value="">➕ Crear nueva media</option>
            {mediaList.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title} ({m.type})
              </option>
            ))}
          </select>
        </div>

        {/* ➕ NUEVA MEDIA (solo si no eligió una existente) */}
        {!mediaId && (
          <div className="space-y-3">
            <input
              value={mediaTitle}
              onChange={(e) => setMediaTitle(e.target.value)}
              placeholder="Título de nueva media"
              className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white"
            />
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white"
            >
              <option value="anime">Anime</option>
              <option value="music">Música</option>
              <option value="game">Videojuego</option>
            </select>
            <textarea
              value={mediaDescription}
              onChange={(e) => setMediaDescription(e.target.value)}
              rows={3}
              placeholder="Sinopsis de la obra (de qué trata, no tu opinión)"
              className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white"
            />
          </div>
        )}

        {/* 💬 COMENTARIO */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Tu Comentario
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            placeholder="Comparte tu opinión sobre esta obra..."
            required
          />
        </div>

        {/* ⭐ RATING */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Tu Calificación
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(value)}
                className={`w-10 h-10 rounded-lg font-bold transition-all ${
                  value <= (hoveredRating || rating)
                    ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/20"
                    : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {/* 🖼 IMAGEN */}
        <div>
          <label className="block text-sm text-slate-300 mb-2">
            Imagen (opcional)
          </label>

          <div className="flex items-center gap-3 flex-wrap">
            <label className="cursor-pointer px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-all">
              Seleccionar imagen
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    setImage(file);
                    setPreview(URL.createObjectURL(file));
                    setCropData(null);
                  }
                }}
              />
            </label>
            <span className="text-sm text-slate-400">
              {image ? image.name : "Ningún archivo seleccionado"}
            </span>
          </div>

          {preview && (
            <div className="mt-4">
              <MediaPosterEditor
                image={preview}
                onCropConfirm={(area) => setCropData(area)}
              />
              {cropData && (
                <p className="text-xs text-green-400 mt-1">
                  ✓ Recorte listo para enviar
                </p>
              )}
            </div>
          )}
        </div>

        {/* 🚀 BOTONES */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={
              rating === 0 ||
              title.trim() === "" ||
              comment.trim() === "" ||
              (!mediaId && (!mediaTitle.trim() || !mediaDescription.trim() || !image))
            }
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Publicar Reseña
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-all"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

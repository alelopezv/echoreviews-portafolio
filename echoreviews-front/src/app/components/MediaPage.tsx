import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

interface Media {
  id: number;
  title: string;
  type: string;
  description?: string;
  image?: string;
}

export function MediaPage() {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.get("media/")
      .then((res) => {
        setMediaList(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  const filteredMedia =
    filter === "all"
      ? mediaList
      : mediaList.filter((m) => m.type === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">

      <h1 className="text-4xl font-bold text-white mb-8">
        Biblioteca de Medios
      </h1>

      {/* FILTROS */}
      <div className="flex flex-wrap gap-3 mb-8">

        <button
          onClick={() => setFilter("all")}
          className="px-4 py-2 rounded-lg bg-slate-700 text-white"
        >
          Todos
        </button>

        <button
          onClick={() => setFilter("anime")}
          className="px-4 py-2 rounded-lg bg-purple-700 text-white"
        >
          Anime
        </button>

        <button
          onClick={() => setFilter("music")}
          className="px-4 py-2 rounded-lg bg-pink-700 text-white"
        >
          Música
        </button>

        <button
          onClick={() => setFilter("game")}
          className="px-4 py-2 rounded-lg bg-blue-700 text-white"
        >
          Videojuegos
        </button>

      </div>

      {/* GRID DE POSTERS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">

        {filteredMedia.map((media) => {

          console.log("MEDIA:", media);

          return (
            <Link
              key={media.id}
              to={`/media/${media.id}`}
              className="group"
            >
            <div className="rounded-xl overflow-hidden bg-slate-800 border border-slate-700 hover:border-purple-500 transition-all">

              <div className="aspect-[2/3] overflow-hidden">

                <img
                  src={
                    media.image
                      ? `http://127.0.0.1:8000${media.image}`
                      : "/no-poster.png"
                  }
                  alt={media.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

              </div>

              <div className="p-3">

                <h2 className="text-white font-semibold line-clamp-2">
                  {media.title}
                </h2>

                <p className="text-slate-400 text-sm capitalize">
                  {media.type}
                </p>

              </div>

            </div>
          </Link>
          );
        })}

      </div>

    </div>
  );
}
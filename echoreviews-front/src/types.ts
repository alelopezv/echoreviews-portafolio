// Las formas que devuelve la API. Un tipo por respuesta, no por tabla:
// la misma obra viaja distinto según el endpoint que la sirva.

export type MediaType = "anime" | "music" | "game";
export type ModerationStatus = "pending" | "approved" | "rejected";

/** La obra ANIDADA dentro de una reseña (la arma ReviewSerializer.get_media). */
export interface Media {
  title: string;
  type: MediaType;
  description: string;
  image: string | null;
  crop: { x: number; y: number; width: number; height: number };
  pending: boolean;
}

/** /api/reviews/, /api/reviews/mine/ y /api/reviews/<id>/ */
export interface Review {
  id: number;
  title: string;
  content: string;
  rating: number;
  status: ModerationStatus;
  created_at: string;
  updated_at: string;
  media: Media | null;
  rejection_reason: string;
  hashtags: string[];
  username: string;
  full_name: string;
}

/** La obra del catálogo: /api/media/ y /api/media/<id>/ */
export interface CatalogMedia {
  id: number;
  title: string;
  type: MediaType;
  description: string;
  image: string | null;
  crop_x: number;
  crop_y: number;
  crop_width: number;
  crop_height: number;
  created_at: string;
  status: ModerationStatus;
}

/** El catálogo de etiquetas: /api/hashtags/ (solo devuelve las aprobadas). */
export interface Hashtag {
  id: number;
  name: string;
  created_at: string;
  status: ModerationStatus;
}

/** El usuario autenticado: /api/users/me/ */
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  date_joined: string;
}
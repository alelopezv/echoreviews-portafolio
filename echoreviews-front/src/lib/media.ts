import type { MediaType } from "../types";

/**
 * La forma de una portada depende de qué obra es.
 *
 * Un disco es cuadrado porque su portada lo es; un anime o un videojuego se
 * anuncian con un cartel vertical. Recortar un álbum a 2:3 le corta la mitad
 * de la tapa.
 *
 * Esta regla estaba escrita a mano en MediaPage, ReviewCard y MediaDetailPage,
 * y el recortador del formulario usaba 2:3 fijo para todo — o sea, ya había
 * empezado a desviarse. Vive acá para que exista una sola vez.
 */

/** Para el recortador (react-easy-crop pide un número: ancho / alto). */
export const RELACION_DE_ASPECTO: Record<MediaType, number> = {
  anime: 2 / 3,
  music: 1,
  game: 2 / 3,
};

/** Para mostrar (Tailwind pide una clase). */
export function claseDeAspecto(tipo?: MediaType) {
  return tipo === "music" ? "aspect-square" : "aspect-[2/3]";
}

/**
 * Los tipos de obra con su nombre en pantalla, para armar desplegables.
 *
 * El valor está tipado como MediaType, así que si algún día el backend
 * agrega una categoría y se actualiza la unión, esta lista falla al compilar
 * hasta que se complete. Un <option value="pelicula"> escrito a mano no
 * habría fallado nunca.
 */
export const TIPOS_DE_OBRA: { valor: MediaType; etiqueta: string }[] = [
  { valor: "anime", etiqueta: "Anime" },
  { valor: "music", etiqueta: "Música" },
  { valor: "game", etiqueta: "Videojuego" },
];

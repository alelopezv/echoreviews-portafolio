/** Reglas de presentación que valen para todo el sitio.
 *
 * El aire lateral estaba copiado en diecisiete contenedores y ya se había
 * bifurcado: cinco páginas usaban `px-4 sm:px-6 lg:px-8` y tres solo `px-4`,
 * así que en escritorio unas tenían 32 px de margen y otras 16. Es la misma
 * historia de `getCategoryColor`, de la interfaz `Media` y de la proporción de
 * las portadas: una regla repetida en muchos archivos siempre termina
 * desincronizándose.
 *
 * En móvil son 20 px y no 16: para un párrafo largo, 16 deja el texto pegado
 * a los bordes de la pantalla y cuesta leerlo.
 *
 * El ancho máximo NO va acá: cada página tiene el suyo —el catálogo es ancho,
 * una reseña es angosta— y eso sí es una decisión por página.
 */
export const AIRE_LATERAL = "px-5 sm:px-6 lg:px-8";

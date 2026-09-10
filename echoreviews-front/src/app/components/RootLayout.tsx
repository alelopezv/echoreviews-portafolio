import { Outlet, Link, useLocation, useNavigate, ScrollRestoration } from "react-router-dom"
import { Home, Hash, Pen, User, Search, Library } from "lucide-react";
import { useEffect, useState } from "react";
import { LoginModal } from "./LoginModal";
import api from "../../services/api";
import type { User as Usuario } from "../../types";

export function RootLayout() {
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("access"));
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [buscadorAbierto, setBuscadorAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const buscar = (e: React.FormEvent) => {
    // Sin esto el navegador recargaría la página entera al enviar el
    // formulario, que es lo que hace un <form> por defecto.
    e.preventDefault();

    const termino = busqueda.trim();
    if (!termino) return;

    // encodeURIComponent porque el término va dentro de la URL: sin él,
    // buscar "rock & roll" cortaría el parámetro en el & y el backend
    // recibiría solo "rock ".
    navigate(`/all-reviews?q=${encodeURIComponent(termino)}`);
    setBuscadorAbierto(false);
    setBusqueda("");
  };

  // Tener un token en localStorage dice que hay sesión, pero no de quién.
  // Eso solo lo sabe el servidor, así que se le pregunta cada vez que el
  // estado de sesión cambia: al cargar la página y al iniciar sesión.
  useEffect(() => {
    if (!isLoggedIn) {
      setUsuario(null);
      return;
    }

    api.get("users/me/")
      .then((res) => setUsuario(res.data))
      // Un token vencido o inválido no debería romper la barra de navegación:
      // se sigue sin saludo y el resto del sitio funciona igual.
      .catch(() => setUsuario(null));
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setIsLoggedIn(false);
    navigate("/", { replace: true });
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                EchoReviews
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive("/")
                    ? "bg-purple-500/20 text-purple-300"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Inicio</span>
              </Link>

              <Link
                to="/hashtags"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive("/hashtags")
                    ? "bg-purple-500/20 text-purple-300"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Hash className="w-4 h-4" />
                <span>Hashtags</span>
              </Link>

              <Link
                to="/media"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive("/media")
                    ? "bg-purple-500/20 text-purple-300"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Library className="w-4 h-4" />
                <span>Obras</span>
              </Link>

              {/* Escribir solo tiene sentido con sesión: sin ella, el formulario
                  no puede enviar nada porque la API exige token. Mostrarlo a un
                  visitante es invitarlo a un callejón sin salida. */}
              {isLoggedIn && (
                <Link
                  to="/write"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive("/write")
                      ? "bg-purple-500/20 text-purple-300"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <Pen className="w-4 h-4" />
                  <span>Escribir</span>
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-2">
              {/* La lupa llevaba a ninguna parte: era un <button> sin onClick,
                  heredado de la maqueta. Se iluminaba al pasar el mouse y no
                  hacía nada, que es peor que no estar. */}
              {buscadorAbierto ? (
                <form onSubmit={buscar} className="flex items-center gap-1">
                  <input
                    autoFocus
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setBuscadorAbierto(false);
                    }}
                    placeholder="Buscar reseñas…"
                    aria-label="Buscar reseñas"
                    className="w-32 sm:w-56 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    aria-label="Buscar"
                    className="p-2 rounded-lg text-purple-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setBuscadorAbierto(true)}
                  aria-label="Buscar reseñas"
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}

              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  {/* El saludo aparece recién cuando /users/me/ contesta, así
                      que no hay un "Hola, undefined" mientras carga. Se oculta
                      en pantallas chicas: ahí el espacio es para navegar. */}
                  {usuario && (
                    <span className="hidden lg:inline text-sm text-slate-400 mr-1">
                      Hola, <span className="text-purple-300">{usuario.full_name}</span>
                    </span>
                  )}
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden sm:inline">Perfil</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 rounded-lg text-red-400 hover:text-white hover:bg-red-500/20 transition-colors"
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">Ingresar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Cambiar de ruta no recarga el documento: React Router solo cambia qué
          componente se dibuja dentro del <Outlet />. El <html> sigue siendo el
          mismo elemento de hace un segundo, con su scroll donde estaba, así que
          abrir una reseña desde el final del listado te dejaba en mitad del
          texto en vez de en el título. En móvil se notaba mucho más, porque
          todo se apila en una columna y las páginas miden el triple de alto.

          Se usa este componente y no un window.scrollTo(0, 0) dentro de un
          useEffect porque hace las dos cosas: al navegar hacia adelante manda
          el scroll arriba, y al volver con el botón "atrás" devuelve la
          posición que tenías en esa página. La versión a mano solo hace lo
          primero, y de paso rompe lo segundo: bajabas veinte reseñas, entrabas
          a una, volvías, y habías perdido tu lugar. */}
      <ScrollRestoration />

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-slate-800/50 bg-slate-950/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white font-bold">E</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  EchoReviews
                </span>
              </Link>
              <p className="text-slate-400 text-sm max-w-sm">
                Plataforma independiente de crítica cultural enfocada en arte audiovisual de culto.
                Reseñas profundas de anime, música y videojuegos.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Explorar</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/" className="hover:text-purple-400 transition-colors">Inicio</Link></li>
                <li><Link to="/all-reviews" className="hover:text-purple-400 transition-colors">Todas las reseñas</Link></li>
                <li><Link to="/media" className="hover:text-purple-400 transition-colors">Obras</Link></li>
                <li><Link to="/hashtags" className="hover:text-purple-400 transition-colors">Hashtags</Link></li>
                {isLoggedIn && (
                  <li><Link to="/write" className="hover:text-purple-400 transition-colors">Escribir Reseña</Link></li>
                )}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Categorías</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                {/* Apuntan al catálogo filtrado por tipo de obra, no a
                    hashtags. Antes iban a /hashtag/anime, /hashtag/music y
                    /hashtag/games: etiquetas que solo existirían si alguien
                    las hubiera propuesto, y "games" ni siquiera es un valor
                    del modelo —es un resabio del vocabulario de la maqueta—,
                    así que los tres enlaces llevaban a páginas vacías. */}
                <li><Link to="/media?tipo=anime" className="hover:text-purple-400 transition-colors">Anime</Link></li>
                <li><Link to="/media?tipo=music" className="hover:text-pink-400 transition-colors">Música</Link></li>
                <li><Link to="/media?tipo=game" className="hover:text-blue-400 transition-colors">Videojuegos</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800/50 text-center text-sm text-slate-500">
            © 2026 EchoReviews. Plataforma de crítica cultural independiente.
          </div>
        </div>
      </footer>

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={() => setIsLoggedIn(true)}
        />
      )}
    </div>
  );
}

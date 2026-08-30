import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { Home, Hash, Pen, User, Search } from "lucide-react";
import { useState } from "react";
import { LoginModal } from "./LoginModal";

export function RootLayout() {
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("access"));
  const location = useLocation();
  const navigate = useNavigate();

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
            </nav>

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors">
                <Search className="w-5 h-5" />
              </button>

              {isLoggedIn ? (
                <div className="flex items-center gap-2">
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
                <li><Link to="/hashtags" className="hover:text-purple-400 transition-colors">Hashtags</Link></li>
                <li><Link to="/write" className="hover:text-purple-400 transition-colors">Escribir Reseña</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Categorías</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/hashtag/anime" className="hover:text-purple-400 transition-colors">Anime</Link></li>
                <li><Link to="/hashtag/music" className="hover:text-pink-400 transition-colors">Música</Link></li>
                <li><Link to="/hashtag/games" className="hover:text-blue-400 transition-colors">Videojuegos</Link></li>
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

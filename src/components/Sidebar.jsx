import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const menuItems = [
  { name: "Información general", path: "/" },
  { name: "Configuración", path: "/configuracion" },
  { name: "Historial", path: "/datos" },
];

function Sidebar({ open }) {
  const { user, login, logout, loading, error } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    await login(username, password);
    if (!error) {
      setShowLogin(false);
      setUsername("");
      setPassword("");
    }
  };

  return (
    <aside
      className={`
        bg-gray-700 text-gray-100
        transition-all duration-300
        ${open ? "w-64" : "w-20"}
        flex flex-col
        h-screen // Asegura altura completa
        overflow-y-auto // Scroll interno si es necesario
      `}
    >
      {/* Título */}
      <div className="h-14 flex items-center justify-center border-b border-gray-600 font-bold text-lg flex-shrink-0">
        {open ? "Monitor Web" : "MW"}
      </div>

      {/* Menú - Scrolleable */}
      <nav className="flex-1 py-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `
              flex items-center
              ${open ? "justify-start px-4" : "justify-center"}
              py-2 mx-2 rounded-lg transition
              ${
                isActive
                  ? "bg-cyan-600 text-white"
                  : "text-gray-300 hover:bg-gray-600"
              }
              `
            }
          >
            {open ? item.name : "•"}
          </NavLink>
        ))}

        {/* Sección de Autenticación */}
        <div className="border-t border-gray-600 my-4 pt-4">
          {user ? (
            <div className={`${open ? "px-4" : "px-2"} space-y-2`}>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-300">👤</span>
                {open && (
                  <span className="text-gray-200 truncate">
                    {user.username}
                  </span>
                )}
              </div>
              <button
                onClick={logout}
                className={`
                  flex items-center w-full
                  ${open ? "justify-start px-3" : "justify-center"}
                  py-2 rounded-lg text-sm
                  bg-red-400 hover:bg-red-500 text-white
                  transition-colors
                `}
              >
                {open ? "Cerrar Sesión" : "🚪"}
              </button>
            </div>
          ) : (
            <div className={`${open ? "px-4" : "px-2"} space-y-2`}>
              {!open ? (
                <button
                  onClick={() => setShowLogin(!showLogin)}
                  className="flex justify-center w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                >
                  🔐
                </button>
              ) : (
                <>
                  {!showLogin ? (
                    <button
                      onClick={() => setShowLogin(true)}
                      className="flex items-center justify-start px-3 w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                    >
                      <span className="mr-2">🔐</span>
                      Iniciar Sesión
                    </button>
                  ) : (
                    <div className="bg-gray-800 rounded-lg p-3 space-y-3">
                      <h3 className="text-sm font-semibold text-gray-200">
                        Iniciar Sesión
                      </h3>
                      
                      {error && (
                        <div className="bg-red-900/50 border border-red-400 text-red-200 px-3 py-2 rounded text-xs">
                          {error}
                        </div>
                      )}

                      <form onSubmit={handleLogin} className="space-y-3">
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Usuario"
                          className="w-full px-3 py-1.5 text-sm bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
                          required
                        />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Contraseña"
                          className="w-full px-3 py-1.5 text-sm bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
                          required
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-400 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50"
                          >
                            {loading ? "..." : "Ingresar"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowLogin(false);
                              setUsername("");
                              setPassword("");
                            }}
                            className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm"
                          >
                            ✕
                          </button>
                        </div>
                      </form>

                      <div className="text-xs text-gray-400 border-t border-gray-600 pt-2 mt-1">
                        <p className="font-semibold">Demo:</p>
                        <p>admin / admin123</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Footer - Fijo al final */}
      {open && (
        <div className="px-4 py-3 text-xs text-gray-400 border-t border-gray-600 flex-shrink-0">
          Horno y Vulcanizadora v1.0
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
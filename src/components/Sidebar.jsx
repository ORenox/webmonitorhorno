import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

const menuItems = [
  { name: "Información general", path: "/", icon: "📊" },
  { name: "Configuración", path: "/configuracion", icon: "⚙️" },
  { name: "Historial", path: "/datos", icon: "📈" },
];

function Sidebar({ open }) {
  const { user, login, logout, loading, error } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Limpiar formulario al cerrar
  useEffect(() => {
    if (!showLogin) {
      setUsername("");
      setPassword("");
    }
  }, [showLogin]);

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
        bg-gradient-to-b from-slate-900 to-slate-800
        text-gray-200
        transition-all duration-300 ease-in-out
        ${open ? "w-64" : "w-20"}
        flex flex-col
        h-screen
        overflow-hidden
        border-r border-cyan-500/30
        shadow-2xl
      `}
    >
      {/* ===== HEADER - LOGO HMI ===== */}
      <div className={`
        h-16 flex items-center justify-center border-b border-cyan-500/30
        bg-gradient-to-r from-slate-900 to-slate-800
        flex-shrink-0
        ${open ? "px-4" : "px-0"}
      `}>
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-white text-sm font-bold">HMI</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
          </div>
          {open && (
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 text-lg tracking-wider">
              SCADA
            </span>
          )}
        </div>
      </div>

      {/* ===== MENÚ PRINCIPAL ===== */}
      <nav className="flex-1 py-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `
              flex items-center
              ${open ? "justify-start mx-3 px-4" : "justify-center mx-2"}
              py-2.5 rounded-xl
              transition-all duration-200
              ${
                isActive
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20 border border-cyan-400/30"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-cyan-400 border border-transparent hover:border-cyan-500/30"
              }
              `
            }
          >
            <span className={open ? "mr-3 text-lg" : "text-xl"}>
              {item.icon}
            </span>
            {open && (
              <span className="font-medium tracking-wide">
                {item.name}
              </span>
            )}
            {!open && (
              <span className="absolute left-1/2 transform -translate-x-1/2 translate-y-6 text-xs bg-slate-800 text-cyan-400 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-cyan-500/30">
                {item.name}
              </span>
            )}
          </NavLink>
        ))}

        {/* ===== SEPARADOR ===== */}
        <div className={`
          ${open ? "mx-4" : "mx-3"}
          my-6
          border-t border-slate-700/50
          relative
        `}>
          {open && (
            <span className="absolute -top-2 left-4 bg-slate-800 px-2 text-xs text-slate-500">
              SEGURIDAD
            </span>
          )}
        </div>

        {/* ===== SECCIÓN DE AUTENTICACIÓN ===== */}
        <div className="space-y-2">
          {user ? (
            /* ===== USUARIO LOGUEADO ===== */
            <div className={`${open ? "mx-3" : "mx-2"} space-y-3`}>
              <div className={`
                flex items-center gap-3
                ${open ? "justify-start px-3" : "justify-center"}
                py-2.5
                bg-slate-800/80 rounded-xl
                border border-slate-700/50
                backdrop-blur-sm
              `}>
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">
                      {user.username?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-800"></div>
                </div>
                {open && (
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-slate-400">OPERADOR</span>
                    <p className="text-sm font-medium text-white truncate">
                      {user.username}
                    </p>
                  </div>
                )}
              </div>
              
              <button
                onClick={logout}
                className={`
                  flex items-center w-full
                  ${open ? "justify-start px-4" : "justify-center"}
                  py-2.5 rounded-xl
                  bg-red-500/10 hover:bg-red-500/20
                  text-red-400 hover:text-red-300
                  border border-red-500/30 hover:border-red-500/50
                  transition-all duration-200
                  group
                `}
              >
                <span className={open ? "mr-3" : ""}>⏻</span>
                {open ? "Cerrar Sesión" : (
                  <span className="absolute left-1/2 transform -translate-x-1/2 translate-y-6 text-xs bg-slate-800 text-red-400 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity border border-red-500/30">
                    Cerrar Sesión
                  </span>
                )}
              </button>
            </div>
          ) : (
            /* ===== USUARIO NO LOGUEADO ===== */
            <div className={`${open ? "mx-3" : "mx-2"} space-y-2`}>
              {!open ? (
                /* ===== SIDEBAR CERRADO - BOTÓN COMPACTO ===== */
                <button
                  onClick={() => setShowLogin(!showLogin)}
                  className="relative flex justify-center w-full py-2.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 hover:border-cyan-500/50 transition-all duration-200 group"
                >
                  <span className="text-xl">🔐</span>
                  <span className="absolute left-1/2 transform -translate-x-1/2 translate-y-8 text-xs bg-slate-800 text-cyan-400 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity border border-cyan-500/30 whitespace-nowrap">
                    Iniciar Sesión
                  </span>
                </button>
              ) : (
                /* ===== SIDEBAR ABIERTO - FORMULARIO COMPLETO ===== */
                <>
                  {!showLogin ? (
                    <button
                      onClick={() => setShowLogin(true)}
                      className="flex items-center justify-start px-4 w-full py-2.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 hover:border-cyan-500/50 transition-all duration-200 group"
                    >
                      <span className="mr-3 text-lg">🔐</span>
                      <span className="font-medium">Iniciar Sesión</span>
                    </button>
                  ) : (
                    <div className="bg-slate-800/90 rounded-xl p-4 border border-cyan-500/30 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                          <span>🔐</span>
                          Acceso al Sistema
                        </h3>
                        <button
                          onClick={() => setShowLogin(false)}
                          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                      
                      {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg text-xs mb-3 flex items-center gap-2">
                          <span>⚠️</span>
                          <span>{error}</span>
                        </div>
                      )}

                      <form onSubmit={handleLogin} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-400">USUARIO</label>
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Ingrese usuario"
                            className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 text-white placeholder-slate-500 transition-all"
                            required
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-xs text-slate-400">CONTRASEÑA</label>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Ingrese contraseña"
                            className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 text-white placeholder-slate-500 transition-all"
                            required
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {loading ? (
                              <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                <span>INGRESANDO</span>
                              </>
                            ) : (
                              <>
                                <span>🔐</span>
                                <span>INGRESAR</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>

                      <div className="mt-4 pt-3 border-t border-slate-700/50">
                        <p className="text-xs text-slate-500 font-mono mb-1">CREDENCIALES DEMO:</p>
                        <div className="bg-slate-900/80 rounded-lg p-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-cyan-400">admin</span>
                            <span className="text-slate-400">/</span>
                            <span className="text-slate-400">admin123</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* ===== FOOTER - VERSIÓN DEL SISTEMA ===== */}
      {open && (
        <div className="px-4 py-4 text-xs text-slate-500 border-t border-cyan-500/20 flex-shrink-0 bg-gradient-to-r from-slate-900 to-slate-800">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
              <span className="font-mono">HMI v2.1.0-industrial</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
              <span className="font-mono text-slate-600">Horno & Vulcanizadora</span>
            </div>
            <div className="mt-1 text-[10px] text-slate-600">
              © 2026 · ESPE Mecatrónica
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
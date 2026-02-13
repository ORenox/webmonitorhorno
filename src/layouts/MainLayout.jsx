import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';

function MainLayout({ children }) {
  const [open, setOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Actualizar hora cada segundo
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      
      {/* ===== SIDEBAR - FIJO ===== */}
      <div className="h-screen overflow-hidden">
        <Sidebar open={open} />
      </div>

      {/* ===== CONTENIDO PRINCIPAL ===== */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* ===== HEADER HMI INDUSTRIAL ===== */}
        <header className="h-16 bg-slate-900/95 backdrop-blur-md border-b border-cyan-500/30 shadow-2xl flex items-center justify-between px-4 flex-shrink-0">
          
          {/* LADO IZQUIERDO - Menú y título */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setOpen(!open)}
              className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 flex items-center justify-center transition-all duration-200 border border-slate-700 hover:border-cyan-500/50"
            >
              <span className="text-xl">☰</span>
            </button>
            
            <div className="flex items-center gap-3">
              
              <div>
                <h1 className="text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 tracking-wider">
                  PANEL DE CONTROL
                </h1>
                
              </div>
            </div>
          </div>

          {/* LADO DERECHO - Usuario y estado */}
          <div className="flex items-center gap-4">
            
            {/* Indicador de sistema - visible solo en desktop */}
            <div className="hidden lg:flex items-center gap-3 mr-2">
              
              <span className="text-xs text-slate-500 font-mono">
                {currentTime.toLocaleTimeString('es-EC')}
              </span>
            </div>

            {/* Usuario industrial */}
            {user && (
              <div className="flex items-center gap-3 bg-slate-800/80 pl-3 pr-1 py-1 rounded-full border border-slate-700 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <span className="text-white font-bold text-xs">
                      {user.username?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="hidden md:block">
                    <span className="text-xs text-slate-400">OPERADOR</span>
                    <span className="text-slate-200 font-medium block text-xs">
                      {user.username}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-3 py-1 rounded-full text-xs transition-all border border-red-500/30 hover:border-red-500/50 ml-1 flex items-center gap-1"
                >
                  <span>⏻</span>
                  <span className="hidden md:inline">SALIR</span>
                </button>
              </div>
            )}

            {/* Botón de usuario anónimo (si no hay user) */}
            {!user && (
              <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <span className="text-xs text-slate-400">SIN SESIÓN</span>
              </div>
            )}
          </div>
        </header>

        {/* ===== MAIN - CONTENIDO SCROLLEABLE ===== */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="p-6">
            {children}
          </div>
        </main>

        {/* ===== FOOTER - BARRA DE ESTADO (opcional) ===== */}
        <div className="h-6 bg-slate-900/90 border-t border-cyan-500/20 flex items-center px-4 text-xs text-slate-500 font-mono">
          <div className="flex justify-between w-full">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              SISTEMA OPERATIVO · v2.1.0-industrial
            </span>
            <span className="hidden md:block">
              © 2026 · ESPE - INGENIERÍA MECATRÓNICA
            </span>
            <span className="flex items-center gap-1">
              <span className="text-cyan-400">⚡</span>
              {currentTime.toLocaleTimeString('es-EC')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
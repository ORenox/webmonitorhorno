import ConfiguracionPLC from "../components/ConfiguracionPLC";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';

function Configuracion() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        
        {/* ===== HEADER HMI INDUSTRIAL ===== */}
        <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-cyan-500/30 px-6 py-4 shadow-2xl">
          <div className="container mx-auto">
            
            {/* Línea superior con título y usuario */}
            <div className="flex justify-between items-center">
              {/* Logo y título */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <span className="text-white text-lg font-bold">⚙️</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 tracking-wider">
                    CONFIGURACIÓN PLC
                  </h1>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-cyan-400/70 font-mono">PANEL DE CONTROL</span>
                    <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full">
                      MODO ESCRITURA
                    </span>
                  </div>
                </div>
              </div>

              
            </div>

            {/* Barra de estado inferior */}
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-800 text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                PLC: CONECTADO
              </span>
              <span className="flex items-center gap-2">
                ⏱️ {new Date().toLocaleTimeString('es-EC')}
              </span>
              <span className="text-cyan-400/70 hidden md:block">
                v2.1.0-industrial
              </span>
            </div>
          </div>
        </div>

        {/* ===== CONTENIDO PRINCIPAL ===== */}
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb de navegación */}
          <div className="flex items-center gap-2 text-sm mb-6 text-slate-400">
            <span className="text-cyan-400">🏠</span>
            <span>/</span>
            <span className="text-slate-300">Panel de Control</span>
            <span>/</span>
            <span className="text-cyan-400 font-semibold">Configuración PLC</span>
          </div>

          {/* Componente de configuración PLC */}
          <ConfiguracionPLC />
          
          {/* Footer de página */}
          <div className="mt-8 text-center text-xs text-slate-600 border-t border-slate-800/50 pt-6">
            <p>© 2026 · Sistema de Control HMI · Universidad de las Fuerzas Armadas ESPE</p>
            <p className="text-slate-700 mt-1">Trabajo de Titulación - Ingeniería Mecatrónica</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default Configuracion;
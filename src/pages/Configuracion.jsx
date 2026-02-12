import ConfiguracionPLC from "../components/ConfiguracionPLC";
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
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Estado de los tags</h1>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                Bienvenido, {user.username}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
        <ConfiguracionPLC />
      </div>
    </ProtectedRoute>
  );
}

export default Configuracion;
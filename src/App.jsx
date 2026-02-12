import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Configuracion from "./pages/Configuracion";
import Datos from "./pages/Datos";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/configuracion" element={<Configuracion />} />
            <Route path="/datos" element={<Datos />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
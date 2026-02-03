
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Tags from "./pages/Tags";
import Datos from "./pages/Datos";


function App() {

  return (
    <>
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tags" element={<Tags />} />
            <Route path="/datos" element={<Datos />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </>
  )
}

export default App

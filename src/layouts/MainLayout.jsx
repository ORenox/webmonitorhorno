import Sidebar from "../components/Sidebar";
import { useState } from "react";

function MainLayout({ children }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Sidebar - Siempre fijo */}
      <div className="h-screen overflow-hidden">
        <Sidebar open={open} />
      </div>

      {/* Contenido principal - Scrolleable */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header - Fijo */}
        <header className="h-14 bg-white shadow flex items-center px-4 flex-shrink-0">
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-md hover:bg-gray-200"
          >
            ☰
          </button>
          <h1 className="ml-4 font-semibold">
            Panel de Control
          </h1>
        </header>

        {/* Main - Scrolleable */}
        <main className="flex-1 overflow-y-auto p-0">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
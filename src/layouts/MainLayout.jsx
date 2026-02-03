import Sidebar from "../components/sidebar";
import { useState } from "react";

function MainLayout({ children }) {
    const [open, setOpen] = useState(false);
  return (
     <div className="flex min-h-screen">
      
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 
        ${open ? "w-64" : "w-0"} overflow-hidden`}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 bg-slate-100">
        
        {/* Top bar */}
        <header className="h-14 bg-white shadow flex items-center px-4">
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-md hover:bg-gray-200"
          >
            ☰
          </button>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
import Sidebar from "../components/Sidebar";
import { useState } from "react";

function MainLayout({ children }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-slate-100">

      <Sidebar open={open} />

      <div className="flex-1 flex flex-col">

        <header className="h-14 bg-white shadow flex items-center px-4">
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

        <main className="flex-1 p-6">
          {children}
        </main>

      </div>
    </div>
  );
}

export default MainLayout;

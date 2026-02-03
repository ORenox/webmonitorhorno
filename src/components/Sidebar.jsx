import { NavLink } from "react-router-dom";

const menuItems = [
  { name: "Información general", path: "/" },
  { name: "Estado de los tags", path: "/tags" },
  { name: "Historial de datos", path: "/datos" },
];

function Sidebar() {
  return (
    <aside className="w-64 h-full bg-gray-900 text-gray-100 flex flex-col">
      
      {/* Título */}
      <div className="px-6 py-4 text-xl font-bold border-b border-gray-700">
        Monitor web
      </div>

      {/* Menú */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition 
               ${isActive 
                 ? "bg-cyan-600 text-white" 
                 : "text-gray-300 hover:bg-gray-800"}`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 text-sm text-gray-400 border-t border-gray-700">
        Horno y Vulcanizadora Industrial v1.0
      </div>
    </aside>
  );
}

export default Sidebar;
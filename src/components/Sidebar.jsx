import { NavLink } from "react-router-dom";

const menuItems = [
  { name: "Información general", path: "/" },
  { name: "Configuración", path: "/configuracion" },
  { name: "Historial", path: "/datos" },
];

function Sidebar({ open }) {
  return (
    <aside
      className={`
        bg-gray-700 text-gray-100
        transition-all duration-300
        ${open ? "w-64" : "w-20"}
        flex flex-col
      `}
    >
      {/* Título */}
      <div className="h-14 flex items-center justify-center border-b border-gray-600 font-bold text-lg">
        {open ? "Monitor Web" : "MW"}
      </div>

      {/* Menú */}
      <nav className="flex-1 py-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `
              flex items-center
              ${open ? "justify-start px-4" : "justify-center"}
              py-2 mx-2 rounded-lg transition
              ${
                isActive
                  ? "bg-cyan-600 text-white"
                  : "text-gray-300 hover:bg-gray-600"
              }
              `
            }
          >
            {open ? item.name : "•"}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {open && (
        <div className="px-4 py-3 text-xs text-gray-400 border-t border-gray-600">
          Horno y Vulcanizadora v1.0
        </div>
      )}
    </aside>
  );
}

export default Sidebar;

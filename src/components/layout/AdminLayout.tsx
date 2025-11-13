import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "@/assets/logo.png";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderTree,
  User,
} from "lucide-react";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/products", label: "Productos", icon: Package },
    { path: "/admin/orders", label: "Pedidos", icon: ShoppingCart },
    { path: "/admin/categories", label: "Categorías", icon: FolderTree },
    { path: "/admin/users", label: "Usuarios", icon: User },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-luxury-gray flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white fixed h-screen shadow-sm">
        <div className="p-8 border-b border-gray-200">
          <div className="h-24 flex items-center justify-center">
            <img
              src={Logo}
              alt="logo Alma"
              className="h-24 object-contain mx-auto pointer-events-auto transition-all"
            />
          </div>
        </div>

        <nav className="p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 mb-1 text-sm tracking-wider transition-colors ${
                  isActive(item.path)
                    ? "bg-[#314737] text-white shadow-sm"
                    : "text-luxury-text hover:bg-luxury-gray/60"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer button */}
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-3 px-4 py-3 text-sm tracking-wider text-luxury-text hover:bg-luxury-gray/60 transition-colors w-full"
          >
            <User size={18} />
            Volver al perfil
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

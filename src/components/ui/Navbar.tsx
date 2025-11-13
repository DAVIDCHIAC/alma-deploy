import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { ShoppingBag, Menu, X, User as UserIcon, LogOut } from "lucide-react";
import Logo from "@/assets/logo.png";
import { useCart } from "@/context/CartContext";
import { LoginSidebar } from "./LoginSidebar";

type ThemeType = "default" | "transparent" | "negative";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { totalItems } = useCart();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [theme, setTheme] = useState<ThemeType>("default");
  const [authUser, setAuthUser] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const API_BASE = (import.meta as any).env?.VITE_API_BASE || "http://localhost:8000";

  const location = useLocation();
  const navRef = useRef<HTMLElement | null>(null);

  const detectTheme = useCallback(() => {
    if (!navRef.current) return;
    const navRect = navRef.current.getBoundingClientRect();
    let detected: ThemeType = "default";

    const elements = document.querySelectorAll<HTMLElement>(".transparent, .negative");
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom > navRect.top && rect.top < navRect.bottom) {
        if (el.classList.contains("transparent")) detected = "transparent";
        else if (el.classList.contains("negative")) detected = "negative";
      }
    });

    setTheme(detected);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY <= 20 || currentScrollY < lastScrollY);
      setLastScrollY(currentScrollY);
      detectTheme();
    };

    window.addEventListener("scroll", handleScroll);
    detectTheme();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, detectTheme]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("auth_user");
      if (raw) setAuthUser(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (!isLoginOpen) {
      try {
        const raw = localStorage.getItem("auth_user");
        if (raw) setAuthUser(JSON.parse(raw));
      } catch {}
    }
  }, [isLoginOpen]);

  useEffect(() => {
    detectTheme();
  }, [location.pathname, detectTheme]);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (token) {
        await fetch(`${API_BASE}/api/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {}
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setAuthUser(null);
    setIsProfileOpen(false);
  };

  const navStyles: Record<ThemeType, string> = {
    default: "bg-white text-luxury-text",
    transparent: "bg-transparent text-white",
    negative: "bg-black text-white",
  };

  const hoverColors: Record<ThemeType, string> = {
    default: "hover:text-luxury-burgundy",
    transparent: "hover:text-luxury-burgundy",
    negative: "hover:text-luxury-burgundy",
  };

  const activeColors: Record<ThemeType, string> = {
    default: "text-luxury-burgundy after:w-full after:bg-luxury-burgundy",
    transparent: "text-luxury-burgundy after:w-full after:bg-luxury-burgundy",
    negative: "text-luxury-burgundy after:w-full after:bg-luxury-burgundy",
  };

  const logoStyles = theme === "default" ? "invert-0" : "invert";

  const navLinks = [
    { to: "/", label: "INICIO" },
    { to: "/products", label: "PRODUCTOS" },
    { to: "/about", label: "NOSOTROS" },
    { to: "/contact", label: "CONTACTO" },
  ];

  return (
    <>
    <nav
      ref={navRef}
      className={`fixed inset-x-0 top-0 z-50 transition-transform duration-700 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-[200%]"
      } ${navStyles[theme]}`}
    >
      <div className="max-w-[1400px] mx-auto px-6 flex flex-col items-center">
        <div className="relative w-full flex items-center justify-center h-24">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`absolute left-0 md:hidden bg-transparent border-0 cursor-pointer text-2xl`}
            aria-label="Abrir menú"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex justify-center items-center pointer-events-none">
            <img
              src={Logo}
              alt="logo Alma"
              className={`h-24 object-contain mx-auto pointer-events-auto transition-all ${logoStyles}`}
            />
          </Link>

          {/* Icons */}
          <div className="absolute right-0 flex items-center gap-6">
            <Link
              to="/cart"
              className={`no-underline transition-colors relative ${hoverColors[theme]}`}
            >
              <ShoppingBag size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-luxury-burgundy bg-[#314737] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {authUser ? (
              <div className="relative group">
                <button
                  onClick={() => setIsProfileOpen((v) => !v)}
                  className="relative flex items-center gap-2.5 px-4 py-2.5 bg-transparent transition-all duration-300 hover:text-white overflow-hidden group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#314737] flex items-center justify-center text-white text-xs font-medium ring-2 ring-white/0 transition-transform duration-300 group-hover:scale-110">
                    {authUser?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div 
                  className={`absolute right-0 mt-3 w-64 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-top-right z-10000 ${
                    isProfileOpen 
                      ? 'opacity-100 scale-100 translate-y-0' 
                      : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                  }`}
                >
                  <div className="bg-[#314737] p-4 text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-xl font-medium ring-2 ring-white/30">
                        {authUser?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{authUser?.name ?? "Usuario"}</p>
                        <p className="text-xs text-white/80 truncate">{authUser?.email ?? ""}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Opciones del menú */}
                  <div className="py-2">
                    <Link 
                      to="/profile" 
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200 group/item"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center group-hover/item:bg-[#314737] group-hover/item:text-white transition-colors">
                        <UserIcon size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Mi Perfil</p>
                        <p className="text-xs text-gray-500">Ver y editar información</p>
                      </div>
                    </Link>
                    
                    <div className="h-px bg-gray-100 mx-4 my-2" />
                    
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200 group/item"
                    >
                      <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center group-hover/item:bg-red-100 transition-colors">
                        <LogOut size={18} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">Cerrar Sesión</p>
                        <p className="text-xs text-red-400">Salir de tu cuenta</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="bg-[#314737] text-white border-0 px-2 py-2 text-sm tracking-[0.12em] cursor-pointer transition-all font-light hover:bg-[#314737/90] hover:-translate-y-0.5"
              >
                <span>Inicia Sesión</span>
              </button>
            )}
          </div>
        </div>

        <div
          className={`${
            isMenuOpen ? "flex" : "hidden"
          } md:flex flex-col md:flex-row gap-4 md:gap-12 justify-center items-center text-sm tracking-[0.06em] pb-4 w-full md:w-auto`}
        >
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to || location.pathname.startsWith(link.to + "/");
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`no-underline relative transition-all after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full ${
                  isActive ? activeColors[theme] : ""
                } ${hoverColors[theme]}`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

    </nav>
    <LoginSidebar isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
};

export default Navbar;

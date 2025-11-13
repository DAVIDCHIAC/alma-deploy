import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

export const NotFoundView = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen pt-20 bg-white flex items-center justify-center">
      <div className="text-center p-8">
        <h1 className="text-6xl md:text-7xl font-extralight tracking-widest mb-6 text-black">404</h1>
        <p className="text-base md:text-lg font-light tracking-wide mb-8 text-black/60">Página no encontrada</p>
        <Link to="/">
          <button className="bg-[#314737] text-white border-0 px-8 py-3 text-sm tracking-wide cursor-pointer transition-all font-light hover:bg-[#314737] hover:opacity-90 hover:-translate-y-0.5">
            VOLVER AL INICIO
          </button>
        </Link>
      </div>
    </div>
  );
};


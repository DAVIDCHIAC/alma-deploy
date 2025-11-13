import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-black/5 text-black">
      <div className=" mx-auto px-8 py-10 grid md:grid-cols-2 gap-10 border-b border-black/10">
        <div>
          <p className="uppercase text-xs tracking-[0.15em] mb-3">Suscribirse a nuestra newsletter</p>
          <div className="flex max-w-sm border border-black/20">
            <input
              type="email"
              placeholder="Correo electrónico"
              className="flex-1 px-4 py-2 outline-none text-sm bg-transparent"
            />
            <button className="bg-[#314737] text-white px-4 text-sm">
              →
            </button>
          </div>
        </div>

        {/* Redes sociales */}
        <div className="flex flex-col md:items-end">
          <p className="uppercase text-xs tracking-[0.15em] mb-3">Síganos</p>
          <div className="flex gap-5 text-gray-600">
            <a href="#" className="hover:text-black">
              <Instagram size={18} />
            </a>
            <a href="#" className="hover:text-black">
              <Facebook size={18} />
            </a>
            <a href="#" className="hover:text-black">
              <Youtube size={18} />
            </a>
            {/* <a href="#" className="hover:text-black">
              <Tiktok size={18} />
            </a> */}
          </div>
        </div>
      </div>

      {/* Enlaces principales */}
      <div className="max-w-[1400px] mx-auto px-8 py-16 grid md:grid-cols-5 gap-10 text-sm">
        <div>
          <p className="uppercase text-xs tracking-[0.15em] mb-4">La colección</p>
          <ul className="flex flex-col gap-2">
            <li><Link to="/products" className="hover:text-black">Nuevos lanzamientos</Link></li>
            <li><Link to="/products" className="hover:text-black">Más vendidos</Link></li>
            <li><Link to="/products" className="hover:text-black">Colecciones destacadas</Link></li>
          </ul>
        </div>

        <div>
          <p className="uppercase text-xs tracking-[0.15em] mb-4">Encuentre su producto</p>
          <ul className="flex flex-col gap-2">
            <li><Link to="/category/hombre" className="hover:text-black">Para hombre</Link></li>
            <li><Link to="/category/mujer" className="hover:text-black">Para mujer</Link></li>
            <li><Link to="/category/accesorios" className="hover:text-black">Accesorios</Link></li>
          </ul>
        </div>

        <div>
          <p className="uppercase text-xs tracking-[0.15em] mb-4">Atención al cliente</p>
          <ul className="flex flex-col gap-2">
            <li><Link to="/faq" className="hover:text-black">Preguntas frecuentes</Link></li>
            <li><Link to="/shipping" className="hover:text-black">Envíos y devoluciones</Link></li>
            <li><Link to="/contact" className="hover:text-black">Contáctenos</Link></li>
          </ul>
        </div>

        <div>
          <p className="uppercase text-xs tracking-[0.15em] mb-4">Nuestra marca</p>
          <ul className="flex flex-col gap-2">
            <li><Link to="/about" className="hover:text-black">Sobre nosotros</Link></li>
            <li><Link to="/sustainability" className="hover:text-black">Sostenibilidad</Link></li>
            <li><Link to="/stores" className="hover:text-black">Nuestras tiendas</Link></li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <p className="uppercase text-xs tracking-[0.15em] mb-2">Más</p>
          <ul className="flex flex-col gap-2">
            <li><Link to="/jobs" className="hover:text-black">Trabaja con nosotros</Link></li>
            <li><Link to="/press" className="hover:text-black">Sala de prensa</Link></li>
          </ul>
          <Link
            to="/contact"
            className="mt-4 border border-black/20 text-center py-2 text-xs tracking-[0.15em] uppercase hover:border-black hover:text-black transition-colors"
          >
            Contacte con nosotros
          </Link>
        </div>
      </div>

      {/* Pie de página */}
      <div className="w-full border-t border-black/10 py-6">
        <p className="text-center text-xs text-gray-500 tracking-[0.05em]">
          © {new Date().getFullYear()} Alma. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

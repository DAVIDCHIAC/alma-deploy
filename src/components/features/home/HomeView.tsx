import { Link } from "react-router-dom";
import bgOne from "@/assets/bg-one.jpg";
import bgTwo from "@/assets/bg-two.jpg";
import ProductList from "../products/ProductList";

export const HomeView = () => {

  return (
    <div className="bg-white">
      <section
        className="transparent relative h-screen flex items-center justify-center bg-fixed bg-center bg-cover"
        style={{ backgroundImage: `url(${bgOne})` }}
      >
        <div className="absolute bottom-8 inset-x-0 z-10 px-8">
          <div className="max-w-7xl mx-auto flex justify-center lg:justify-end">
            <div className="text-white text-center lg:text-right">
              <h1 className="text-4xl md:text-5xl font-extralight tracking-widest mb-8 uppercase">
                Accesorios que realzan tu esencia
              </h1>
              <p className="text-base md:text-lg font-light tracking-wide mb-12 opacity-95">
                Bisutería moderna en acero inoxidable: elegancia, calidad y autenticidad
              </p>
              <Link to="/products">
                <button className="bg-[#314737] text-white border-0 px-12 py-4 text-sm tracking-wide cursor-pointer transition-all font-light hover:bg-[#314737] hover:opacity-90 hover:-translate-y-0.5">
                  EXPLORAR COLECCIÓN
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        className="transparent relative min-h-screen overflow-hidden flex items-center bg-fixed bg-center bg-cover"
        style={{ backgroundImage: `url(${bgTwo})` }}
      >
      <div className="absolute inset-0 bg-black/70"></div>
        <div className="absolute bottom-8 inset-x-0 z-10 px-8">
          <div className="max-w-7xl mx-auto flex justify-center lg:justify-start">
            <div className="text-white text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl font-extralight tracking-widest mb-8">
                CALIDAD Y ESTILO
              </h2>
              <p className="text-base md:text-lg font-light tracking-wide leading-8 max-w-xl opacity-95">
                Accesorios en acero inoxidable, hipoalergénicos y duraderos, con acabados en oro 18k y plata.
                Elegancia y autenticidad a precios accesibles.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-8 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extralight tracking-wider text-center mb-20 text-black">
          COLECCIONES DESTACADAS
        </h2>
        <div className="max-w-4xl mx-auto">
          <ProductList limit={6} showViewAll />
        </div>
      </section>
    </div>
  );
};

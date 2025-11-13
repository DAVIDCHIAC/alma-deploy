import bgTwo from "@/assets/bg-two.jpg";

export const AboutView = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section
        className="h-[60vh] transparent relative overflow-hidden flex items-center justify-center bg-center bg-cover"
        style={{ backgroundImage: `url(${bgTwo})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white px-8">
          <h1 className="text-4xl md:text-5xl font-extralight tracking-widest uppercase">
            Sobre Nosotros
          </h1>
        </div>
      </section>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-8 py-20">
        <div className="space-y-12 text-luxury-text">
          {/* Sobre Nosotros */}
          <section>
            <h2 className="text-3xl md:text-4xl font-extralight tracking-wider mb-6">Sobre Nosotros</h2>
            <p className="text-base md:text-lg font-light tracking-wide leading-relaxed text-muted-foreground">
              ALMA Accesorios es una tienda especializada en complementos de bisutería
              ubicada en Bucaramanga (Santander), Colombia. Nos dedicamos a brindar piezas
              modernas y elegantes que realzan la belleza y autenticidad de cada persona,
              siguiendo un estilo fresco y accesible. Nuestro equipo fusiona las últimas
              tendencias con un toque personal, asegurando que cada accesorio refleje la esencia
              individual de quien lo lleva.
            </p>
          </section>

          {/* Nuestra Historia */}
          <section>
            <h2 className="text-3xl md:text-4xl font-extralight tracking-wider mb-6">Nuestra Historia</h2>
            <p className="text-base md:text-lg font-light tracking-wide leading-relaxed text-muted-foreground">
              Nacimos del amor por los accesorios que cuentan historias, con la visión de que
              cada pieza aporte un toque especial a la vida cotidiana. Desde nuestros inicios,
              hemos trabajado con dedicación en curar una colección de bisutería que celebre la
              belleza única de nuestros clientes, adaptándonos siempre a sus gustos y necesidades.
            </p>
          </section>

          {/* Nuestros Productos */}
          <section>
            <h2 className="text-3xl md:text-4xl font-extralight tracking-wider mb-6">Nuestros Productos</h2>
            <p className="text-base md:text-lg font-light tracking-wide leading-relaxed text-muted-foreground mb-4">
              En ALMA encontrarás una amplia variedad de accesorios: aretes, collares, pulseras,
              anillos y más. Nuestras piezas están elaboradas principalmente en acero inoxidable,
              un material reconocido por su durabilidad y resistencia al desgaste diario.
              Esto significa que tus accesorios mantienen su aspecto original por más tiempo,
              incluso con uso constante. Además, el acero inoxidable es hipoalergénico, lo que
              lo hace ideal para pieles sensibles y garantiza mayor comodidad. Ofrecemos acabados
              sofisticados como baños de oro 18k, plata y laminados de oro sobre estas bases
              metálicas, aprovechando la versatilidad estética del material. De este modo
              combinamos elegancia y calidad a precios accesibles.
            </p>
          </section>

          {/* Estilo y Valores */}
          <section>
            <h2 className="text-3xl md:text-4xl font-extralight tracking-wider mb-6">Estilo y Valores</h2>
            <p className="text-base md:text-lg font-light tracking-wide leading-relaxed text-muted-foreground">
              Creemos que los accesorios no solo complementan un atuendo, sino que también expresan
              la personalidad de quien los usa. Por ello, nuestra misión es ofrecer productos de
              alta calidad que empoderen a nuestros clientes y resalten su autenticidad y estilo
              personal. Inspirados en las últimas tendencias, fusionamos lo moderno con un toque
              personal y auténtico, para que cada artículo de ALMA Accesorios sea distintivo.
              Valoramos especialmente la atención cercana y el servicio amigable: nuestro equipo
              está siempre dispuesto a guiarte y ayudarte en tu elección.
            </p>
          </section>

          {/* Diferenciadores */}
          <section className="border-t border-border pt-12">
            <h2 className="text-3xl md:text-4xl font-extralight tracking-wider mb-6">Diferenciadores</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl mb-2 text-black">Diseño único y actual</h3>
                <p className="text-muted-foreground">
                  Fusionamos tendencias contemporáneas con detalles personales para crear accesorios con
                  personalidad.
                </p>
              </div>
              <div>
                <h3 className="text-xl mb-2 text-black">Materiales de calidad</h3>
                <p className="text-muted-foreground">
                  Usamos acero inoxidable (resistente al uso diario) y ofrecemos acabados en oro 18k,
                  plata y otros, para garantizar durabilidad y estilo.
                </p>
              </div>
              <div>
                <h3 className="text-xl mb-2 text-black">Precios accesibles</h3>
                <p className="text-muted-foreground">
                  Aprovechamos la economía del acero inoxidable para ofrecer joyería elegante a precios
                  competitivos.
                </p>
              </div>
              <div>
                <h3 className="text-xl mb-2 text-black">Atención personalizada</h3>
                <p className="text-muted-foreground">
                  Brindamos asesoría cercana y realizamos envíos a todo el país para atender a clientes
                  locales y online por igual.
                </p>
              </div>
            </div>
          </section>

          {/* Cierre */}
          <section>
            <p className="text-base md:text-lg font-light tracking-wide leading-relaxed text-muted-foreground">
              Nos enorgullece ser una marca comprometida con la calidad, el estilo y la satisfacción
              de nuestros clientes. Te invitamos a conocer ALMA Accesorios, ya sea visitando nuestra
              tienda en Bucaramanga o explorando nuestro catálogo en línea, y a encontrar ese
              complemento perfecto que refleje tu propia esencia.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
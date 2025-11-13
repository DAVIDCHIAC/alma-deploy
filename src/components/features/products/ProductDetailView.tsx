import { useParams, Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { addToast } from "@heroui/react";
import { NotFoundView } from "@/components/features/common";
import { useEffect, useMemo, useState } from "react";

type AdminProduct = {
  id: number;
  sku?: string;
  name: string;
  category: string;
  price_label?: string;
  price_number?: number | string;
  description?: string;
  specifications?: string[];
  images?: string[];
  image?: string | null;
};

export const ProductDetailView = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(false);
  
  const API_BASE = (import.meta as any).env?.VITE_API_BASE;

  const resolveImageUrl = (img?: string | null) => {
    if (!img) return "/placeholder.svg";
    if (/^https?:\/\//i.test(img)) return img;
    return `${API_BASE}/storage/${img}`;
  };

  useEffect(() => {
    const fetchOne = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/products`, { headers: { Accept: "application/json" } });
        const data = await res.json();
        const arr: AdminProduct[] = Array.isArray(data) ? data : [];
        const numeric = Number(id);
        const found = arr.find((p) => (p.sku ? String(p.sku) === String(id) : false) || (!Number.isNaN(numeric) && p.id === numeric)) || null;
        setProduct(found);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOne();
  }, [id]);

  const priceNumber = useMemo(() => {
    if (!product) return 0;
    const n = product.price_number;
    if (typeof n === "number" && !Number.isNaN(n)) return n;
    if (typeof n === "string" && n.trim() !== "") return Number(n);
    const label = product.price_label ?? "";
    return Number(String(label).replace(/[^\d]/g, ""));
  }, [product]);

  const mainImage = useMemo(() => {
    if (!product) return "/placeholder.svg";
    const img = (Array.isArray(product.images) && product.images.length ? product.images[0] : product.image) || null;
    return resolveImageUrl(img);
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      collection: product.category,
      price: product.price_label ?? String(priceNumber),
      priceNumber: priceNumber,
      image: mainImage,
      description: product.description ?? "",
      specifications: Array.isArray(product.specifications) ? product.specifications : [],
    });
    addToast({ title: "Producto agregado", description: "El producto fue agregado al carrito", timeout: 3000 });
  };

  if (!loading && !product) return <NotFoundView />;

  if (!product) return (
    <div className="min-h-screen pt-20" />
  );

  return (
    <div className="min-h-screen pt-20">
      <section className="max-w-[1200px] max-x-5xl mx-auto px-8 py-16">
        <div className="flex gap-4 items-center mb-12 text-sm font-light tracking-[0.06em] text-[hsl(var(--luxury-text-light))]">
          <Link to="/" className="no-underline text-inherit">Inicio</Link>
          <span>/</span>
          <Link to="/products" className="no-underline text-inherit">Productos</Link>
          <span>/</span>
          <span className="text-black">{product.name}</span>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-16 items-start">
          <div className="aspect-square bg-[hsl(var(--luxury-gray-light))] overflow-hidden sticky top-24">
            <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
          </div>

          <div>
            <p className="text-sm font-normal tracking-[0.12em] mb-4 text-black uppercase">
              {product.category}
            </p>
            <h1 className="text-[clamp(2rem,4vw,3rem)] font-extralight tracking-[0.25em] mb-8 text-black">
              {product.name}
            </h1>
            <p className="text-[1.8rem] font-light tracking-[0.06em] mb-12 text-black">
              {product.price_label ?? String(priceNumber)}
            </p>
            <p className="text-[1.05rem] font-light tracking-[0.03em] leading-8 mb-12 text-[hsl(0,0%,35%)]">
              {product.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-16">
              <button
                onClick={handleAddToCart}
                className="bg-[#314737] text-white border-0 px-12 py-5 text-sm tracking-[0.12em] cursor-pointer transition-colors w-full font-light hover:bg-[#314737]/70"
              >
                AGREGAR AL CARRITO
              </button>
              <button className="bg-black text-white border-0 px-12 py-5 text-sm tracking-[0.12em] cursor-pointer transition-colors w-full font-light hover:bg-[hsl(0,0%,20%)]">
                CONTACTAR
              </button>
            </div>

            <div className="border-t border-[hsl(0,0%,90%)] pt-12">
              <h3 className="text-[1.3rem] font-light tracking-[0.19em] mb-8 text-black">
                ESPECIFICACIONES
              </h3>
              <ul className="list-none p-0">
                {(Array.isArray(product.specifications) ? product.specifications : []).map((spec, index) => (
                  <li key={index} className="text-base font-light tracking-[0.03em] mb-4 text-[hsl(0,0%,35%)] pl-6 relative">
                    <span className="absolute left-0 top-2 w-2 h-2 bg-black rounded-full" />
                    {spec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
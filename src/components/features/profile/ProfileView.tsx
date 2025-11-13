import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { User, Mail, Phone, MapPin, Edit2, Save, X } from "lucide-react";
import { Skeleton, addToast } from "@heroui/react";

export const ProfileView = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const API_BASE = (import.meta as any).env?.VITE_API_BASE;
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [isViewing, setIsViewing] = useState(false);
  const [viewOrder, setViewOrder] = useState<any | null>(null);
  const navigate = useNavigate();
  const { clearCart, addToCart, updateQuantity } = useCart();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
  });

  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
  });

  useEffect(() => {
    const run = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) { setLoading(false); setOrdersLoading(false); return; }
        const res = await fetch(`${API_BASE}/api/profile`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) {
          const next = {
            name: data.name ?? "",
            email: data.email ?? "",
            phone: data.phone ?? "",
            address: data.address ?? "",
            bio: data.bio ?? "",
          };
          setFormData(next);
          setEditData(next);
          setIsAdmin(Boolean(data.is_admin));
        }
        try {
          const ordRes = await fetch(`${API_BASE}/api/my/orders`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } });
          const ordData = await ordRes.json();
          setOrders(Array.isArray(ordData) ? ordData : []);
        } catch { setOrders([]); }
      } catch {}
      setLoading(false);
      setOrdersLoading(false);
    };
    run();
  }, []);

  const resolveImageUrl = (img?: string | null) => {
    if (!img) return "/placeholder.svg";
    if (/^https?:\/\//i.test(img)) return img;
    return `${API_BASE}/storage/${img}`;
  };

  const retryPayment = async (o: any) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) { navigate("/cart"); return; }
      clearCart();
      const tasks = (Array.isArray(o.items) ? o.items : []).map(async (it: any) => {
        try {
          const res = await fetch(`${API_BASE}/api/products/${it.id}`, { headers: { Accept: "application/json" } });
          const p = await res.json();
          const img = (Array.isArray(p.images) && p.images.length ? p.images[0] : p.image) || null;
          const product = {
            id: it.id,
            name: it.name || p.name || "Producto",
            collection: p.category || "General",
            price: p.price_label || String(it.price_number || 0),
            priceNumber: Number(it.price_number ?? p.price_number ?? 0),
            image: resolveImageUrl(img),
            description: p.description || "",
            specifications: Array.isArray(p.specifications) ? p.specifications : [],
          };
          addToCart(product as any);
          updateQuantity(product.id, Number(it.quantity || 1));
        } catch {
          const product = {
            id: it.id,
            name: it.name || "Producto",
            collection: "General",
            price: String(it.price_number || 0),
            priceNumber: Number(it.price_number || 0),
            image: "/placeholder.svg",
            description: "",
            specifications: [],
          };
          addToCart(product as any);
          updateQuantity(product.id, Number(it.quantity || 1));
        }
      });
      await Promise.all(tasks);
      addToast({ title: "Carrito listo", description: "Puedes reintentar el pago", timeout: 3000 });
      navigate("/cart");
    } catch {
      navigate("/cart");
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        setFormData(editData);
        setIsEditing(false);
        const raw = localStorage.getItem('auth_user');
        if (raw) {
          const u = JSON.parse(raw);
          localStorage.setItem('auth_user', JSON.stringify({ ...u, name: editData.name, email: editData.email }));
        }
      }
    } catch {}
  };

  const handleCancel = () => {
    setEditData(formData);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen pt-20 bg-white">
      <div className="max-w-4xl mx-auto px-8 py-16">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extralight tracking-widest uppercase">
            Mi Perfil
          </h1>

          {!isEditing && (
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 py-2 border border-black/20 text-sm tracking-widest uppercase hover:border-black/40 transition-colors"
              >
                <Edit2 size={16} />
                Editar
              </button>
              {isAdmin && (
                <a href="/admin" className="flex items-center gap-2 px-6 py-2 bg-[#314737] text-white text-sm tracking-widest uppercase hover:bg-[#314737]/90 transition-colors">
                  Admin
                </a>
              )}
            </div>
          )}
        </div>


        <div className="grid md:grid-cols-3 gap-12">
          {/* Avatar Section */}
          <div className="md:col-span-1">
            <div className="flex flex-col items-center">
              <Skeleton isLoaded={!loading} className="w-48 h-48 rounded-full mb-6">
                <div className="w-48 h-48 rounded-full bg-[#314737]/10 flex items-center justify-center overflow-hidden">
                  <User size={80} className="text-[#314737]/40" />
                </div>
              </Skeleton>
              
              {isEditing && (
                <button className="text-sm tracking-widest text-black/60 uppercase hover:text-black transition-colors">
                  Cambiar foto
                </button>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="md:col-span-2 space-y-8">
            {/* Name */}
            <div className="border-b border-black/10 pb-6">
              <label className="block text-xs tracking-[0.15em] uppercase text-black/60 mb-3">
                Nombre completo
              </label>
              <Skeleton isLoaded={!loading}>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full text-lg tracking-[0.05em] text-black bg-transparent border border-black/20 px-4 py-2 focus:outline-none focus:border-black/40 transition-colors"
                  />
                ) : (
                  <p className="text-lg tracking-[0.05em] text-black">{formData.name}</p>
                )}
              </Skeleton>
            </div>

            {/* Email */}
            <div className="border-b border-black/10 pb-6">
              <label className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-black/60 mb-3">
                <Mail size={14} />
                Email
              </label>
              <Skeleton isLoaded={!loading}>
                {isEditing ? (
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="w-full text-lg tracking-[0.05em] text-black bg-transparent border border-black/20 px-4 py-2 focus:outline-none focus:border-black/40 transition-colors"
                  />
                ) : (
                  <p className="text-lg tracking-[0.05em] text-black">{formData.email}</p>
                )}
              </Skeleton>
            </div>

            {/* Phone */}
            <div className="border-b border-black/10 pb-6">
              <label className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-black/60 mb-3">
                <Phone size={14} />
                Teléfono
              </label>
              <Skeleton isLoaded={!loading}>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full text-lg tracking-[0.05em] text-black bg-transparent border border-black/20 px-4 py-2 focus:outline-none focus:border-black/40 transition-colors"
                  />
                ) : (
                  <p className="text-lg tracking-[0.05em] text-black">{formData.phone}</p>
                )}
              </Skeleton>
            </div>

            {/* Address */}
            <div className="border-b border-black/10 pb-6">
              <label className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-black/60 mb-3">
                <MapPin size={14} />
                Dirección
              </label>
              <Skeleton isLoaded={!loading}>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.address}
                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                    className="w-full text-lg tracking-[0.05em] text-black bg-transparent border border-black/20 px-4 py-2 focus:outline-none focus:border-black/40 transition-colors"
                  />
                ) : (
                  <p className="text-lg tracking-[0.05em] text-black">{formData.address}</p>
                )}
              </Skeleton>
            </div>            

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-8 py-3 bg-[#314737] text-white text-sm tracking-[0.15em] uppercase hover:bg-[#314737]/90 transition-colors"
                >
                  <Save size={16} />
                  Guardar
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-8 py-3 border border-black/20 text-sm tracking-widest uppercase hover:border-black/40 transition-colors"
                >
                  <X size={16} />
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Orders Section */}
        <div className="mt-16 pt-16 border-t border-black/10">
          <h2 className="text-2xl font-extralight tracking-[0.2em] text-black uppercase mb-8">
            Mis Pedidos
          </h2>
          <div className="space-y-4">
            {ordersLoading ? (
              <div className="border border-black/10 p-6">
                <p className="text-sm tracking-[0.05em] text-black/60">Cargando pedidos...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="border border-black/10 p-6">
                <p className="text-sm tracking-[0.05em] text-black/60">No tienes pedidos</p>
              </div>
            ) : (
              orders.map((o) => {
                const first = Array.isArray(o.items) && o.items.length ? o.items[0] : null;
                const productLabel = first ? `${first.name} ${first.quantity ? `x${first.quantity}` : ''}` : `${o.items.length} ítems`;
                const when = new Date(o.created_at);
                const dateLabel = when.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
                const labelForStatus = (s: string) => {
                  if (s === "pending_payment") return "Pendiente";
                  if (s === "paid") return "Pagado";
                  if (s === "processing") return "Procesando";
                  if (s === "shipped") return "Enviado";
                  if (s === "delivered") return "Entregado";
                  if (s === "cancelled") return "Cancelado";
                  if (s === "rejected") return "Rechazado";
                  if (s === "failed") return "Fallido";
                  return s;
                };
                return (
                  <div key={o.id} className="border border-black/10 p-6 hover:border-black/20 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm tracking-widest uppercase text-black/60 mb-1">Pedido #{o.id}</p>
                        <p className="text-lg tracking-[0.05em] text-black">{productLabel}</p>
                      </div>
                      <span className="text-sm tracking-widest uppercase text-[#314737]">{labelForStatus(o.status)}</span>
                    </div>
                    <p className="text-sm tracking-[0.05em] text-black/60">{dateLabel}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        onClick={() => { setViewOrder(o); setIsViewing(true); }}
                        className="border border-black/20 px-4 py-2 text-sm tracking-widest uppercase hover:border-black/40 transition-colors"
                      >
                        Ver detalles
                      </button>
                      {o.status === 'pending_payment' && (
                        <button
                          onClick={() => retryPayment(o)}
                          className="bg-[#314737] text-white px-4 py-2 text-sm tracking-[0.12em] uppercase hover:bg-[#314737]/90 transition-colors"
                        >
                          Reintentar pago
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        {isViewing && viewOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsViewing(false)} />
            <div className="relative bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-lg z-10 p-6">
              <h3 className="text-xl font-extralight tracking-[0.2em] text-black uppercase mb-4">Pedido #{viewOrder.id}</h3>
              <div className="space-y-2 text-sm">
                <p className="text-black/70">Estado: <span className="uppercase">{viewOrder.status}</span></p>
                <p className="text-black/70">Fecha: {new Date(viewOrder.created_at).toLocaleString('es-ES')}</p>
                <p className="text-black/70">Total: COP {new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0 }).format(Number(viewOrder.total || 0))}</p>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-light tracking-[0.12em] uppercase text-black mb-2">Items</h4>
                <div className="space-y-2">
                  {(Array.isArray(viewOrder.items) ? viewOrder.items : []).map((it: any, idx: number) => (
                    <div key={`${viewOrder.id}-item-${idx}`} className="flex justify-between text-sm">
                      <span className="text-black">{it.name}</span>
                      <span className="text-black/70">x{it.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsViewing(false)}
                  className="border border-gray-200 px-6 py-3 text-sm tracking-[0.12em] uppercase font-light hover:bg-zinc-300 transition-colors rounded-md"
                >
                  Cerrar
                </button>
                {viewOrder.status === 'pending_payment' && (
                  <button
                    type="button"
                    onClick={() => { setIsViewing(false); retryPayment(viewOrder); }}
                    className="bg-[#314737] text-white border-0 px-6 py-3 text-sm tracking-[0.12em] uppercase font-light hover:bg-[#314737]/90 transition-colors rounded-md"
                  >
                    Reintentar pago
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

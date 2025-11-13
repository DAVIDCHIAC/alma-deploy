import { Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2 } from "lucide-react";
import { addToast } from "@heroui/react";
import { LoginSidebar } from "@/components/ui/LoginSidebar";

export const CartView = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [isAddressSaving, setIsAddressSaving] = useState(false);
  const API_BASE = (import.meta as any).env?.VITE_API_BASE
  
  const formatCOP = (n: number) => `COP ${new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0 }).format(n)}`;

  // Helper to open ePayco Smart Checkout given a sessionId
  const openEpaycoCheckout = async (sessionId: string, orderId?: number) => {
    if (!sessionId) return;
    console.debug('openEpaycoCheckout - sessionId:', sessionId);
    const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      console.debug('openEpaycoCheckout - loading script', src);
      const s = document.createElement("script");
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("script load error"));
      document.body.appendChild(s);
    });
    try {
      await loadScript("https://checkout.epayco.co/checkout-v2.js");
      console.debug('openEpaycoCheckout - script loaded');
      const getCheckout = () => (window as any)?.ePayco?.checkout || (window as any)?.ePaycoCheckout?.checkout;
      let attempts = 0;
      while (!getCheckout() && attempts < 20) {
        await new Promise((r) => setTimeout(r, 100));
        attempts++;
      }
      const checkoutApi = getCheckout();
      if (!checkoutApi) throw new Error("ePayco checkout no disponible");
      const checkout = checkoutApi.configure({ sessionId, type: "onpage", test: true });
      checkout.onCreated((payload: any) => {
        console.debug('checkout.onCreated payload:', payload);
        const ref = payload?.data?.x_ref_payco || payload?.x_ref_payco || payload?.data?.reference || payload?.reference;
        if (ref) {
          addToast({ title: 'Transacción creada', description: 'Esperando confirmación...', timeout: 3000 });
          if (orderId) {
            const invoice = payload?.data?.x_invoice || payload?.invoice;
            fetch(`${API_BASE}/api/orders/${orderId}/epayco/ref`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}` },
              body: JSON.stringify({ ref, invoice }),
            }).catch(() => {});
            try {
              localStorage.setItem('last_ref_payco', String(ref));
              if (invoice) localStorage.setItem('last_epayco_invoice', String(invoice));
            } catch {}
          }
        }
      });
      checkout.onErrors((e: any) => { addToast({ title: 'Error en el pago', description: 'Intenta nuevamente', timeout: 3000 }); console.error(e); document.body.style.overflow = ''; });
      checkout.onClosed(() => { console.debug('checkout closed'); document.body.style.overflow = ''; });
      console.debug('openEpaycoCheckout - opening checkout');
      document.body.style.overflow = 'hidden';
      checkout.open();
    } catch (err) {
      console.error(err);
      addToast({ title: 'Error', description: 'No se pudo abrir el Smart Checkout', timeout: 3000 });
    }
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setIsLoginOpen(true);
      return;
    }
    try {
      const pr = await fetch(`${API_BASE}/api/profile`, { headers: { Accept: "application/json", Authorization: `Bearer ${token}` } });
      if (pr.ok) {
        const p = await pr.json();
        const current = String(p?.address || '').trim();
        if (!current) {
          setIsAddressOpen(true);
          return;
        }
      }
    } catch {}
    setIsProcessing(true);
    try {
      const payload = {
        items: items.map((it) => ({ id: it.id, name: it.name, price_number: it.priceNumber, quantity: it.quantity })),
        subtotal: totalPrice,
        taxes: 0,
        total: totalPrice,
      };
      console.debug('handleCheckout - calling /api/orders/checkout with payload', payload);
      const res = await fetch(`${API_BASE}/api/orders/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.debug('orders/checkout response:', data);
      if (!res.ok) {
        const msg = (data && (data.message || data.error)) || "No se pudo iniciar el pago";
        addToast({ title: 'Error', description: String(msg), timeout: 3000 });
        return;
      }
      // Detect possible sessionId locations returned by backend
      const sid = (data?.session_id as string | undefined)
        || (data?.data?.sessionId as string | undefined)
        || (data?.sessionId as string | undefined)
        || (data?.data?.session_id as string | undefined);
      const orderId = (data?.order_id as number | undefined) || (data?.data?.order_id as number | undefined);
      if (sid && sid.length > 0) {
        console.debug('handleCheckout - sessionId found in orders/checkout:', sid);
        if (orderId) {
          try {
            localStorage.setItem('last_order_id', String(orderId));
          } catch {}
        }
        await openEpaycoCheckout(sid, orderId);
        return;
      }
      // If no session id found in the first response, continue to fallback below
      // Fallback: si no tenemos session_id, intentar crear una sesión directamente
      // usando el endpoint de pruebas `/api/epayco/session` que está en el backend
      try {
        const epayPayload = {
          name: 'Alma Store',
          description: 'Compra desde frontend',
          currency: 'COP',
          // send amount in currency units (no *100)
          amount: Math.round(totalPrice),
          lang: 'ES',
          country: 'CO',
          test: true,
        };

        console.debug('handleCheckout - calling /api/epayco/session with payload', epayPayload);

        const epayRes = await fetch(`${API_BASE}/api/epayco/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(epayPayload),
        });
        const epayData = await epayRes.json();
        console.debug('epayco/session response:', epayData);
        if (epayRes.ok && (epayData?.data?.sessionId || epayData?.data?.session_id || epayData?.sessionId || epayData?.session_id)) {
            const sessionId = String(epayData?.data?.sessionId || epayData?.data?.session_id || epayData?.sessionId || epayData?.session_id);
            console.debug('handleCheckout - sessionId found in epayco/session:', sessionId);
            await openEpaycoCheckout(sessionId);
            return;
        }
      } catch (err) {
        console.error('Fallback epayco/session error', err);
      }
      addToast({ title: 'Error', description: 'No se pudo iniciar el Smart Checkout', timeout: 3000 });
    } catch (e) {
      addToast({ title: 'Error', description: 'Error conectando con el servidor', timeout: 3000 });
    } finally {
      setIsProcessing(false);
    }
  };

  const saveAddressAndCheckout = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setIsAddressOpen(false);
      setIsLoginOpen(true);
      return;
    }
    const val = address.trim();
    if (!val) {
      addToast({ title: 'Dirección requerida', description: 'Ingresa tu dirección de envío', timeout: 3000 });
      return;
    }
    setIsAddressSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ address: val }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        const msg = (j && (j.message || j.error)) || 'No se pudo guardar la dirección';
        addToast({ title: 'Error', description: String(msg), timeout: 3000 });
        return;
      }
      setIsAddressOpen(false);
      await handleCheckout();
    } catch {
      addToast({ title: 'Error', description: 'No se pudo guardar la dirección', timeout: 3000 });
    } finally {
      setIsAddressSaving(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-luxury-white flex items-center justify-center">
        <div className="text-center px-8">
          <h2 className="text-3xl font-light tracking-wider mb-4 text-luxury-text">
            Tu carrito está vacío
          </h2>
          <p className="text-muted-foreground mb-8">
            Explora nuestra colección de accesorios
          </p>
          <Link to="/products">
            <button className="bg-luxury-burgundy hover:bg-luxury-burgundyHover text-white py-3 px-8 tracking-wider transition-colors">
              VER PRODUCTOS
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
    
    <div className="min-h-screen pt-20 bg-white">
      <div className="max-w-[1400px] mx-auto px-8 py-16">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extralight tracking-widest mb-8 uppercase">
            CARRITO DE COMPRA
          </h1>
          <button
            onClick={() => {
              clearCart();
              addToast({ title: 'Carrito vaciado', description: 'Se eliminaron todos los productos', timeout: 3000 });
            }}
            className="text-sm border cursor-pointer border-[#314737]/70 text-[#314737] px-4 py-2 tracking-wider hover:bg-luxury-gray/60 transition-colors"
          >
            Vaciar carrito
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Items del carrito */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white shadow-sm border border-gray-200 p-6 flex gap-6"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-32 h-32 object-cover"
                />
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <div>
                      <p className="text-xs text-muted-foreground tracking-wider uppercase">
                        {item.collection}
                      </p>
                      <h3 className="text-xl font-light tracking-wide text-luxury-text">
                        {item.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        removeFromCart(item.id);
                        addToast({ title: 'Producto eliminado', description: 'El producto fue eliminado del carrito', timeout: 3000 });
                      }}
                      className="text-muted-foreground cursor-pointer hover:text-destructive transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <p className="text-lg mb-4 text-luxury-text">{formatCOP(item.priceNumber)}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-[#314737]/70 text-[#314737] overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-2 hover:bg-muted cursor-pointer transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-4 py-2 w-12 text-center text-luxury-text">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-2 hover:bg-muted cursor-pointer transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <span className="text-lg font-light text-luxury-text">
                      {formatCOP(item.priceNumber * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-sm border border-gray-200 p-8 sticky top-32">
              <h2 className="text-2xl font-light tracking-wider mb-6 text-luxury-text">
                Resumen del pedido
              </h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-luxury-text">
                    {formatCOP(totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  <span className="text-luxury-text">Gratis</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg">
                    <span className="font-light text-luxury-text">Total</span>
                    <span className="font-light text-luxury-text">
                      {formatCOP(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full bg-[#314737] text-white border-0 px-12 py-4 text-sm tracking-[0.12em] cursor-pointer transition-all font-light hover:bg-[#314737/90] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>INICIANDO...</span>
                  </>
                ) : (
                  <>PROCEDER AL PAGO</>
                )}
              </button>
              
              <Link to="/products">
                <button className="w-full mt-4 border border-[#314737]/70 text-[#314737] py-3 px-6 tracking-wider hover:bg-luxury-gray/60 cursor-pointer transition-colors hover:-translate-y-0.5">
                  SEGUIR COMPRANDO
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
      
    <LoginSidebar isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    {isAddressOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50" onClick={() => setIsAddressOpen(false)} />
        <div className="relative bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-md z-10 p-6">
          <h3 className="text-xl font-extralight tracking-[0.2em] text-luxury-text uppercase mb-4">Dirección de envío</h3>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 bg-white text-sm tracking-wide focus:outline-none focus:ring-1 focus:ring-luxury-burgundy transition-colors rounded-md"
            placeholder="Calle, número, ciudad"
          />
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsAddressOpen(false)}
              className="border border-gray-200 px-6 py-3 text-sm tracking-[0.12em] uppercase font-light hover:bg-zinc-300 transition-colors rounded-md"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={saveAddressAndCheckout}
              disabled={isAddressSaving}
              className="bg-[#314737] text-white border-0 px-6 py-3 text-sm tracking-[0.12em] uppercase font-light hover:bg-[#314737]/90 transition-colors rounded-md disabled:opacity-50"
            >
              {isAddressSaving ? 'Guardando...' : 'Guardar y pagar'}
            </button>
          </div>
        </div>
      </div>
    )}
      </>
  );
};


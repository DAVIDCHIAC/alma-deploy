import { Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { LoginSidebar } from "@/components/ui/LoginSidebar";

export const CartView = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const API_BASE = "http://localhost:8000";

  // Helper to open ePayco Smart Checkout given a sessionId
  const openEpaycoCheckout = async (sessionId: string) => {
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
      const checkout = checkoutApi.configure({ sessionId, type: "standard", test: true });
      checkout.onCreated((payload: any) => {
        console.debug('checkout.onCreated payload:', payload);
        const ref = payload?.data?.x_ref_payco || payload?.x_ref_payco || payload?.data?.reference || payload?.reference;
        if (ref) {
          window.location.href = `/payment-response?ref_payco=${ref}`;
        } else {
          toast.success('Transacción creada. Esperando confirmación...');
        }
      });
      checkout.onErrors((e: any) => { toast.error("Error en el pago"); console.error(e); });
      checkout.onClosed(() => { console.debug('checkout closed'); });
      console.debug('openEpaycoCheckout - opening checkout');
      checkout.open();
    } catch (err) {
      console.error(err);
      toast.error("No se pudo abrir el Smart Checkout");
    }
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setIsLoginOpen(true);
      return;
    }
    try {
      const payload = {
        items: items.map((it) => ({ id: it.id, name: it.name, price_number: it.priceNumber, quantity: it.quantity })),
        subtotal: totalPrice,
        taxes: Math.round(totalPrice * 0.21),
        total: Math.round(totalPrice * 1.21),
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
        toast.error(msg);
        return;
      }
      // Detect possible sessionId locations returned by backend
      const sid = (data?.session_id as string | undefined)
        || (data?.data?.sessionId as string | undefined)
        || (data?.sessionId as string | undefined)
        || (data?.data?.session_id as string | undefined);
      if (sid && sid.length > 0) {
        console.debug('handleCheckout - sessionId found in orders/checkout:', sid);
        await openEpaycoCheckout(sid);
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
          amount: Math.round(totalPrice * 1.21),
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
      if (data?.payment_url) {
        window.location.href = String(data.payment_url);
        return;
      }
      if (data?.order_id) {
        window.location.href = `http://localhost:8000/api/orders/${String(data.order_id)}/redirect`;
        return;
      }
      toast.error("No se pudo iniciar el pago");
    } catch (e) {
      toast.error("Error conectando con el servidor");
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
            Explora nuestra colección de relojes de lujo
          </p>
          <Link to="/products">
            <button className="bg-luxury-burgundy hover:bg-luxury-burgundyHover text-white py-3 px-8 tracking-wider transition-colors">
              VER COLECCIÓN
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
              toast.success("Carrito vaciado");
            }}
            className="text-sm border border-gray-200 px-4 py-2 tracking-wider hover:bg-luxury-gray/60 transition-colors rounded-md"
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
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex gap-6"
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
                        toast.success("Producto eliminado");
                      }}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <p className="text-lg mb-4 text-luxury-text">{item.price}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-2 hover:bg-muted transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-4 py-2 w-12 text-center text-luxury-text">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-2 hover:bg-muted transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <span className="text-lg font-light text-luxury-text">
                      €{(item.priceNumber * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sticky top-32">
              <h2 className="text-2xl font-light tracking-wider mb-6 text-luxury-text">
                Resumen del pedido
              </h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-luxury-text">
                    €{totalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  <span className="text-luxury-text">Gratis</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IVA (21%)</span>
                  <span className="text-luxury-text">
                    €{Math.round(totalPrice * 0.21).toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg">
                    <span className="font-light text-luxury-text">Total</span>
                    <span className="font-light text-luxury-text">
                      €{Math.round(totalPrice * 1.21).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-[#314737] text-white border-0 px-12 py-4 text-sm tracking-[0.12em] cursor-pointer transition-all font-light hover:bg-[#314737/90] hover:-translate-y-0.5"
              >
                PROCEDER AL PAGO
              </button>
              
              <Link to="/products">
                <button className="w-full mt-4 border border-gray-200 py-3 px-6 tracking-wider hover:bg-luxury-gray/60 transition-colors">
                  SEGUIR COMPRANDO
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
      
    <LoginSidebar isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </>
  );
};


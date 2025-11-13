import { useEffect, useState, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { NotFoundView } from "@/components/features/common";

type PaymentInfo = any;

export const PaymentResponse = () => {
  const { clearCart } = useCart();
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const attemptsRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const pollingRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref_payco") || params.get("x_ref_payco");
    if (!ref) {
      setLoading(false);
      setPaymentInfo(null);
      return;
    }
    fetch(`https://secure.epayco.co/validation/v1/reference/${ref}`)
      .then((r) => r.json())
      .then((json) => {
        // Some responses place the useful payload in `data`, others return at top-level.
        const payload = json?.data ?? json ?? null;
        if (!payload || typeof payload !== 'object') {
          setPaymentInfo(null);
          setLoading(false);
          return;
        }
        setPaymentInfo(payload);
        const orderId = localStorage.getItem('last_order_id');
        const xref = payload?.x_ref_payco ?? payload?.ref_payco ?? payload?.reference ?? null;
        const invoice = payload?.x_id_invoice ?? payload?.invoice ?? null;
        if (orderId && xref) {
          const token = localStorage.getItem('auth_token') || '';
          fetch(`/api/orders/${orderId}/epayco/ref`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: JSON.stringify({ ref: String(xref), invoice: invoice ? String(invoice) : undefined }),
          }).catch(() => {});
          fetch(`/api/orders/sync-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ order_id: Number(orderId), ref: String(xref) }),
          })
            .then((r) => r.json())
            .then((res) => {
              const ord = res?.order ?? res;
              if (ord && typeof ord.status === 'string') {
                setOrderStatus(ord.status);
              }
              setLoading(false);
              if (ord?.status === 'pending_payment' && !pollingRef.current) {
                pollingRef.current = true;
                const poll = () => {
                  if (attemptsRef.current >= 6) return;
                  attemptsRef.current += 1;
                  fetch(`/api/orders/${orderId}`)
                    .then((r) => r.json())
                    .then((o) => {
                      if (o && typeof o.status === 'string') {
                        setOrderStatus(o.status);
                      }
                      if (o?.status === 'paid' || o?.status === 'rejected' || o?.status === 'failed') {
                        return;
                      }
                      timerRef.current = window.setTimeout(poll, 3000);
                    })
                    .catch(() => {
                      if (attemptsRef.current < 6) {
                        timerRef.current = window.setTimeout(poll, 3000);
                      }
                    });
                };
                timerRef.current = window.setTimeout(poll, 3000);
              }
            })
            .catch(() => {
              setLoading(false);
            });
        } else {
          setLoading(false);
        }

        // Normalize possible state fields
        const state = payload?.x_response ?? payload?.x_transaction_state ?? payload?.transaction_state ?? payload?.state ?? null;
        const acceptedStates = ["Aceptada", "Aceptado", "Aceptada Test", "APPROVED", "approved"];
        if ((state && acceptedStates.includes(String(state))) || orderStatus === 'paid') {
          clearCart();
        }
      })
      .catch(() => {
        setPaymentInfo(null);
        setLoading(false);
      });
  }, [clearCart]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      pollingRef.current = false;
      attemptsRef.current = 0;
    };
  }, []);

  const formatPrice = (price: number) => {
    const currency = paymentInfo?.x_currency_code ?? paymentInfo?.currency ?? paymentInfo?.x_currency ?? "COP";
    return new Intl.NumberFormat("es-CO", { style: "currency", currency }).format(Number(price || 0));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-black/70" />
      </div>
    );
  }

  if (!paymentInfo) return <NotFoundView />;
 
  return (
    <div className="min-h-screen bg-luxury-white">
      <div className="max-w-[900px] mx-auto px-8 py-16">
        <h1 className="text-3xl font-light tracking-wider text-center mb-8 text-luxury-text">Resumen de la compra</h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-light tracking-wider mb-2 text-luxury-text">Estado de la transacción</h2>
            <p className={(
              ["Aceptada", "Aceptado", "Aceptada Test", "APPROVED", "approved"].includes(
                String((paymentInfo?.x_response ?? paymentInfo?.x_transaction_state ?? paymentInfo?.transaction_state ?? paymentInfo?.state) ?? '')
              ) || orderStatus === 'paid'
            ) ? "text-green-600" : "text-red-600"}>
              {orderStatus ?? (paymentInfo?.x_response ?? paymentInfo?.x_transaction_state ?? paymentInfo?.transaction_state ?? paymentInfo?.state) ?? 'Desconocido'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-light tracking-wider mb-2 text-luxury-text">Detalles del pedido</h3>
              <p><span className="font-medium">Referencia:</span> {paymentInfo?.x_id_invoice ?? paymentInfo?.invoice ?? paymentInfo?.x_ref_payco ?? paymentInfo?.reference}</p>
              <p><span className="font-medium">Descripción:</span> {paymentInfo?.x_description ?? paymentInfo?.description ?? paymentInfo?.x_extra1 ?? '-'}</p>
              <p><span className="font-medium">Fecha:</span> {paymentInfo?.x_transaction_date ? new Date(paymentInfo.x_transaction_date).toLocaleString() : (paymentInfo?.transaction_date ? new Date(paymentInfo.transaction_date).toLocaleString() : '-')}</p>
            </div>
            <div>
              <h3 className="font-light tracking-wider mb-2 text-luxury-text">Detalles del pago</h3>
              <p><span className="font-medium">Monto:</span> {formatPrice(paymentInfo?.x_amount ?? paymentInfo?.amount ?? paymentInfo?.value)}</p>
              <p><span className="font-medium">Moneda:</span> {paymentInfo?.x_currency_code ?? paymentInfo?.currency ?? paymentInfo?.x_currency ?? 'COP'}</p>
              <p><span className="font-medium">Método de pago:</span> {paymentInfo?.x_type_payment ?? paymentInfo?.payment_method ?? paymentInfo?.x_payment_method ?? '-'}</p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <a href="/" className="bg-[#314737] text-white border-0 px-6 py-3 text-sm tracking-[0.12em] cursor-pointer transition-all font-light hover:bg-[#314737/90] hover:-translate-y-0.5">
              Volver a la tienda
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
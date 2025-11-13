"use client"

import { useState, useEffect, useMemo } from "react"
import { Eye, Download, Plus } from "lucide-react"
import { Link } from "react-router-dom"
import CreateProduct from "./CreateProduct"
import { addToast } from "@heroui/react"

type OrderItem = { id: number; name: string; price_number?: number; quantity: number }
type UserSummary = { id: number; name: string; email: string; address?: string }
type Order = {
  id: number
  items: OrderItem[]
  subtotal: number
  taxes: number
  total: number
  status: string
  epayco_ref?: string | null
  epayco_invoice?: string | null
  created_at: string
  user?: UserSummary | null
}

export const Orders = () => {
  const [showProductModal, setShowProductModal] = useState(false)
  const API_BASE = (import.meta as any).env?.VITE_API_BASE || "https://bao-unsignified-nonprudently.ngrok-free.dev"
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Order | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState<string>("")

  const statusColors: Record<string, string> = {
    pending_payment: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    rejected: "bg-red-100 text-red-800",
    failed: "bg-red-100 text-red-800",
  }

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      const url = new URL(`${API_BASE}/api/orders`)
      if (statusFilter) url.searchParams.set("status", statusFilter)
      const res = await fetch(url.toString(), {
        headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), "ngrok-skip-browser-warning": "1" },
      })
      if (!res.ok) throw new Error("Error al cargar pedidos")
      const data = await res.json()
      const arr: Order[] = Array.isArray(data) ? data : []
      setOrders(arr)
      if (!selected && arr.length) setSelected(arr[0])
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  const stats = useMemo(() => {
    const total = orders.length
    const pendiente = orders.filter((o) => o.status === "pending_payment").length
    const enviado = orders.filter((o) => o.status === "shipped").length
    const entregado = orders.filter((o) => o.status === "delivered").length
    return { total, pendiente, enviado, entregado }
  }, [orders])

  const formatCOP = (n: number) => `COP ${new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0 }).format(n)}`
  const labelForStatus = (s: string) => {
    if (s === "pending_payment") return "Pendiente"
    if (s === "paid") return "Pagado"
    if (s === "processing") return "Procesando"
    if (s === "shipped") return "Enviado"
    if (s === "delivered") return "Entregado"
    if (s === "cancelled") return "Cancelado"
    if (s === "rejected") return "Rechazado"
    if (s === "failed") return "Fallido"
    return s
  }

  const updateSelectedStatus = async () => {
    if (!selected) return
    const token = localStorage.getItem("auth_token")
    if (!token) return
    const next = newStatus || selected.status
    setUpdating(true)
    try {
      const res = await fetch(`${API_BASE}/api/orders/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "1" },
        body: JSON.stringify({ status: next }),
      })
      if (!res.ok) throw new Error('Error al actualizar estado')
      const ord = await res.json()
      setOrders((prev) => prev.map((o) => (o.id === ord.id ? ord : o)))
      setSelected(ord)
      addToast({ title: 'Estado actualizado', description: `Pedido #${ord.id} → ${labelForStatus(ord.status)}`, timeout: 3000 })
    } catch {
      addToast({ title: 'Error', description: 'No se pudo actualizar el estado', timeout: 3000 })
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-extralight tracking-[0.3em] mb-2 text-luxury-text uppercase">Pedidos</h1>
            <p className="text-muted-foreground tracking-wider cursor-pointer">Gestiona todos los pedidos de la tienda</p>
          </div>
        <div className="flex items-center gap-2">
          <button className="border border-gray-200 px-6 py-3 text-sm tracking-[0.12em] uppercase font-light hover:bg-luxury-gray/60 transition-colors flex items-center gap-2 rounded-md">
            <Download size={18} />
            Exportar
          </button>
          <button
            onClick={() => setShowProductModal(true)}
            className="bg-luxury-green text-white px-6 py-3 text-sm tracking-[0.12em] uppercase font-light hover:opacity-90 transition-opacity flex items-center gap-2 rounded-md"
          >
            <Plus size={18} />
            Nuevo Producto
          </button>
          <Link
            to="/admin/products"
            className="border border-gray-200 px-6 py-3 text-sm tracking-[0.12em] uppercase font-light hover:bg-luxury-gray/60 transition-colors flex items-center gap-2 rounded-md"
          >
            Gestionar Productos
          </Link>
        </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-[11px] tracking-[0.15em] text-muted-foreground uppercase">Total</p>
            <p className="text-2xl font-extralight tracking-[0.2em] text-luxury-text">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-[11px] tracking-[0.15em] text-muted-foreground uppercase">Pendiente</p>
            <p className="text-2xl font-extralight tracking-[0.2em] text-yellow-700">{stats.pendiente}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-[11px] tracking-[0.15em] text-muted-foreground uppercase">Enviado</p>
            <p className="text-2xl font-extralight tracking-[0.2em] text-blue-700">{stats.enviado}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-[11px] tracking-[0.15em] text-muted-foreground uppercase">Entregado</p>
            <p className="text-2xl font-extralight tracking-[0.2em] text-green-700">{stats.entregado}</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-gray-200 bg-white text-sm tracking-wide focus:outline-none focus:ring-1 focus:ring-luxury-burgundy transition-colors rounded-md">
              <option value="">Todos los estados</option>
              <option value="pending_payment">Pendiente</option>
              <option value="paid">Pagado</option>
              <option value="processing">Procesando</option>
              <option value="shipped">Enviado</option>
              <option value="delivered">Entregado</option>
              <option value="cancelled">Cancelado</option>
              <option value="rejected">Rechazado</option>
              <option value="failed">Fallido</option>
            </select>
            <input
              type="date"
              className="px-4 py-2 border border-gray-200 bg-white text-sm tracking-wide focus:outline-none focus:ring-1 focus:ring-luxury-burgundy transition-colors rounded-md"
              disabled
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowProductModal(true)}
              className="bg-luxury-green text-white px-4 py-2 text-xs tracking-[0.12em] uppercase font-light hover:opacity-90 transition-opacity flex items-center gap-2 rounded-md"
            >
              <Plus size={16} />
              Nuevo Producto
            </button>
            <Link
              to="/admin/products"
              className="border border-gray-200 px-4 py-2 text-xs tracking-[0.12em] uppercase font-light hover:bg-luxury-gray/60 transition-colors flex items-center gap-2 rounded-md"
            >
              Gestionar Productos
            </Link>
          </div>
        </div>

        {showProductModal && (
          <CreateProduct
            asModal
            mode="create"
            onCancel={() => setShowProductModal(false)}
            onSaved={() => setShowProductModal(false)}
          />
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-luxury-gray">
                <tr>
                  <th className="px-6 py-4 text-left text-xs tracking-[0.15em] text-luxury-text uppercase font-light">ID Pedido</th>
                  <th className="px-6 py-4 text-left text-xs tracking-[0.15em] text-luxury-text uppercase font-light">Fecha</th>
                  <th className="px-6 py-4 text-left text-xs tracking-[0.15em] text-luxury-text uppercase font-light">Cliente</th>
                  <th className="px-6 py-4 text-left text-xs tracking-[0.15em] text-luxury-text uppercase font-light">Producto</th>
                  <th className="px-6 py-4 text-left text-xs tracking-[0.15em] text-luxury-text uppercase font-light">Estado</th>
                  <th className="px-6 py-4 text-left text-xs tracking-[0.15em] text-luxury-text uppercase font-light">Monto</th>
                  <th className="px-6 py-4 text-left text-xs tracking-[0.15em] text-luxury-text uppercase font-light">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td className="px-6 py-5 text-sm" colSpan={7}>Cargando pedidos...</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td className="px-6 py-5 text-sm" colSpan={7}>No hay pedidos</td></tr>
                ) : (
                  orders.map((order) => {
                    const first = Array.isArray(order.items) && order.items.length ? order.items[0] : null
                    const productLabel = first ? `${first.name} ${first.quantity ? `x${first.quantity}` : ''}` : `${order.items.length} ítems`
                    const when = new Date(order.created_at)
                    const dateLabel = when.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
                    const customer = order.user?.name || `Usuario ${order.user?.id ?? ''}`
                    const email = order.user?.email || ''
                    const statusClass = statusColors[order.status] || 'bg-gray-100 text-gray-800'
                    return (
                      <tr key={order.id} className="hover:bg-luxury-gray/30 transition-colors">
                        <td className="px-6 py-5 text-sm tracking-wide font-light">#{order.id}</td>
                        <td className="px-6 py-5 text-sm tracking-wide font-light">{dateLabel}</td>
                        <td className="px-6 py-5">
                          <div>
                            <p className="text-sm tracking-wide font-light">{customer}</p>
                            <p className="text-xs tracking-wide text-muted-foreground">{email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm tracking-wide font-light">{productLabel}</td>
                        <td className="px-6 py-5">
                          <span className={`inline-block px-3 py-1 text-xs tracking-wider uppercase ${statusClass}`}>{labelForStatus(order.status)}</span>
                        </td>
                        <td className="px-6 py-5 text-sm tracking-wide font-light">{formatCOP(order.total)}</td>
                        <td className="px-6 py-5">
                          <button onClick={() => setSelected(order)} className="border cursor-pointer border-gray-200 px-3 py-1 text-xs tracking-wider uppercase hover:bg-luxury-gray/60 transition-colors flex items-center gap-2 rounded-md">
                            <Eye size={14} />
                            Ver
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>



        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-extralight tracking-[0.2em] mb-6 text-luxury-text uppercase">
            Detalle del Pedido
          </h2>
          {selected ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs tracking-[0.15em] text-luxury-text uppercase mb-4 font-light">Información del Cliente</h3>
                <div className="space-y-2 text-sm tracking-wide">
                  <p>
                    <span className="text-muted-foreground">Nombre:</span> {selected.user?.name || `Usuario ${selected.user?.id ?? ''}`}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Email:</span> {selected.user?.email || ''}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-xs tracking-[0.15em] text-luxury-text uppercase mb-4 font-light">Dirección de Envío</h3>
                <p className="text-sm tracking-wide leading-relaxed">{selected.user?.address || 'No registrada'}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm tracking-wide text-muted-foreground">Selecciona un pedido para ver el detalle.</p>
          )}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-xs tracking-[0.15em] text-luxury-text uppercase mb-4 font-light">Actualizar Estado</h3>
            <div className="flex gap-4">
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="px-4 py-2 border border-gray-200 bg-white text-sm tracking-wide focus:outline-none focus:ring-1 focus:ring-luxury-burgundy transition-colors rounded-md" disabled={!selected || updating}>
                <option value="">{selected ? labelForStatus(selected.status) : 'Selecciona un pedido'}</option>
                <option value="pending_payment">Pendiente</option>
                <option value="paid">Pagado</option>
                <option value="processing">Procesando</option>
                <option value="shipped">Enviado</option>
                <option value="delivered">Entregado</option>
                <option value="cancelled">Cancelado</option>
                <option value="rejected">Rechazado</option>
                <option value="failed">Fallido</option>
              </select>
              <button onClick={updateSelectedStatus} disabled={!selected || updating || !newStatus} className="bg-luxury-green text-white px-6 py-2 text-sm tracking-[0.12em] uppercase font-light hover:opacity-90 transition-opacity rounded-md disabled:opacity-50">
                {updating ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

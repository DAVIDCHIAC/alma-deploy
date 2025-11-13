"use client"

import { useEffect, useMemo, useState } from "react"
import { Package, ShoppingCart, Users, AlertTriangle, DollarSign, ArrowUpRight } from "lucide-react"

type AdminProduct = { id: number; name: string; category: string; stock: number; images?: string[] }
type OrderItem = { id: number; name: string; price_number?: number; quantity: number }
type UserSummary = { id: number; name: string; email: string; address?: string }
type Order = { id: number; items: OrderItem[]; subtotal: number; taxes: number; total: number; status: string; created_at: string; user?: UserSummary | null }

export const Dashboard = () => {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<UserSummary[]>([])
  const [categories, setCategories] = useState<string[]>([])

  const API_BASE = (import.meta as any).env?.VITE_API_BASE

  const resolveImageUrl = (img?: string | null) => {
    if (!img) return "/placeholder.svg"
    if (/^https?:\/\//i.test(img)) return img
    return `${API_BASE}/storage/${img}`
  }

  const fetchAll = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      const [prodRes, ordRes, usrRes, catRes] = await Promise.all([
        fetch(`${API_BASE}/api/products`, { headers: { Accept: "application/json" } }),
        fetch(`${API_BASE}/api/orders`, { headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) } }),
        fetch(`${API_BASE}/api/users`, { headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) } }),
        fetch(`${API_BASE}/api/categories`, { headers: { Accept: "application/json" } }),
      ])
      const prods = await prodRes.json()
      const ords = await ordRes.json()
      const usrs = await usrRes.json()
      const cats = await catRes.json()
      setProducts(Array.isArray(prods) ? prods : [])
      setOrders(Array.isArray(ords) ? ords : [])
      setUsers(Array.isArray(usrs) ? usrs : [])
      setCategories(Array.isArray(cats) ? cats.map((c: any) => c.name) : [])
    } catch {
      setProducts([])
      setOrders([])
      setUsers([])
      setCategories([])
    } finally {
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const lowStockProducts = useMemo(() => products.filter((p) => (p.stock ?? 0) < 10), [products])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1
    })
    categories.forEach((c) => {
      if (counts[c] === undefined) counts[c] = 0
    })
    return counts
  }, [products, categories])

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
  const statusClass = (s: string) => {
    if (s === "pending_payment") return "bg-yellow-100 text-yellow-800"
    if (s === "paid") return "bg-green-100 text-green-800"
    if (s === "processing") return "bg-blue-100 text-blue-800"
    if (s === "shipped") return "bg-blue-100 text-blue-800"
    if (s === "delivered") return "bg-green-100 text-green-800"
    if (s === "cancelled" || s === "rejected" || s === "failed") return "bg-red-100 text-red-800"
    return "bg-gray-100 text-gray-800"
  }

  const monthRevenueBars = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const days = new Date(year, month + 1, 0).getDate()
    const vals = Array.from({ length: days }, () => 0)
    orders.forEach((o) => {
      const d = new Date(o.created_at)
      if (d.getMonth() !== month || d.getFullYear() !== year) return
      if (["paid", "shipped", "delivered"].includes(o.status)) {
        const idx = d.getDate() - 1
        vals[idx] += o.total || 0
      }
    })
    return vals
  }, [orders])
  const maxValue = useMemo(() => Math.max(1, ...monthRevenueBars), [monthRevenueBars])

  const stats = useMemo(() => {
    const pendientes = orders.filter((o) => o.status === "pending_payment").length
    const ingresosMes = monthRevenueBars.reduce((a, b) => a + b, 0)
    return [
      { label: "Total Productos", value: products.length.toString(), icon: Package, growth: "", isPositive: true, color: "text-blue-600" },
      { label: "Pedidos Pendientes", value: pendientes.toString(), icon: ShoppingCart, growth: "", isPositive: true, color: "text-green-600" },
      { label: "Clientes Registrados", value: users.length.toString(), icon: Users, growth: "", isPositive: true, color: "text-purple-600" },
      { label: "Ingresos del Mes", value: formatCOP(ingresosMes), icon: DollarSign, growth: "", isPositive: true, color: "text-orange-600" },
    ]
  }, [products.length, orders, users.length, monthRevenueBars])

  const recentOrders = useMemo(() => {
    const sorted = [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return sorted.slice(0, 8).map((o) => {
      const first = Array.isArray(o.items) && o.items.length ? o.items[0] : null
      const productLabel = first ? `${first.name} ${first.quantity ? `x${first.quantity}` : ''}` : `${o.items.length} ítems`
      const when = new Date(o.created_at)
      const diffMs = Date.now() - when.getTime()
      const diffH = Math.floor(diffMs / (1000 * 60 * 60))
      const timeLabel = diffH < 24 ? `Hace ${diffH}h` : `Hace ${Math.floor(diffH / 24)}d`
      return { id: `#${o.id}`, customer: o.user?.name || `Usuario ${o.user?.id ?? ''}`, product: productLabel, status: o.status, amount: formatCOP(o.total), time: timeLabel }
    })
  }, [orders])

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extralight tracking-[0.3em] mb-2 text-luxury-text uppercase">Dashboard</h1>
        <p className="text-muted-foreground tracking-wider mb-12">Resumen general de la tienda</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-light text-green-600`}>
                  <ArrowUpRight size={16} />
                </div>
              </div>
              <p className="text-xs tracking-wider text-muted-foreground mb-1 uppercase">{stat.label}</p>
              <p className="text-3xl font-extralight tracking-wider text-luxury-text">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-extralight tracking-[0.2em] text-luxury-text uppercase">Ventas</h2>
                <p className="text-sm text-muted-foreground tracking-wide">Evolución de ventas</p>
              </div>
              <div className="flex gap-2">
                {["week", "month", "year"].map((period) => (
                  <button key={period} className={`px-3 py-1 text-xs tracking-wider uppercase transition-colors rounded-md ${period === "month" ? "bg-luxury-green text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{period === "week" ? "Semana" : period === "month" ? "Mes" : "Año"}</button>
                ))}
              </div>
            </div>
            <div className="flex items-end gap-1 h-48">
              {monthRevenueBars.map((value, idx) => (
                <div key={idx} className="flex-1 flex flex-col justify-end">
                  <div className="bg-luxury-green/20 hover:bg-luxury-green/40 transition-colors rounded-t" style={{ height: `${(value / maxValue) * 100}%` }} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="text-yellow-600" size={20} />
              <h2 className="text-lg font-extralight tracking-[0.2em] text-luxury-text uppercase">Stock Bajo</h2>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded transition-colors">
                    <div className="w-12 h-12 rounded overflow-hidden bg-gray-100">
                      <img src={resolveImageUrl(product.images?.[0] || null)} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-light tracking-wide truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground tracking-wide">Stock: {product.stock}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground tracking-wide">No hay productos con stock bajo</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-12">
          <h2 className="text-xl font-extralight tracking-[0.2em] mb-6 text-luxury-text uppercase">Categorías</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category) => {
              const count = categoryCounts[category] || 0
              const percentage = products.length > 0 ? (count / products.length) * 100 : 0
              return (
                <div key={category} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm tracking-wider font-light">{category}</p>
                    <p className="text-lg font-extralight tracking-wide text-luxury-text">{count}</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-luxury-green h-2 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                  </div>
                  {count < 5 && count > 0 && <p className="text-xs text-yellow-600 mt-1">Pocos productos</p>}
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-8 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-extralight tracking-[0.2em] text-luxury-text uppercase">Pedidos Recientes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-luxury-gray">
                <tr>
                  <th className="px-8 py-4 text-left text-xs tracking-[0.15em] text-luxury-text uppercase font-light">ID Pedido</th>
                  <th className="px-8 py-4 text-left text-xs tracking-[0.15em] text-luxury-text uppercase font-light">Cliente</th>
                  <th className="px-8 py-4 text-left text-xs tracking-[0.15em] text-luxury-text uppercase font-light">Producto</th>
                  <th className="px-8 py-4 text-left text-xs tracking-[0.15em] text-luxury-text uppercase font-light">Estado</th>
                  <th className="px-8 py-4 text-left text-xs tracking-[0.15em] text-luxury-text uppercase font-light">Monto</th>
                  <th className="px-8 py-4 text-left text-xs tracking-[0.15em] text-luxury-text uppercase font-light">Tiempo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrders.map((order, index) => (
                  <tr key={index} className="hover:bg-luxury-gray/30 transition-colors">
                    <td className="px-8 py-5 text-sm tracking-wide font-light">{order.id}</td>
                    <td className="px-8 py-5 text-sm tracking-wide font-light">{order.customer}</td>
                    <td className="px-8 py-5 text-sm tracking-wide font-light">{order.product}</td>
                    <td className="px-8 py-5">
                      <span className={`inline-block px-3 py-1 text-xs tracking-wider uppercase ${statusClass(order.status)}`}>{labelForStatus(order.status)}</span>
                    </td>
                    <td className="px-8 py-5 text-sm tracking-wide font-light">{order.amount}</td>
                    <td className="px-8 py-5 text-sm tracking-wide font-light text-muted-foreground">{order.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Plus, Edit2, Trash2, Search } from "lucide-react"
import CreateProduct from "./CreateProduct"

export const Products = () => {
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [currentProduct, setCurrentProduct] = useState<any | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)

  type AdminProduct = {
    id: number
    name: string
    category: string
    price_label?: string
    stock: number
    images?: string[]
  }

  const [products, setProducts] = useState<AdminProduct[]>([])

  const API_BASE = (import.meta as any).env?.VITE_API_BASE
  const resolveImageUrl = (img?: string | null) => {
    if (!img) return '/placeholder.svg'
    if (/^https?:\/\//i.test(img)) return img
    return `${API_BASE}/storage/${img}`
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const API_BASE = (import.meta as any).env?.VITE_API_BASE
      const res = await fetch(`${API_BASE}/api/products`, { headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error('Error al cargar productos')
      const data = await res.json()
      setProducts(data)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (!showModal) fetchProducts()
  }, [showModal])

  const handleDelete = async (id: number) => {
    try {
      const API_BASE = (import.meta as any).env?.VITE_API_BASE
      const res = await fetch(`${API_BASE}/api/products/${id}`, { method: 'DELETE', headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error('Error al eliminar')
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch {}
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-extralight tracking-[0.3em] mb-2 text-luxury-text uppercase">Productos</h1>
            <p className="text-muted-foreground tracking-wider">Gestiona tu catálogo de productos</p>
          </div>
          <button
            onClick={() => {
              setModalMode("create")
              setCurrentProduct(null)
              setShowModal(true)
            }}
              className="border border-gray-200 px-6 py-3 text-sm tracking-[0.12em] uppercase font-light hover:bg-luxury-gray/60 transition-colors flex items-center gap-2 rounded-md"
          >
            <Plus size={18} />
            Nuevo Producto
          </button>
        </div>

        {showModal && (
          <CreateProduct
            asModal
            mode={modalMode}
            initialProduct={currentProduct}
            onCancel={() => setShowModal(false)}
            onSaved={(saved) => {
              setProducts((prev) => {
                const exists = prev.some((p) => p.id === saved.id)
                return exists ? prev.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...prev]
              })
            }}
          />
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 bg-white text-sm tracking-wide focus:outline-none focus:ring-1 focus:ring-luxury-burgundy transition-colors rounded-md"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(loading ? [] : products)
            .filter((p) =>
              [p.name, p.category, p.price_label ?? '']
                .some((field) => field.toLowerCase().includes(searchTerm.toLowerCase())),
            )
            .map((product) => (
              <div key={product.id} className="group">
                <div className="aspect-square overflow-hidden bg-zinc-50 mb-4">
                  <img
                    src={resolveImageUrl(product.images?.[0] || null)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="text-xs font-normal tracking-wide mb-1.5 text-black/60 uppercase">{product.category}</p>
                <h3 className="text-sm font-light tracking-wide mb-1.5 text-black">{product.name}</h3>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-xs font-normal tracking-wide text-[#314737]">{product.price_label ?? ''}</p>
                  <p
                    className={`text-xs tracking-wide ${product.stock < 10 ? "text-yellow-600 font-medium" : "text-black/60"}`}
                  >
                    Stock: {product.stock}
                  </p>
                </div>
                {product.images && product.images.length > 1 && (
                  <div className="flex gap-2 mb-4">
                    {product.images.slice(1, 5).map((img, idx) => (
                      <div key={idx} className="w-10 h-10 rounded overflow-hidden border border-gray-200">
                        <img
                          src={resolveImageUrl(img)}
                          alt={`miniatura-${idx}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      setModalMode("edit")
                      setCurrentProduct(product)
                      setShowModal(true)
                    }}
                    className="flex-1 border border-[#314737] text-[#314737] px-4 py-2 text-sm tracking-wide uppercase font-light hover:bg-[#314737] hover:text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit2 size={14} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 border border-red-600 text-red-600 px-4 py-2 text-sm tracking-wide uppercase font-light hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect, useMemo } from "react"
const API_BASE = (import.meta as any).env?.VITE_API_BASE
import { Plus, Edit2, Trash2, FolderTree, AlertCircle } from "lucide-react"
import { addToast } from "@heroui/react"

export const Categories = () => {
  const [categories, setCategories] = useState<string[]>([])

  const [newCategory, setNewCategory] = useState("")
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState("")

  const [products, setProducts] = useState<{ id: number; category: string }[]>([])

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch(`${API_BASE}/api/categories`, { headers: { Accept: "application/json" } }),
          fetch(`${API_BASE}/api/products`, { headers: { Accept: "application/json" } }),
        ])
        const cats = await catRes.json()
        const prods = await prodRes.json()
        setCategories(Array.isArray(cats) ? cats.map((c: any) => c.name) : [])
        setProducts(Array.isArray(prods) ? prods.map((p: any) => ({ id: p.id, category: p.category })) : [])
      } catch {
        setCategories([])
        setProducts([])
      }
    }
    fetchAll()
  }, [])

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

  

  const addCategory = async () => {
    const name = newCategory.trim()
    if (!name) {
      addToast({ title: "Error", description: "Ingresa un nombre válido", timeout: 3000 })
      return
    }
    if (categories.includes(name)) {
      addToast({ title: "Error", description: "Esta categoría ya existe", timeout: 3000 })
      return
    }
    try {
      const res = await fetch(`${API_BASE}/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error()
      const cat = await res.json()
      setCategories((prev) => [...prev, cat.name])
      setNewCategory("")
      addToast({ title: "Categoría agregada", description: "Se creó la categoría", timeout: 3000 })
    } catch {
      addToast({ title: "Error", description: "No se pudo agregar la categoría", timeout: 3000 })
    }
  }

  const startEdit = (name: string) => {
    setEditingCategory(name)
    setEditingValue(name)
  }

  const saveEdit = async () => {
    const oldName = editingCategory
    const newName = editingValue.trim()
    if (!oldName || !newName) {
      addToast({ title: "Error", description: "Nombre inválido", timeout: 3000 })
      setEditingCategory(null)
      setEditingValue("")
      return
    }
    if (oldName === newName) {
      setEditingCategory(null)
      setEditingValue("")
      return
    }
    if (categories.includes(newName) && newName !== oldName) {
      addToast({ title: "Error", description: "Esta categoría ya existe", timeout: 3000 })
      return
    }
    try {
      const listRes = await fetch(`${API_BASE}/api/categories`, { headers: { Accept: "application/json" } })
      const cats = await listRes.json()
      const cat = Array.isArray(cats) ? cats.find((c: any) => c.name === oldName) : null
      if (!cat) throw new Error()
      const res = await fetch(`${API_BASE}/api/categories/${cat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name: newName }),
      })
      if (!res.ok) throw new Error()
      setCategories((prev) => prev.map((c) => (c === oldName ? newName : c)))
      setEditingCategory(null)
      setEditingValue("")
      addToast({ title: "Categoría actualizada", description: "Se guardaron los cambios", timeout: 3000 })
    } catch {
      addToast({ title: "Error", description: "No se pudo actualizar la categoría", timeout: 3000 })
    }
  }

  const deleteCategory = async (name: string) => {
    const count = categoryCounts[name] || 0
    if (count > 0) {
      addToast({ title: "Error", description: `No puedes eliminar una categoría con ${count} productos`, timeout: 3000 })
      return
    }
    try {
      const listRes = await fetch(`${API_BASE}/api/categories`, { headers: { Accept: "application/json" } })
      const cats = await listRes.json()
      const cat = Array.isArray(cats) ? cats.find((c: any) => c.name === name) : null
      if (!cat) throw new Error()
      const res = await fetch(`${API_BASE}/api/categories/${cat.id}`, { method: "DELETE", headers: { Accept: "application/json" } })
      if (!res.ok) throw new Error()
      setCategories((prev) => prev.filter((c) => c !== name))
      addToast({ title: "Categoría eliminada", description: "Se eliminó la categoría", timeout: 3000 })
    } catch {
      addToast({ title: "Error", description: "No se pudo eliminar la categoría", timeout: 3000 })
    }
  }

  return (
    <div className="p-8">
      <div>
        <h1 className="text-4xl font-extralight tracking-[0.3em] mb-2 text-luxury-text uppercase">Categorías</h1>
        <p className="text-muted-foreground tracking-wider mb-12">Gestiona las categorías de productos</p>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-xl font-extralight tracking-[0.2em] mb-6 text-luxury-text uppercase">
            Agregar Nueva Categoría
          </h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
              placeholder="Nombre de la categoría"
              className="flex-1 px-4 py-3 border border-gray-200 bg-white text-sm tracking-wide focus:outline-none focus:ring-1 focus:ring-luxury-burgundy transition-colors rounded-md"
            />
            <button
              onClick={addCategory}
              className="bg-luxury-green text-white px-8 py-3 text-sm tracking-[0.12em] uppercase font-light hover:opacity-90 transition-opacity flex items-center gap-2 rounded-md"
            >
              <Plus size={18} />
              Agregar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => {
            const count = categoryCounts[category] || 0
            const percentage = products.length > 0 ? (count / products.length) * 100 : 0

            return (
              <div
                key={category}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-3 bg-luxury-green/10 rounded-lg">
                      <FolderTree className="text-luxury-green" size={24} />
                    </div>
                    <div className="flex-1">
                      {editingCategory === category ? (
                        <input
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                          onBlur={saveEdit}
                          className="text-xl font-light tracking-wider text-luxury-text border-b-2 border-luxury-green focus:outline-none w-full"
                          autoFocus
                        />
                      ) : (
                        <h3 className="text-xl font-light tracking-wider text-luxury-text">{category}</h3>
                      )}
                      <p className="text-sm text-muted-foreground tracking-wide mt-1">
                        {count} {count === 1 ? "producto" : "productos"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-luxury-green h-3 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground tracking-wide mt-1">
                    {percentage.toFixed(1)}% del catálogo
                  </p>
                </div>

                {count === 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
                    <AlertCircle className="text-yellow-600" size={16} />
                    <p className="text-xs text-yellow-700 tracking-wide">Sin productos asignados</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(category)}
                    className="flex-1 border border-gray-200 px-4 py-2 text-sm tracking-wider uppercase hover:bg-luxury-gray/60 transition-colors flex items-center justify-center gap-2 rounded-md"
                  >
                    <Edit2 size={14} />
                    Editar
                  </button>
                  <button
                    onClick={() => deleteCategory(category)}
                    disabled={count > 0}
                    className={`border px-4 py-2 text-sm tracking-wider uppercase transition-colors flex items-center justify-center gap-2 rounded-md ${
                      count > 0
                        ? "border-gray-200 text-gray-400 cursor-not-allowed"
                        : "border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    }`}
                  >
                    <Trash2 size={14} />
                    Eliminar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Categories

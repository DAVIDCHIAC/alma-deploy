"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, ShieldCheck, ShieldX } from "lucide-react"
import { addToast } from "@heroui/react"

type AdminUser = {
  id: number
  name: string
  email: string
  phone?: string | null
  address?: string | null
  bio?: string | null
  is_admin: boolean
}

export const Users = () => {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const API_BASE = (import.meta as any).env?.VITE_API_BASE

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      const res = await fetch(`${API_BASE}/api/users`, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      if (!res.ok) throw new Error("Error al cargar usuarios")
      const data = await res.json()
      const arr: AdminUser[] = Array.isArray(data) ? data : []
      setUsers(arr)
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => [u.name, u.email, u.phone ?? "", u.address ?? ""].some((f) => f.toLowerCase().includes(q)))
  }, [users, searchTerm])

  const toggleAdmin = async (u: AdminUser) => {
    const next = !u.is_admin
    const token = localStorage.getItem("auth_token")
    if (!token) return
    setUpdatingId(u.id)
    try {
      const res = await fetch(`${API_BASE}/api/users/${u.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_admin: next }),
      })
      if (!res.ok) throw new Error("No se pudo actualizar")
      const updated: AdminUser = await res.json()
      setUsers((prev) => prev.map((it) => (it.id === updated.id ? updated : it)))
      addToast({ title: next ? "Usuario ahora es admin" : "Usuario ya no es admin", description: `${updated.name} (${updated.email})`, timeout: 3000 })
    } catch {
      addToast({ title: "Error", description: "No se pudo actualizar el rol", timeout: 3000 })
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-extralight tracking-[0.3em] mb-2 text-luxury-text uppercase">Usuarios</h1>
            <p className="text-muted-foreground tracking-wider">Gestiona los usuarios y sus permisos</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar usuarios..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 bg-white text-sm tracking-wide focus:outline-none focus:ring-1 focus:ring-luxury-burgundy transition-colors rounded-md"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-luxury-gray">
                <tr>
                  <th className="px-6 py-4 text-left text-xs tracking-[0.15em] text-luxury-text uppercase font-light">Nombre</th>
                  <th className="px-6 py-4 text-left text-xs tracking-[0.15em] text-luxury-text uppercase font-light">Email</th>
                  <th className="px-6 py-4 text-left text-xs tracking-[0.15em] text-luxury-text uppercase font-light">Teléfono</th>
                  <th className="px-6 py-4 text-left text-xs tracking-[0.15em] text-luxury-text uppercase font-light">Dirección</th>
                  <th className="px-6 py-4 text-left text-xs tracking-[0.15em] text-luxury-text uppercase font-light">Rol</th>
                  <th className="px-6 py-4 text-left text-xs tracking-[0.15em] text-luxury-text uppercase font-light">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td className="px-6 py-5 text-sm" colSpan={6}>Cargando usuarios...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td className="px-6 py-5 text-sm" colSpan={6}>No hay usuarios</td></tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-luxury-gray/30 transition-colors">
                      <td className="px-6 py-5 text-sm tracking-wide font-light">{u.name}</td>
                      <td className="px-6 py-5 text-sm tracking-wide font-light">{u.email}</td>
                      <td className="px-6 py-5 text-sm tracking-wide font-light">{u.phone || ""}</td>
                      <td className="px-6 py-5 text-sm tracking-wide font-light">{u.address || ""}</td>
                      <td className="px-6 py-5">
                        <span className={`inline-block px-3 py-1 text-xs tracking-wider uppercase ${u.is_admin ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>{u.is_admin ? "Admin" : "Usuario"}</span>
                      </td>
                      <td className="px-6 py-5">
                        <button
                          onClick={() => toggleAdmin(u)}
                          disabled={updatingId === u.id}
                          className={`border px-3 py-1 text-xs tracking-wider uppercase transition-colors flex items-center gap-2 rounded-md ${u.is_admin ? "border-red-600 text-red-600 hover:bg-red-600 hover:text-white" : "border-[#314737] text-[#314737] hover:bg-[#314737] hover:text-white"}`}
                        >
                          {u.is_admin ? <ShieldX size={14} /> : <ShieldCheck size={14} />}
                          {updatingId === u.id ? "Actualizando..." : u.is_admin ? "Quitar admin" : "Hacer admin"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Users
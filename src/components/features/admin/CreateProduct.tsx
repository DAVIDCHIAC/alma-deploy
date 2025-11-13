"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, X, Upload, Trash2, GripVertical } from "lucide-react"
import { addToast } from "@heroui/react"

type CreateProductProps = {
  mode?: "create" | "edit"
  initialProduct?: {
    id?: number
    name?: string
    category?: string
    price?: string
    price_label?: string
    stock?: number | ""
    image?: string
    images?: string[]
    sku?: string
    description?: string
    specs?: string
    specifications?: string[]
  } | null
  asModal?: boolean
  onCancel?: () => void
  onSaved?: (product: any) => void
}

export const CreateProduct = ({
  mode = "create",
  initialProduct = null,
  asModal = false,
  onCancel,
  onSaved,
}: CreateProductProps) => {
  const navigate = useNavigate()
  const API_BASE = (import.meta as any).env?.VITE_API_BASE
  const [categories, setCategories] = useState<string[]>([])
  const [category, setCategory] = useState<string>("")
  const [name, setName] = useState("")
  
  useEffect(() => {
    const loadCats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/categories`, { headers: { Accept: "application/json", "ngrok-skip-browser-warning": "1" } })
        const data = await res.json()
        const names = Array.isArray(data) ? data.map((c: any) => c.name) : []
        setCategories(names)
        if (!initialProduct && !category && names.length > 0) setCategory(names[0])
      } catch {
        setCategories([])
      }
    }
    loadCats()
  }, [])
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState<number | "">("")
  const [sku, setSku] = useState("")
  const [description, setDescription] = useState("")
  const [specs, setSpecs] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const resolveImageUrl = (img?: string) => {
    if (!img) return "/placeholder.svg"
    if (/^https?:\/\//i.test(img)) return img
    if (img.startsWith("data:")) return img
    return `${API_BASE}/storage/${img}`
  }

  const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
    new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("blob"))), type, quality)
    })

  const loadImageFromFile = (file: File) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })

  const compressImageToFile = async (file: File) => {
    const img = await loadImageFromFile(file)
    const maxDim = 1600
    const ratio = Math.min(1, maxDim / Math.max(img.width, img.height))
    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.round(img.width * ratio))
    canvas.height = Math.max(1, Math.round(img.height * ratio))
    const ctx = canvas.getContext("2d")!
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    let quality = 0.8
    let blob = await canvasToBlob(canvas, "image/jpeg", quality)
    while (blob.size > 2 * 1024 * 1024 && quality > 0.5) {
      quality -= 0.1
      blob = await canvasToBlob(canvas, "image/jpeg", quality)
    }
    const outFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: "image/jpeg" })
    const dataUrl = await new Promise<string>((resolve) => {
      const r = new FileReader()
      r.onloadend = () => resolve(r.result as string)
      r.readAsDataURL(outFile)
    })
    return { file: outFile, dataUrl }
  }

  const processFiles = async (files: File[]) => {
    for (const f of files) {
      if (!f.type.startsWith("image/")) continue
      try {
        const { file, dataUrl } = await compressImageToFile(f)
        setImages((prev) => [...prev, dataUrl])
        setImageFiles((prev) => [...prev, file])
      } catch {}
    }
  }

  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name ?? "")
      setCategory(initialProduct.category ?? categories[0])
      setPrice(initialProduct.price ?? initialProduct.price_label ?? "")
      setStock(initialProduct.stock ?? "")
      setSku(initialProduct.sku ?? "")
      setDescription(initialProduct.description ?? "")
      setSpecs(
        initialProduct.specs ?? (Array.isArray(initialProduct.specifications) ? initialProduct.specifications.join("\n") : "")
      )
      setImages(initialProduct.images ?? (initialProduct.image ? [initialProduct.image] : []))
    }
  }, [initialProduct, categories])

  useEffect(() => {
    const norm = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "")
    const namePart = norm(name).slice(0, 4)
    const catPart = norm(category).slice(0, 3)
    const rand = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(2, 6)
    setSku(`${catPart}-${namePart}-${rand}`)
  }, [name, category])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    await processFiles(Array.from(files))
  }

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (!files || files.length === 0) return
    processFiles(Array.from(files))
  }

  useEffect(() => {
    const onPaste = async (e: any) => {
      const items = e.clipboardData?.items
      if (!items) return
      const files: File[] = []
      for (let i = 0; i < items.length; i++) {
        const it = items[i]
        if (it.type && it.type.startsWith("image/")) {
          const f = it.getAsFile()
          if (f) files.push(f)
        }
      }
      if (files.length > 0) await processFiles(files)
    }
    window.addEventListener("paste", onPaste)
    return () => window.removeEventListener("paste", onPaste)
  }, [])

  const handleSubmit = async (e?: { preventDefault?: () => void }) => {
    e?.preventDefault?.()

    if (!name || !price || stock === "" || images.length === 0) {
      addToast({ title: "Error", description: "Completa nombre, precio, stock y al menos una imagen", timeout: 3000 })
      return
    }

    const parsePriceNumber = (label: string) => {
      const cleaned = label.replace(/[^0-9.,]/g, "").replace(/,/g, ".")
      const num = Number.parseFloat(cleaned)
      return Number.isFinite(num) ? num : 0
    }

    const specsArray = specs
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    const useFileUpload = imageFiles.length > 0
    const imageToSend = images[0]
    const safeImage = imageToSend && imageToSend.startsWith("data:") && imageToSend.length > 1024 ? null : imageToSend || null
    const safeImages = images.filter((img) => !(img.startsWith("data:") && img.length > 1024))

    const payload = {
      name,
      category,
      price_label: price,
      price_number: parsePriceNumber(price),
      stock: typeof stock === "number" ? stock : Number.parseInt(String(stock) || "0", 10),
      image: safeImage,
      images: safeImages,
      sku,
      description,
      specifications: specsArray,
    }

    try {
      const url = mode === "edit" && initialProduct?.id ? `${API_BASE}/api/products/${initialProduct.id}` : `${API_BASE}/api/products`
      const method = mode === "edit" && initialProduct?.id ? "PUT" : "POST"
      let res: Response
      if (useFileUpload) {
        const fd = new FormData()
        fd.append("name", name)
        fd.append("category", category)
        fd.append("price_label", price)
        fd.append("price_number", String(parsePriceNumber(price)))
        fd.append("stock", String(typeof stock === "number" ? stock : Number.parseInt(String(stock) || "0", 10)))
        fd.append("sku", sku)
        if (description) fd.append("description", description)
        imageFiles[0] && fd.append("image", imageFiles[0])
        imageFiles.forEach((f) => fd.append("images[]", f))
        // mantener rutas/URLs existentes no-base64
        safeImages.forEach((u) => {
          if (typeof u === "string" && !u.startsWith("data:")) fd.append("images[]", u)
        })
        specsArray.forEach((s) => fd.append("specifications[]", s))
        res = await fetch(url, {
          method,
          headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest", "ngrok-skip-browser-warning": "1" },
          body: fd,
        })
      } else {
        res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json", Accept: "application/json", "X-Requested-With": "XMLHttpRequest", "ngrok-skip-browser-warning": "1" },
          body: JSON.stringify(payload),
        })
      }
      if (!res.ok) {
        if (res.status === 422) {
          const err = await res.json().catch(() => null)
          const messages = err?.errors ? Object.values(err.errors).flat() : [err?.message || "Datos inválidos"]
          addToast({ title: "Error", description: String(messages[0] || "Verifica los campos obligatorios"), timeout: 3000 })
          return
        }
        throw new Error("Error al guardar el producto")
      }
      const saved = await res.json()
      addToast({ title: mode === "edit" ? "Producto actualizado" : "Producto creado", description: "Operación exitosa", timeout: 3000 })

      if (asModal) {
        onSaved?.(saved)
        onCancel?.()
      } else {
        navigate("/admin/products")
      }
    } catch (err) {
      addToast({ title: "Error", description: "No se pudo guardar el producto", timeout: 3000 })
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    setImages((prev) => {
      const newImages = [...prev]
      const [removed] = newImages.splice(fromIndex, 1)
      newImages.splice(toIndex, 0, removed)
      return newImages
    })
  }

  const form = (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 w-full max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs tracking-[0.15em] text-luxury-text uppercase mb-2 font-light">
              Nombre del Producto
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 bg-white text-sm tracking-wide focus:outline-none focus:ring-1 focus:ring-luxury-burgundy transition-colors rounded-md"
              placeholder="Ej: Seamaster Professional"
            />
          </div>
          <div>
            <label className="block text-xs tracking-[0.15em] text-luxury-text uppercase mb-2 font-light">
              Categoría
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 bg-white text-sm tracking-wide focus:outline-none focus:ring-1 focus:ring-luxury-burgundy transition-colors rounded-md"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs tracking-[0.15em] text-luxury-text uppercase mb-2 font-light">Precio</label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 bg-white text-sm tracking-wide focus:outline-none focus:ring-1 focus:ring-luxury-burgundy transition-colors rounded-md"
              placeholder="€5,900"
            />
          </div>
          <div>
            <label className="block text-xs tracking-[0.15em] text-luxury-text uppercase mb-2 font-light">Stock</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-200 bg-white text-sm tracking-wide focus:outline-none focus:ring-1 focus:ring-luxury-burgundy transition-colors rounded-md"
              placeholder="12"
            />
          </div>
          <div>
            <label className="block text-xs tracking-[0.15em] text-luxury-text uppercase mb-2 font-light">SKU (auto)</label>
            <input
              type="text"
              value={sku}
              readOnly
              className="w-full px-4 py-3 border border-gray-200 bg-gray-100 text-sm tracking-wide rounded-md"
              placeholder="Se genera automáticamente"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs tracking-[0.15em] text-luxury-text uppercase mb-2 font-light">
            Descripción
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 bg-white text-sm tracking-wide focus:outline-none focus:ring-1 focus:ring-luxury-burgundy transition-colors resize-none rounded-md"
            placeholder="Descripción detallada del producto..."
          />
        </div>

        <div>
          <label className="block text-xs tracking-[0.15em] text-luxury-text uppercase mb-2 font-light">
            Especificaciones
          </label>
          <textarea
            rows={4}
            value={specs}
            onChange={(e) => setSpecs(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 bg-white text-sm tracking-wide focus:outline-none focus:ring-1 focus:ring-luxury-burgundy transition-colors resize-none rounded-md"
            placeholder="Una especificación por línea..."
          />
        </div>

        <div>
          <label className="block text-xs tracking-[0.15em] text-luxury-text uppercase mb-3 font-light">
            Galería de Imágenes {images.length > 0 && `(${images.length})`}
          </label>

          <div className="mb-4">
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-luxury-green transition-colors bg-gray-50"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 tracking-wide">
                  <span className="font-light">Click para subir</span> o arrastra y suelta, o pega
                </p>
                <p className="text-xs text-gray-500 tracking-wide">PNG, JPG, WebP (MAX. 5MB)</p>
              </div>
              <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileUpload} />
            </label>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-luxury-green transition-colors"
                >
                  {idx === 0 && (
                    <div className="absolute top-2 left-2 z-10 bg-luxury-green text-white px-2 py-1 text-xs tracking-wider uppercase rounded">
                      Principal
                    </div>
                  )}
                  <img
                    src={resolveImageUrl(img)}
                    alt={`Producto ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => moveImage(idx, idx - 1)}
                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                        title="Mover izquierda"
                      >
                        <GripVertical size={16} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                    {idx < images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveImage(idx, idx + 1)}
                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                        title="Mover derecha"
                      >
                        <GripVertical size={16} className="rotate-180" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            onClick={handleSubmit}
            className="border border-gray-200 px-8 py-3 text-sm tracking-[0.12em] uppercase font-light text-white bg-[#314737] hover:bg-[#314737]/60 transition-colors rounded-md"
          >
            {mode === "edit" ? "Actualizar" : "Guardar Producto"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (asModal) onCancel?.()
              else navigate("/admin/products")
            }}
            className="border border-gray-200 px-8 py-3 text-sm tracking-[0.12em] uppercase font-light hover:bg-zinc-300 transition-colors rounded-md"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )

  if (asModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="absolute inset-0 bg-black/50 z-10 pointer-events-auto" onClick={onCancel} />
        <div className="relative z-20 w-[95vw] max-w-4xl pointer-events-auto">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h1 className="text-xl sm:text-2xl font-extralight tracking-[0.2em] text-luxury-text uppercase">
                  {mode === "edit" ? "Editar Producto" : "Nuevo Producto"}
                </h1>
                <p className="text-muted-foreground tracking-wider text-xs sm:text-sm">
                  Completa la información para el catálogo
                </p>
              </div>
              <button
                onClick={onCancel}
                className="border border-gray-200 px-3 py-2 text-xs sm:text-sm tracking-[0.12em] uppercase font-light hover:bg-luxury-gray/60 transition-colors rounded-md flex items-center gap-2"
              >
                <X size={16} />
                Cerrar
              </button>
            </div>
            <div className="max-h-[75vh] overflow-y-auto p-6">{form}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extralight tracking-[0.2em] mb-2 text-luxury-text uppercase">
              Nuevo Producto
            </h1>
            <p className="text-muted-foreground tracking-wider">Completa la información para añadir al catálogo</p>
          </div>
          <button
            onClick={() => navigate("/admin/products")}
            className="border border-gray-200 px-6 py-3 text-sm tracking-[0.12em] uppercase font-light hover:bg-luxury-gray/60 transition-colors flex items-center gap-2 rounded-md"
          >
            <ArrowLeft size={18} />
            Volver
          </button>
        </div>
        {form}
      </div>
    </div>
  )
}

export default CreateProduct

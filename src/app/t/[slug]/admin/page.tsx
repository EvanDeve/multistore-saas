'use client'

import { useState, useEffect, useCallback } from 'react'
import { useStore } from '@/components/StoreProvider'
import type { Product, Category } from '@/lib/supabase'
import {
  Package, Plus, Pencil, Trash2, X, RefreshCw, Upload,
  LayoutGrid, Search, LogOut, Tag, Lock, AlertTriangle,
} from 'lucide-react'

type Tab = 'products' | 'categories'

export default function StoreAdminPage() {
  // ─── Auth State ──────────────────────────────────────────
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [authError, setAuthError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accessDenied, setAccessDenied] = useState(false)

  const { store } = useStore()

  // ─── Data State ──────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<Tab>('products')
  const [products, setProducts] = useState<(Product & { categories?: { name: string } })[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // ─── Product Form ────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  // ─── Category Form ───────────────────────────────────────
  const [isCategoryEditing, setIsCategoryEditing] = useState(false)
  const [categoryForm, setCategoryForm] = useState<Record<string, unknown>>({})

  // ─── Auth Helpers ────────────────────────────────────────

  const authHeaders = useCallback(() => ({
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  }), [accessToken])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setAuthError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        setAuthError(data.error || 'Error de autenticación')
        return
      }

      // Check if this user owns this store
      if (data.user.email.toLowerCase() !== store.admin_email.toLowerCase()) {
        setAccessDenied(true)
        return
      }

      setAccessToken(data.access_token)
    } catch {
      setAuthError('Error de conexión')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = () => {
    setAccessToken(null)
    setEmail('')
    setPassword('')
    setAccessDenied(false)
  }

  // ─── Data Fetching ───────────────────────────────────────

  const fetchProducts = useCallback(async () => {
    if (!accessToken) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/products', { headers: authHeaders() })
      const data = await res.json()
      if (res.ok) setProducts(data.products || [])
    } catch (err) {
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }, [accessToken, authHeaders])

  const fetchCategories = useCallback(async () => {
    if (!accessToken) return
    try {
      const res = await fetch('/api/admin/categories', { headers: authHeaders() })
      const data = await res.json()
      if (res.ok) setCategories(data.categories || [])
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }, [accessToken, authHeaders])

  useEffect(() => {
    if (accessToken) {
      fetchProducts()
      fetchCategories()
    }
  }, [accessToken, fetchProducts, fetchCategories])

  // ─── Product CRUD ────────────────────────────────────────

  const handleProductSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)

    try {
      let imageUrl = formData.image_url as string || ''

      // Upload image if selected
      if (selectedFile) {
        const uploadForm = new FormData()
        uploadForm.append('file', selectedFile)
        uploadForm.append('type', 'product')

        const uploadRes = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}` },
          body: uploadForm,
        })

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          imageUrl = uploadData.url
        } else {
          const err = await uploadRes.json()
          alert(err.error || 'Error subiendo imagen')
          return
        }
      }

      const payload = {
        name: formData.name,
        description: formData.description || '',
        price: Number(formData.price),
        compare_price: formData.compare_price ? Number(formData.compare_price) : null,
        category_id: formData.category_id || null,
        image_url: imageUrl,
        is_available: formData.is_available !== false,
        is_featured: formData.is_featured === true,
        sort_order: Number(formData.sort_order) || 0,
      }

      const isUpdate = !!(formData.id)
      const url = isUpdate ? `/api/admin/products/${formData.id}` : '/api/admin/products'
      const method = isUpdate ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Error guardando producto')
        return
      }

      setIsEditing(false)
      setFormData({})
      setSelectedFile(null)
      setPreviewUrl('')
      fetchProducts()
    } catch {
      alert('Error guardando producto')
    } finally {
      setIsUploading(false)
    }
  }

  const handleProductDelete = async (id: string) => {
    if (!confirm('¿Eliminar este producto permanentemente?')) return
    await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    fetchProducts()
  }

  const handleProductEdit = (product: Product) => {
    setFormData(product as unknown as Record<string, unknown>)
    setPreviewUrl(product.image_url || '')
    setSelectedFile(null)
    setIsEditing(true)
  }

  const handleProductAdd = () => {
    setFormData({ is_available: true, is_featured: false, sort_order: 0 })
    setPreviewUrl('')
    setSelectedFile(null)
    setIsEditing(true)
  }

  // ─── Category CRUD ───────────────────────────────────────

  const handleCategorySave = async (e: React.FormEvent) => {
    e.preventDefault()
    const isUpdate = !!(categoryForm.id)
    const url = isUpdate ? `/api/admin/categories/${categoryForm.id}` : '/api/admin/categories'
    const method = isUpdate ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: authHeaders(),
      body: JSON.stringify({
        name: categoryForm.name,
        sort_order: Number(categoryForm.sort_order) || 0,
        is_active: categoryForm.is_active !== false,
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      alert(err.error || 'Error guardando categoría')
      return
    }

    setIsCategoryEditing(false)
    setCategoryForm({})
    fetchCategories()
  }

  const handleCategoryDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría? Los productos asociados quedarán sin categoría.')) return
    await fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    fetchCategories()
    fetchProducts() // Refresh products since categories may have changed
  }

  // ─── File handling ───────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  // ─── Filtered products ──────────────────────────────────

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ─── ACCESS DENIED ──────────────────────────────────────

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 shadow-sm max-w-sm w-full border border-red-200 text-center rounded-xl">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-red-900 mb-2">Acceso Denegado</h1>
          <p className="text-red-700 text-sm mb-6">
            Tu cuenta no tiene permisos para administrar esta tienda.
          </p>
          <button
            onClick={handleLogout}
            className="text-sm font-semibold text-gray-500 hover:text-gray-900"
          >
            Intentar con otra cuenta
          </button>
        </div>
      </div>
    )
  }

  // ─── LOGIN FORM ─────────────────────────────────────────

  if (!accessToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 shadow-sm max-w-sm w-full border border-gray-200 rounded-xl">
          <div className="w-12 h-12 bg-black flex items-center justify-center mb-6 mx-auto rounded-xl">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-center text-black mb-2 tracking-tight">
            Panel de Administración
          </h1>
          <p className="text-center text-gray-500 text-sm mb-8">{store.name}</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black outline-none text-sm"
                placeholder="tu@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black outline-none text-sm"
                placeholder="••••••••"
                required
              />
            </div>
            {authError && (
              <p className="text-red-500 text-xs text-center font-medium">{authError}</p>
            )}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white text-xs font-bold uppercase tracking-widest py-4 transition-colors rounded-lg"
            >
              {isLoggingIn ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ─── ADMIN DASHBOARD ───────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">

      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-100 flex items-center gap-4">
          {store.logo_url ? (
            <img src={store.logo_url} alt="" className="w-8 h-8 object-contain rounded" />
          ) : (
            <div className="w-8 h-8 rounded flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: 'var(--color-primary)' }}>
              {store.name.charAt(0)}
            </div>
          )}
          <span className="font-semibold text-lg tracking-tight text-black truncate">{store.name}</span>
        </div>
        <nav className="p-4 flex-1">
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setActiveTab('products')}
                className={`flex items-center gap-3 px-4 py-3 w-full text-left font-medium text-sm rounded-lg transition-colors ${activeTab === 'products' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <LayoutGrid className="w-4 h-4" /> Productos
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('categories')}
                className={`flex items-center gap-3 px-4 py-3 w-full text-left font-medium text-sm rounded-lg transition-colors ${activeTab === 'categories' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Tag className="w-4 h-4" /> Categorías
              </button>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full text-left font-medium text-sm rounded-lg transition-colors">
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between shrink-0">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {activeTab === 'products' ? 'Productos' : 'Categorías'}
          </h1>
          <button
            onClick={activeTab === 'products' ? handleProductAdd : () => { setCategoryForm({ is_active: true, sort_order: 0 }); setIsCategoryEditing(true) }}
            className="bg-black text-white px-5 py-2.5 text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm rounded-lg"
          >
            <Plus className="w-4 h-4" /> Crear {activeTab === 'products' ? 'Producto' : 'Categoría'}
          </button>
        </header>

        {/* Content */}
        <div className="p-8 flex-1 overflow-y-auto">

          {activeTab === 'products' && (
            <>
              {/* Search bar */}
              <div className="bg-white border border-gray-200 rounded-xl p-3 mb-6 shadow-sm flex items-center gap-3">
                <div className="flex items-center gap-3 flex-1 px-3">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-0 focus:ring-0 outline-none text-sm"
                  />
                </div>
                <div className="text-xs font-semibold text-gray-400 px-4 border-l border-gray-100 uppercase tracking-widest hidden sm:block">
                  {filteredProducts.length} Artículos
                </div>
              </div>

              {/* Products table */}
              <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                {loading ? (
                  <div className="p-20 text-center text-gray-400 flex flex-col items-center">
                    <RefreshCw className="w-6 h-6 animate-spin mb-4 text-black" />
                    Cargando productos...
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="p-24 text-center">
                    <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No hay productos.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-200 text-gray-400 text-xs font-bold uppercase tracking-widest">
                          <th className="p-5">Producto</th>
                          <th className="p-5 text-right w-32">Precio</th>
                          <th className="p-5 text-center w-28">Estado</th>
                          <th className="p-5 w-40">Categoría</th>
                          <th className="p-5 text-center w-24">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredProducts.map(product => (
                          <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="p-5">
                              <div className="flex items-center gap-4">
                                <img src={product.image_url || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 object-cover rounded-md border border-gray-200 bg-white" />
                                <div>
                                  <div className="font-semibold text-sm text-gray-900 line-clamp-1">{product.name}</div>
                                  {product.is_featured && <span className="text-[10px] text-amber-600 font-bold uppercase">Destacado</span>}
                                </div>
                              </div>
                            </td>
                            <td className="p-5 text-right font-medium text-gray-900 text-sm">
                              ₡{product.price.toLocaleString()}
                              {product.compare_price && (
                                <div className="text-xs text-gray-400 line-through">₡{product.compare_price.toLocaleString()}</div>
                              )}
                            </td>
                            <td className="p-5 text-center">
                              <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full border ${product.is_available ? 'border-green-200 text-green-700 bg-green-50' : 'border-red-200 text-red-700 bg-red-50'}`}>
                                {product.is_available ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td className="p-5 text-gray-500 text-xs font-medium">
                              {product.categories ? product.categories.name : '—'}
                            </td>
                            <td className="p-5">
                              <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleProductEdit(product)} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-md" title="Editar">
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleProductDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md" title="Eliminar">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'categories' && (
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
              {categories.length === 0 ? (
                <div className="p-24 text-center">
                  <Tag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No hay categorías.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Tag className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{cat.name}</p>
                          <p className="text-xs text-gray-400">/{cat.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${cat.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {cat.is_active ? 'Activa' : 'Inactiva'}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setCategoryForm(cat as unknown as Record<string, unknown>); setIsCategoryEditing(true) }} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-md">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleCategoryDelete(cat.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Product Edit Drawer */}
      {isEditing && (
        <>
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40" onClick={() => setIsEditing(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl flex flex-col border-l border-gray-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">{formData.id ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-900 bg-white shadow-sm border border-gray-200 p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <form id="product-form" onSubmit={handleProductSave} className="p-6 space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Nombre</label>
                  <input required type="text" value={(formData.name as string) || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black outline-none text-sm" />
                </div>
                {/* Price row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Precio (₡)</label>
                    <input required type="number" min="0" step="0.01" value={(formData.price as number) ?? ''} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Precio Tachado</label>
                    <input type="number" min="0" step="0.01" value={(formData.compare_price as number) ?? ''} onChange={e => setFormData({ ...formData, compare_price: e.target.value || null })} className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black outline-none text-sm" placeholder="Opcional" />
                  </div>
                </div>
                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Categoría</label>
                  <select value={(formData.category_id as string) || ''} onChange={e => setFormData({ ...formData, category_id: e.target.value || null })} className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black outline-none text-sm">
                    <option value="">Sin categoría</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                {/* Image */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Imagen</label>
                  <div className="border-2 border-dashed border-gray-200 p-6 text-center rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                    <input type="file" accept="image/*" id="img-upload" className="hidden" onChange={handleFileChange} />
                    <label htmlFor="img-upload" className="cursor-pointer flex flex-col items-center gap-2">
                      <Upload className="text-gray-400 w-5 h-5" />
                      <span className="text-sm font-medium text-gray-600">Seleccionar imagen</span>
                    </label>
                  </div>
                  {previewUrl && (
                    <div className="mt-3 relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => { setSelectedFile(null); setPreviewUrl(''); setFormData({ ...formData, image_url: '' }) }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Descripción</label>
                  <textarea rows={3} value={(formData.description as string) || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black outline-none text-sm" />
                </div>
                {/* Toggles */}
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={(formData.is_available as boolean) !== false} onChange={e => setFormData({ ...formData, is_available: e.target.checked })} className="rounded" />
                    Disponible
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={(formData.is_featured as boolean) === true} onChange={e => setFormData({ ...formData, is_featured: e.target.checked })} className="rounded" />
                    Destacado
                  </label>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-gray-100 bg-white grid grid-cols-2 gap-4 shrink-0">
              <button type="button" onClick={() => setIsEditing(false)} className="w-full bg-gray-50 border border-gray-200 text-gray-700 font-semibold text-sm rounded-lg py-3.5 hover:bg-gray-100 transition-colors">
                Cancelar
              </button>
              <button type="submit" form="product-form" disabled={isUploading} className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white shadow-md font-semibold text-sm rounded-lg py-3.5 transition-all flex justify-center items-center gap-2">
                {isUploading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Guardando...</> : 'Guardar'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Category Edit Modal */}
      {isCategoryEditing && (
        <>
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40" onClick={() => setIsCategoryEditing(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold">{categoryForm.id ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
              </div>
              <form onSubmit={handleCategorySave} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Nombre</label>
                  <input required type="text" value={(categoryForm.name as string) || ''} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Orden</label>
                  <input type="number" value={(categoryForm.sort_order as number) ?? 0} onChange={e => setCategoryForm({ ...categoryForm, sort_order: Number(e.target.value) })} className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black outline-none text-sm" />
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={(categoryForm.is_active as boolean) !== false} onChange={e => setCategoryForm({ ...categoryForm, is_active: e.target.checked })} className="rounded" />
                  Activa
                </label>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsCategoryEditing(false)} className="flex-1 bg-gray-50 border border-gray-200 text-gray-700 font-semibold text-sm rounded-lg py-3 hover:bg-gray-100">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 bg-black text-white font-semibold text-sm rounded-lg py-3 hover:bg-gray-800">
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

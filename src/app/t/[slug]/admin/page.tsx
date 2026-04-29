'use client'

import { useState, useEffect, useCallback } from 'react'
import { useStore } from '@/components/StoreProvider'
import type { Product, Category } from '@/lib/supabase'
import {
  Package, Plus, Pencil, Trash2, X, RefreshCw, Upload,
  LayoutDashboard, Search, LogOut, Tag, Lock, AlertTriangle,
  Settings, Menu, Star
} from 'lucide-react'

type Tab = 'inicio' | 'products' | 'categories' | 'settings'

export default function StoreAdminPage() {
  // ─── Auth State ──────────────────────────────────────────
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [authError, setAuthError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accessDenied, setAccessDenied] = useState(false)

  const { store } = useStore()

  // ─── Layout State ────────────────────────────────────────
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // ─── Data State ──────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<Tab>('inicio')
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
    fetchProducts()
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

  // ─── Derived Metrics ────────────────────────────────────

  const totalProducts = products.length
  const totalCategories = categories.length
  const featuredProducts = products.filter(p => p.is_featured).length
  const recentProducts = [...products].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 5)

  // ─── ACCESS DENIED ──────────────────────────────────────

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 shadow-sm max-w-sm w-full border border-red-200 text-center rounded-2xl">
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 shadow-xl shadow-black/5 max-w-sm w-full border border-gray-100 rounded-3xl">
          <div className="w-14 h-14 bg-gray-950 flex items-center justify-center mb-6 mx-auto rounded-2xl shadow-inner">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-center text-gray-900 mb-2 tracking-tight">
            Admin Panel
          </h1>
          <p className="text-center text-gray-500 text-sm mb-8 font-medium">{store.name}</p>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-black outline-none text-sm transition-all"
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
                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-black outline-none text-sm transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            {authError && (
              <p className="text-red-500 text-sm text-center font-semibold bg-red-50 py-2 rounded-lg">{authError}</p>
            )}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-gray-950 hover:bg-gray-800 disabled:bg-gray-400 text-white text-sm font-bold tracking-wide py-4 transition-colors rounded-xl shadow-md"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              {isLoggingIn ? 'Verificando...' : 'Ingresar al Dashboard'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ─── ADMIN DASHBOARD ───────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          {store.logo_url ? (
            <img src={store.logo_url} alt="" className="w-8 h-8 object-contain rounded-lg border border-gray-100" />
          ) : (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: 'var(--color-primary)' }}>
              {store.name.charAt(0)}
            </div>
          )}
          <span className="font-bold text-gray-900 truncate max-w-[150px]">{store.name}</span>
        </div>
        <button onClick={() => setMobileMenuOpen(true)} className="p-2 -mr-2 text-gray-600">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col shrink-0 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full border-r border-gray-200'}`}>
        <div className="p-6 h-20 flex items-center justify-between md:border-b border-gray-100">
          <div className="flex items-center gap-3">
            {store.logo_url ? (
              <img src={store.logo_url} alt="" className="w-10 h-10 object-contain rounded-xl shadow-sm border border-gray-50" />
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-black shadow-sm" style={{ backgroundColor: 'var(--color-primary)' }}>
                {store.name.charAt(0)}
              </div>
            )}
            <span className="font-bold text-xl tracking-tight text-gray-900 truncate">{store.name}</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-400 md:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-1.5">
            <li>
              <button
                onClick={() => { setActiveTab('inicio'); setMobileMenuOpen(false) }}
                className={`flex items-center gap-3 px-4 py-3 w-full text-left font-semibold text-sm rounded-xl transition-all ${activeTab === 'inicio' ? 'bg-gray-50 text-gray-900 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <LayoutDashboard className="w-5 h-5" style={{ color: activeTab === 'inicio' ? 'var(--color-accent)' : undefined }} /> Inicio
              </button>
            </li>
            <li>
              <button
                onClick={() => { setActiveTab('products'); setMobileMenuOpen(false) }}
                className={`flex items-center gap-3 px-4 py-3 w-full text-left font-semibold text-sm rounded-xl transition-all ${activeTab === 'products' ? 'bg-gray-50 text-gray-900 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <Package className="w-5 h-5" style={{ color: activeTab === 'products' ? 'var(--color-accent)' : undefined }} /> Productos
              </button>
            </li>
            <li>
              <button
                onClick={() => { setActiveTab('categories'); setMobileMenuOpen(false) }}
                className={`flex items-center gap-3 px-4 py-3 w-full text-left font-semibold text-sm rounded-xl transition-all ${activeTab === 'categories' ? 'bg-gray-50 text-gray-900 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <Tag className="w-5 h-5" style={{ color: activeTab === 'categories' ? 'var(--color-accent)' : undefined }} /> Categorías
              </button>
            </li>
            <div className="pt-6 pb-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
              Avanzado
            </div>
            <li>
              <button
                onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false) }}
                className={`flex items-center gap-3 px-4 py-3 w-full text-left font-semibold text-sm rounded-xl transition-all ${activeTab === 'settings' ? 'bg-gray-50 text-gray-900 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <Settings className="w-5 h-5" style={{ color: activeTab === 'settings' ? 'var(--color-accent)' : undefined }} /> Configuración
              </button>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full text-left font-semibold text-sm rounded-xl transition-colors">
            <LogOut className="w-5 h-5" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-[calc(100vh-73px)] md:h-screen overflow-hidden">
        
        {/* Topbar (Desktop only) */}
        <header className="hidden md:flex bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-5 items-center justify-between shrink-0 sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight capitalize">
            {activeTab === 'inicio' ? 'Resumen' : activeTab}
          </h1>
          {(activeTab === 'products' || activeTab === 'categories') && (
            <button
              onClick={activeTab === 'products' ? handleProductAdd : () => { setCategoryForm({ is_active: true, sort_order: 0 }); setIsCategoryEditing(true) }}
              className="text-white px-6 py-2.5 text-sm font-bold hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-black/10 rounded-xl"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              <Plus className="w-4 h-4" /> Nuevo {activeTab === 'products' ? 'Producto' : 'Categoría'}
            </button>
          )}
        </header>

        {/* Content Scrollable Area */}
        <div className="p-4 md:p-8 flex-1 overflow-y-auto hide-scrollbar">
          
          {/* TAB: INICIO */}
          {activeTab === 'inicio' && (
            <div className="space-y-8 max-w-5xl">
              {/* Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-semibold mb-1">Productos Activos</p>
                    <p className="text-3xl font-black text-gray-900">{totalProducts}</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                    <Tag className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-semibold mb-1">Categorías</p>
                    <p className="text-3xl font-black text-gray-900">{totalCategories}</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                    <Star className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-semibold mb-1">Destacados</p>
                    <p className="text-3xl font-black text-gray-900">{featuredProducts}</p>
                  </div>
                </div>
              </div>

              {/* Recent Products */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">Últimos Productos</h2>
                <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
                  {recentProducts.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 font-medium">No hay productos aún.</div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {recentProducts.map(product => (
                        <div key={product.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                          <img src={product.image_url || 'https://via.placeholder.com/60'} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100 border border-gray-200" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">{product.name}</h3>
                            <p className="text-gray-500 text-xs mt-0.5">₡{product.price.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className={`inline-flex px-2 py-1 text-[10px] font-bold rounded-full ${product.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {product.is_available ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="max-w-6xl">
              {/* Mobile CTA (only visible on mobile) */}
              <button
                onClick={handleProductAdd}
                className="md:hidden w-full mb-4 text-white px-6 py-3.5 text-sm font-bold shadow-lg rounded-xl flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--color-accent)' }}
              >
                <Plus className="w-4 h-4" /> Nuevo Producto
              </button>

              <div className="bg-white border border-gray-200 rounded-2xl p-2 sm:p-3 mb-6 shadow-sm flex items-center gap-3">
                <div className="flex items-center gap-3 flex-1 px-3">
                  <Search className="w-5 h-5 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Buscar producto por nombre..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-0 focus:ring-0 outline-none text-sm py-2"
                  />
                </div>
                <div className="text-xs font-bold text-gray-400 px-4 border-l border-gray-100 uppercase tracking-widest hidden sm:block">
                  {filteredProducts.length} Artículos
                </div>
              </div>

              <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
                {loading ? (
                  <div className="p-20 text-center text-gray-400 flex flex-col items-center">
                    <RefreshCw className="w-8 h-8 animate-spin mb-4 text-gray-300" />
                    Cargando catálogo...
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="p-24 text-center">
                    <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No se encontraron productos.</p>
                  </div>
                ) : (
                  <>
                    <div className="md:hidden divide-y divide-gray-100">
                      {filteredProducts.map(product => (
                        <div key={product.id} className="flex gap-4 p-4 hover:bg-gray-50 transition-colors">
                          <img src={product.image_url || 'https://via.placeholder.com/60'} alt="" className="w-16 h-16 object-cover rounded-xl border border-gray-200 bg-white shrink-0" />
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-bold text-sm text-gray-900 line-clamp-2 leading-tight pr-2">{product.name}</h3>
                              <div className="flex items-center gap-1 shrink-0 bg-gray-50/80 p-0.5 rounded-lg border border-gray-100/50">
                                <button onClick={() => handleProductEdit(product)} className="p-2 text-gray-500 hover:text-black rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleProductDelete(product.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-black text-gray-900">₡{product.price.toLocaleString()}</span>
                                {product.compare_price && <span className="text-xs text-gray-400 line-through">₡{product.compare_price.toLocaleString()}</span>}
                              </div>
                              <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${product.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {product.is_available ? 'Activo' : 'Inactivo'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-400 text-xs font-bold uppercase tracking-widest">
                            <th className="p-4 sm:p-5">Producto</th>
                            <th className="p-4 sm:p-5 text-right w-32">Precio</th>
                            <th className="p-4 sm:p-5 text-center w-28">Estado</th>
                            <th className="p-4 sm:p-5 w-40">Categoría</th>
                            <th className="p-4 sm:p-5 text-center w-24">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredProducts.map(product => (
                            <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="p-4 sm:p-5">
                                <div className="flex items-center gap-4">
                                  <img src={product.image_url || 'https://via.placeholder.com/40'} alt="" className="w-12 h-12 object-cover rounded-lg border border-gray-200 bg-white shrink-0" />
                                  <div>
                                    <div className="font-bold text-sm text-gray-900 line-clamp-1">{product.name}</div>
                                    {product.is_featured && <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wide">★ Destacado</span>}
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 sm:p-5 text-right font-bold text-gray-900 text-sm">
                                ₡{product.price.toLocaleString()}
                                {product.compare_price && (
                                  <div className="text-xs text-gray-400 line-through font-medium mt-0.5">₡{product.compare_price.toLocaleString()}</div>
                                )}
                              </td>
                              <td className="p-4 sm:p-5 text-center">
                                <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg ${product.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {product.is_available ? 'Activo' : 'Inactivo'}
                                </span>
                              </td>
                              <td className="p-4 sm:p-5 text-gray-500 text-xs font-semibold">
                                {product.categories ? product.categories.name : '—'}
                              </td>
                              <td className="p-4 sm:p-5">
                                <div className="flex items-center justify-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => handleProductEdit(product)} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px]" title="Editar">
                                    <Pencil className="w-4 h-4 mx-auto" />
                                  </button>
                                  <button onClick={() => handleProductDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-[44px] min-w-[44px]" title="Eliminar">
                                    <Trash2 className="w-4 h-4 mx-auto" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="max-w-4xl">
              {/* Mobile CTA */}
              <button
                onClick={() => { setCategoryForm({ is_active: true, sort_order: 0 }); setIsCategoryEditing(true) }}
                className="md:hidden w-full mb-4 text-white px-6 py-3.5 text-sm font-bold shadow-lg rounded-xl flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--color-accent)' }}
              >
                <Plus className="w-4 h-4" /> Nueva Categoría
              </button>

              <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
                {categories.length === 0 ? (
                  <div className="p-24 text-center">
                    <Tag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No hay categorías.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {categories.map(cat => (
                      <div key={cat.id} className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                            <Tag className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-900">{cat.name}</p>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">/{cat.slug}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`hidden sm:inline-flex px-2.5 py-1 text-xs font-bold rounded-lg ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {cat.is_active ? 'Activa' : 'Inactiva'}
                          </span>
                          <div className="flex gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setCategoryForm(cat as unknown as Record<string, unknown>); setIsCategoryEditing(true) }} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg">
                              <Pencil className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleCategoryDelete(cat.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl">
              <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
                <Settings className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Configuración</h2>
                <p className="text-gray-500 mb-6">Esta sección está en desarrollo. Próximamente podrás editar los colores y la información de tu tienda directamente desde aquí.</p>
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider">
                  Próximamente
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Product Edit Slide-Over */}
      {isEditing && (
        <>
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsEditing(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-full md:max-w-lg md:w-[40%] bg-white shadow-2xl flex flex-col border-l border-gray-200 transform transition-transform">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white shrink-0">
              <h2 className="text-xl font-black text-gray-900">{formData.id ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <form id="product-form" onSubmit={handleProductSave} className="p-6 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nombre</label>
                  <input required type="text" value={(formData.name as string) || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-black outline-none text-sm transition-all" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Precio (₡)</label>
                    <input required type="number" min="0" step="0.01" value={(formData.price as number) ?? ''} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-black outline-none text-sm transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Precio Tachado</label>
                    <input type="number" min="0" step="0.01" value={(formData.compare_price as number) ?? ''} onChange={e => setFormData({ ...formData, compare_price: e.target.value || null })} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-black outline-none text-sm transition-all" placeholder="Opcional" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Categoría</label>
                  <select value={(formData.category_id as string) || ''} onChange={e => setFormData({ ...formData, category_id: e.target.value || null })} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-black outline-none text-sm transition-all">
                    <option value="">Sin categoría</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Imagen</label>
                  <div className="border-2 border-dashed border-gray-200 p-8 text-center rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                    <input type="file" accept="image/*" id="img-upload" className="hidden" onChange={handleFileChange} />
                    <label htmlFor="img-upload" className="cursor-pointer flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-gray-100">
                        <Upload className="text-gray-400 w-5 h-5" />
                      </div>
                      <span className="text-sm font-semibold text-gray-600">Haz clic para subir imagen</span>
                    </label>
                  </div>
                  {previewUrl && (
                    <div className="mt-4 relative w-28 h-28 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => { setSelectedFile(null); setPreviewUrl(''); setFormData({ ...formData, image_url: '' }) }} className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-lg p-1 shadow-md hover:bg-red-600 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Descripción</label>
                  <textarea rows={3} value={(formData.description as string) || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-black outline-none text-sm transition-all resize-none" />
                </div>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <label className="flex items-center gap-3 text-sm font-semibold text-gray-700 cursor-pointer min-h-[44px]">
                    <input type="checkbox" checked={(formData.is_available as boolean) !== false} onChange={e => setFormData({ ...formData, is_available: e.target.checked })} className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black" />
                    Disponible en tienda
                  </label>
                  <label className="flex items-center gap-3 text-sm font-semibold text-gray-700 cursor-pointer min-h-[44px]">
                    <input type="checkbox" checked={(formData.is_featured as boolean) === true} onChange={e => setFormData({ ...formData, is_featured: e.target.checked })} className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black" />
                    Producto Destacado
                  </label>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-gray-100 bg-white grid grid-cols-2 gap-4 shrink-0">
              <button type="button" onClick={() => setIsEditing(false)} className="w-full bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-xl py-4 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button type="submit" form="product-form" disabled={isUploading} className="w-full text-white shadow-lg shadow-black/10 font-bold text-sm rounded-xl py-4 transition-all flex justify-center items-center gap-2 hover:brightness-110 disabled:opacity-50" style={{ backgroundColor: 'var(--color-accent)' }}>
                {isUploading ? <><RefreshCw className="w-5 h-5 animate-spin" /> Guardando...</> : 'Guardar Producto'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Category Edit Slide-Over */}
      {isCategoryEditing && (
        <>
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsCategoryEditing(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-full md:max-w-sm bg-white shadow-2xl flex flex-col border-l border-gray-200 transform transition-transform">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white shrink-0">
              <h2 className="text-xl font-black text-gray-900">{categoryForm.id ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
              <button onClick={() => setIsCategoryEditing(false)} className="text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <form id="category-form" onSubmit={handleCategorySave} className="p-6 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nombre</label>
                  <input required type="text" value={(categoryForm.name as string) || ''} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-black outline-none text-sm transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Orden de visualización</label>
                  <input type="number" value={(categoryForm.sort_order as number) ?? 0} onChange={e => setCategoryForm({ ...categoryForm, sort_order: Number(e.target.value) })} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-black outline-none text-sm transition-all" />
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <label className="flex items-center gap-3 text-sm font-semibold text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={(categoryForm.is_active as boolean) !== false} onChange={e => setCategoryForm({ ...categoryForm, is_active: e.target.checked })} className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black" />
                    Categoría Activa
                  </label>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-gray-100 bg-white grid grid-cols-2 gap-4 shrink-0">
              <button type="button" onClick={() => setIsCategoryEditing(false)} className="w-full bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-xl py-4 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button type="submit" form="category-form" className="w-full text-white shadow-lg shadow-black/10 font-bold text-sm rounded-xl py-4 transition-all hover:brightness-110" style={{ backgroundColor: 'var(--color-accent)' }}>
                Guardar
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  )
}

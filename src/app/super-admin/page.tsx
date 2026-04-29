'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Store, Plus, Pencil, Trash2, X, RefreshCw, Upload,
  LogOut, Shield, ExternalLink, Settings, Users,
  LayoutDashboard, CreditCard, BarChart3, Menu, Activity, Package
} from 'lucide-react'

type Tab = 'dashboard' | 'tiendas' | 'facturacion' | 'reportes'

export default function SuperAdminDashboard() {
  // ─── Auth State ──────────────────────────────────────────
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [authError, setAuthError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // ─── Layout State ────────────────────────────────────────
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')

  // ─── Data State ──────────────────────────────────────────
  const [stores, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // ─── Form State ──────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState('')

  // ─── Auth ────────────────────────────────────────────────

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
  }

  // ─── Data Fetching ───────────────────────────────────────

  const fetchStores = useCallback(async () => {
    if (!accessToken) return
    setLoading(true)
    try {
      const res = await fetch('/api/super-admin/stores', { headers: authHeaders() })
      const data = await res.json()
      if (res.ok) {
        setStores(data.stores || [])
      } else if (res.status === 403) {
        setAuthError(data.error || 'Acceso denegado')
        handleLogout()
      }
    } catch (err) {
      console.error('Error fetching stores:', err)
    } finally {
      setLoading(false)
    }
  }, [accessToken, authHeaders])

  useEffect(() => {
    if (accessToken) {
      fetchStores()
    }
  }, [accessToken, fetchStores])

  // ─── CRUD ───────────────────────────────────────────────

  const handleStoreSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      let finalLogoUrl = formData.logo_url || ''
      let finalBannerUrl = formData.banner_url || ''

      const isUpdate = !!formData.id
      const payload = { ...formData }

      const url = isUpdate ? `/api/super-admin/stores/${formData.id}` : '/api/super-admin/stores'
      const method = isUpdate ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Error guardando tienda')
        setIsSaving(false)
        return
      }

      const savedStoreId = data.store.id

      if (logoFile || bannerFile) {
        if (logoFile) {
          const uploadForm = new FormData()
          uploadForm.append('file', logoFile)
          uploadForm.append('store_id', savedStoreId)
          uploadForm.append('type', 'logo')

          const uploadRes = await fetch('/api/super-admin/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}` },
            body: uploadForm,
          })
          if (uploadRes.ok) finalLogoUrl = (await uploadRes.json()).url
        }

        if (bannerFile) {
          const uploadForm = new FormData()
          uploadForm.append('file', bannerFile)
          uploadForm.append('store_id', savedStoreId)
          uploadForm.append('type', 'banner')

          const uploadRes = await fetch('/api/super-admin/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}` },
            body: uploadForm,
          })
          if (uploadRes.ok) finalBannerUrl = (await uploadRes.json()).url
        }

        await fetch(`/api/super-admin/stores/${savedStoreId}`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify({ logo_url: finalLogoUrl, banner_url: finalBannerUrl }),
        })
      }

      setIsEditing(false)
      fetchStores()
    } catch {
      alert('Error guardando tienda')
    } finally {
      setIsSaving(false)
    }
  }

  const handleStoreDelete = async (id: string, name: string) => {
    const confirmName = prompt(`Para confirmar la eliminación, escribe el nombre completo de la tienda: "${name}"`)
    if (confirmName !== name) {
      if (confirmName !== null) alert('El nombre no coincide. Operación cancelada.')
      return
    }

    try {
      const res = await fetch(`/api/super-admin/stores/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (res.ok) {
        fetchStores()
      } else {
        const data = await res.json()
        alert(data.error || 'Error eliminando tienda')
      }
    } catch {
      alert('Error de conexión')
    }
  }

  const handleStoreEdit = (store: any) => {
    setFormData(store)
    setLogoPreview(store.logo_url || '')
    setBannerPreview(store.banner_url || '')
    setLogoFile(null)
    setBannerFile(null)
    setIsEditing(true)
  }

  const handleStoreAdd = () => {
    setFormData({
      is_active: true,
      primary_color: '#000000',
      secondary_color: '#333333',
      accent_color: '#10B981',
      whatsapp_message: 'Hola, quiero hacer un pedido'
    })
    setLogoPreview('')
    setBannerPreview('')
    setLogoFile(null)
    setBannerFile(null)
    setIsEditing(true)
  }

  const toggleStoreStatus = async (store: any) => {
    try {
      const res = await fetch(`/api/super-admin/stores/${store.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ is_active: !store.is_active }),
      })
      if (res.ok) {
        fetchStores()
      }
    } catch (err) {
      console.error(err)
    }
  }

  // ─── Derived Metrics ────────────────────────────────────

  const activeStoresCount = stores.filter(s => s.is_active).length
  const inactiveStoresCount = stores.filter(s => !s.is_active).length
  const totalProducts = stores.reduce((sum, s) => sum + (s.product_count || 0), 0)
  const recentStores = [...stores].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5)

  // ─── LOGIN VIEW ─────────────────────────────────────────

  if (!accessToken) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-[#111] p-10 shadow-2xl max-w-sm w-full rounded-2xl border border-white/10">
          <div className="w-16 h-16 bg-white/5 flex items-center justify-center mb-6 mx-auto rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-center text-white mb-2 tracking-tight">
            Super Admin
          </h1>
          <p className="text-center text-gray-500 text-xs tracking-wider uppercase mb-8">MultiStore Platform</p>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3.5 focus:border-white/30 focus:ring-1 focus:ring-white/30 outline-none transition-all placeholder:text-gray-600 focus:bg-white/10"
                placeholder="superadmin@ejemplo.com"
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
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3.5 focus:border-white/30 focus:ring-1 focus:ring-white/30 outline-none transition-all placeholder:text-gray-600 focus:bg-white/10"
                placeholder="••••••••"
                required
              />
            </div>
            {authError && (
              <p className="text-red-400 text-xs text-center font-medium bg-red-400/10 py-2 rounded-lg border border-red-400/20">{authError}</p>
            )}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-white text-black hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400 font-bold uppercase tracking-widest text-xs py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
            >
              {isLoggingIn ? 'Iniciando sesión...' : 'Entrar al Panel'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ─── DASHBOARD VIEW ────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-gray-950 border-b border-gray-900 px-4 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-white" />
          <span className="font-bold text-white tracking-tight">Platform Control</span>
        </div>
        <button onClick={() => setMobileMenuOpen(true)} className="p-2 -mr-2 text-gray-400">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar (Dark Aesthetic) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-gray-950 flex flex-col shrink-0 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full border-r border-gray-900'}`}>
        <div className="p-6 h-24 flex items-center justify-between md:border-b border-gray-900">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-gray-800 shadow-inner">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-white block">Platform</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Control Center</span>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-500 md:hidden hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false) }}
                className={`flex items-center gap-3 px-4 py-3 w-full text-left font-semibold text-sm rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-white/10 text-white border border-white/10' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent'}`}
              >
                <LayoutDashboard className="w-5 h-5" /> Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => { setActiveTab('tiendas'); setMobileMenuOpen(false) }}
                className={`flex items-center gap-3 px-4 py-3 w-full text-left font-semibold text-sm rounded-xl transition-all ${activeTab === 'tiendas' ? 'bg-white/10 text-white border border-white/10' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent'}`}
              >
                <Store className="w-5 h-5" /> Tiendas
              </button>
            </li>
            <div className="pt-8 pb-2 px-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">
              Administración
            </div>
            <li>
              <button
                disabled
                className="flex items-center justify-between px-4 py-3 w-full text-left font-semibold text-sm rounded-xl transition-all text-gray-600 cursor-not-allowed group relative"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5" /> Facturación
                </div>
                <span className="text-[9px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full uppercase tracking-wider">Próximamente</span>
              </button>
            </li>
            <li>
              <button
                disabled
                className="flex items-center justify-between px-4 py-3 w-full text-left font-semibold text-sm rounded-xl transition-all text-gray-600 cursor-not-allowed group relative"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5" /> Reportes
                </div>
                <span className="text-[9px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full uppercase tracking-wider">Próximamente</span>
              </button>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-900 bg-black/20">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 w-full text-left font-semibold text-sm rounded-xl transition-colors">
            <LogOut className="w-5 h-5" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-[calc(100vh-73px)] md:h-screen overflow-hidden bg-gray-100">
        
        {/* Topbar (Desktop only) */}
        <header className="hidden md:flex bg-white/80 backdrop-blur-md border-b border-gray-200 px-10 py-6 items-center justify-between shrink-0 sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight capitalize">
              {activeTab}
            </h1>
            <p className="text-gray-500 text-sm mt-1">Super Admin Panel</p>
          </div>
          {activeTab === 'tiendas' && (
            <button
              onClick={handleStoreAdd}
              className="bg-gray-950 text-white px-6 py-3 text-sm font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg shadow-black/10 rounded-xl"
            >
              <Plus className="w-4 h-4" /> Nueva Tienda
            </button>
          )}
        </header>

        {/* Content Scrollable Area */}
        <div className="p-4 md:p-10 flex-1 overflow-y-auto hide-scrollbar">

          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 max-w-6xl">
              {/* Global Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between h-32 relative overflow-hidden group">
                  <div className="absolute right-[-10px] top-[-10px] opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                    <Activity className="w-32 h-32" />
                  </div>
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-widest relative z-10">Tiendas Activas</p>
                  <p className="text-4xl font-black text-gray-900 relative z-10">{activeStoresCount}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between h-32 relative overflow-hidden group">
                  <div className="absolute right-[-10px] top-[-10px] opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                    <Store className="w-32 h-32" />
                  </div>
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-widest relative z-10">Tiendas Inactivas</p>
                  <p className="text-4xl font-black text-gray-900 relative z-10">{inactiveStoresCount}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between h-32 relative overflow-hidden group">
                  <div className="absolute right-[-10px] top-[-10px] opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                    <Package className="w-32 h-32" />
                  </div>
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-widest relative z-10">Total Productos</p>
                  <p className="text-4xl font-black text-gray-900 relative z-10">{totalProducts}</p>
                </div>
              </div>

              {/* Recent Stores List */}
              <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Tiendas Recientes</h2>
                </div>
                {recentStores.length === 0 ? (
                  <div className="p-12 text-center text-gray-500 font-medium">No hay tiendas registradas.</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {recentStores.map(store => (
                      <div key={store.id} className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200 overflow-hidden">
                          {store.logo_url ? <img src={store.logo_url} className="w-full h-full object-contain bg-white" /> : <Store className="w-5 h-5 text-gray-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm truncate">{store.name}</h3>
                          <div className="text-gray-500 text-xs mt-1 flex items-center gap-2">
                            <span>/t/{store.slug}</span>
                            <span className="text-gray-300">•</span>
                            <span>{new Date(store.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div>
                          <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider ${store.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {store.is_active ? 'Activa' : 'Inactiva'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: TIENDAS */}
          {activeTab === 'tiendas' && (
            <div className="max-w-7xl">
              {/* Mobile CTA */}
              <button
                onClick={handleStoreAdd}
                className="md:hidden w-full mb-6 bg-gray-950 text-white px-6 py-3.5 text-sm font-bold shadow-lg rounded-xl flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Nueva Tienda
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  <div className="col-span-full py-20 text-center flex flex-col items-center text-gray-400">
                    <RefreshCw className="w-8 h-8 animate-spin mb-4 text-gray-400" />
                    <span className="text-sm font-bold uppercase tracking-widest">Sincronizando...</span>
                  </div>
                ) : stores.length === 0 ? (
                  <div className="col-span-full py-32 bg-white rounded-3xl border border-gray-200 text-center flex flex-col items-center justify-center shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
                      <Store className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No hay tiendas registradas</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-8 text-sm">
                      Comienza creando el primer tenant para un cliente o para pruebas de la plataforma.
                    </p>
                    <button onClick={handleStoreAdd} className="bg-gray-950 text-white px-6 py-3 rounded-xl font-bold tracking-wide shadow-lg">
                      Crear primer tenant
                    </button>
                  </div>
                ) : (
                  stores.map((s) => (
                    <div key={s.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col group">
                      <div className="p-6 flex-1 relative">
                        {/* Status Badge */}
                        <div className="absolute top-6 right-6">
                          <span className={`px-2.5 py-1 text-[10px] uppercase tracking-widest font-black rounded-lg ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {s.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        
                        <div className="flex gap-4 mb-6">
                          <div className="w-14 h-14 rounded-xl border border-gray-100 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                            {s.logo_url ? <img src={s.logo_url} className="w-full h-full object-contain" /> : <div className="text-gray-900 font-black text-xl">{s.name.charAt(0)}</div>}
                          </div>
                          <div className="pt-1 pr-16">
                            <h3 className="font-bold text-lg text-gray-900 leading-tight">{s.name}</h3>
                            <a href={`/t/${s.slug}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1 font-semibold group-hover:underline w-max">
                              /t/{s.slug} <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3 border border-gray-100">
                            <Users className="w-4 h-4 text-gray-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Admin Email</div>
                              <div className="text-xs font-semibold text-gray-900 truncate">{s.admin_email}</div>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3 border border-gray-100">
                            <Package className="w-4 h-4 text-gray-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Productos</div>
                              <div className="text-xs font-semibold text-gray-900">{s.product_count || 0}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 p-4 bg-gray-50 flex gap-2">
                        <button onClick={() => toggleStoreStatus(s)} className={`flex-1 py-2.5 bg-white border ${s.is_active ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'} rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-2`}>
                          {s.is_active ? 'Desactivar' : 'Activar'}
                        </button>
                        <button onClick={() => handleStoreEdit(s)} className="flex-1 py-2.5 bg-gray-950 text-white rounded-xl text-xs font-bold shadow-md hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                          <Settings className="w-4 h-4" /> Configurar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Editor Drawer (Slide-Over) */}
      {isEditing && (
        <>
          <div className="fixed inset-0 bg-gray-950/40 backdrop-blur-sm z-40 transition-opacity" onClick={() => !isSaving && setIsEditing(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-full md:max-w-2xl bg-white shadow-2xl flex flex-col border-l border-gray-200">

            <div className="bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                  {formData.id ? 'Configurar Tienda' : 'Nuevo Tenant'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">{formData.id ? 'Modifica los parámetros de este cliente.' : 'Despliega una nueva tienda aislada.'}</p>
              </div>
              <button disabled={isSaving} onClick={() => setIsEditing(false)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6 bg-gray-50/50">
              <form id="store-form" onSubmit={handleStoreSave} className="space-y-8">
                {/* General Info */}
                <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 mb-5 flex items-center gap-2">
                    <Store className="w-4 h-4 text-gray-400" /> Información Principal
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Nombre Público</label>
                        <input required type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:ring-2 ring-black outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Slug (URL)</label>
                        <div className="flex items-center text-sm border border-gray-200 bg-gray-50 rounded-xl overflow-hidden focus-within:ring-2 ring-black transition-all">
                          <span className="px-4 text-gray-400 font-bold bg-gray-100 border-r border-gray-200">/t/</span>
                          <input required disabled={!!formData.id} type="text" value={formData.slug || ''} onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} placeholder="mi-tienda" className="w-full px-4 py-3 bg-transparent outline-none disabled:text-gray-400" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Descripción</label>
                      <textarea rows={2} value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:ring-2 ring-black outline-none transition-all resize-none" />
                    </div>
                  </div>
                </section>

                {/* Access */}
                <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 mb-5 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-400" /> Control de Acceso
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Email del Administrador</label>
                      <input required type="email" value={formData.admin_email || ''} onChange={e => setFormData({ ...formData, admin_email: e.target.value })} className="w-full border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:ring-2 ring-black outline-none transition-all" placeholder="dueño@cliente.com" disabled={!!formData.id} />
                      <p className="text-[10px] text-gray-400 font-medium mt-2">{formData.id ? 'El email de acceso no puede cambiarse.' : 'Se le creará la cuenta automáticamente.'}</p>
                    </div>
                    
                    {!formData.id ? (
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Contraseña Inicial</label>
                        <input required type="text" value={formData.admin_password || ''} onChange={e => setFormData({ ...formData, admin_password: e.target.value })} className="w-full border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:ring-2 ring-black outline-none transition-all" placeholder="Mínimo 6 caracteres" minLength={6} />
                        <p className="text-[10px] text-gray-400 font-medium mt-2">Guárdala. Se le entregará al cliente para su ingreso.</p>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors w-full">
                          <input type="checkbox" checked={formData.is_active !== false} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="w-5 h-5 rounded border-gray-300 text-green-500 focus:ring-green-500" />
                          <div>
                            <p className="font-bold text-sm text-gray-900">Tenant Activo</p>
                            <p className="text-[10px] text-gray-500 font-medium">Permite el acceso y visibilidad de la tienda.</p>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                </section>

                {/* Advanced Settings (Only for existing stores) */}
                {!!formData.id && (
                  <>
                    {/* Branding */}
                    <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
                  <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 mb-5 flex items-center gap-2">
                    Rendimiento Visual (Branding)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Logo Upload */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Logo</label>
                      <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:bg-gray-50 transition-colors relative group h-32 flex items-center justify-center bg-white cursor-pointer">
                        <input type="file" accept="image/*" onChange={e => { if (e.target.files?.[0]) { setLogoFile(e.target.files[0]); setLogoPreview(URL.createObjectURL(e.target.files[0])) } }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <div className="flex flex-col items-center pointer-events-none">
                          {logoPreview ? (
                            <img src={logoPreview} className="w-16 h-16 object-contain" />
                          ) : (
                            <>
                              <Upload className="w-6 h-6 text-gray-300 mb-2" />
                              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Subir Logo</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Colors */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex justify-between">
                          <span>Primario</span>
                          <span className="text-gray-400 font-mono">{formData.primary_color || '#000000'}</span>
                        </label>
                        <div className="flex items-center gap-3">
                          <input type="color" value={formData.primary_color || '#000000'} onChange={e => setFormData({ ...formData, primary_color: e.target.value })} className="w-11 h-11 rounded-lg cursor-pointer border border-gray-200" />
                          <input type="text" value={formData.primary_color || '#000000'} onChange={e => setFormData({ ...formData, primary_color: e.target.value })} className="flex-1 border border-gray-200 rounded-lg px-3 min-h-[44px] text-sm uppercase font-mono bg-gray-50 focus:bg-white" pattern="^#[0-9A-Fa-f]{6}$" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex justify-between">
                          <span>Acento</span>
                          <span className="text-gray-400 font-mono">{formData.accent_color || '#000000'}</span>
                        </label>
                        <div className="flex items-center gap-3">
                          <input type="color" value={formData.accent_color || '#000000'} onChange={e => setFormData({ ...formData, accent_color: e.target.value })} className="w-11 h-11 rounded-lg cursor-pointer border border-gray-200" />
                          <input type="text" value={formData.accent_color || '#000000'} onChange={e => setFormData({ ...formData, accent_color: e.target.value })} className="flex-1 border border-gray-200 rounded-lg px-3 min-h-[44px] text-sm uppercase font-mono bg-gray-50 focus:bg-white" pattern="^#[0-9A-Fa-f]{6}$" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Hero Banner (Fondo)</label>
                    <div className="border border-gray-200 rounded-2xl overflow-hidden relative group h-40 bg-gray-50">
                      <input type="file" accept="image/*" onChange={e => { if (e.target.files?.[0]) { setBannerFile(e.target.files[0]); setBannerPreview(URL.createObjectURL(e.target.files[0])) } }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      {bannerPreview ? (
                        <>
                          <img src={bannerPreview} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white font-bold text-sm tracking-wide">Cambiar Imagen de Fondo</span>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                          <Upload className="w-6 h-6 mb-2" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Subir Banner</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Texto Banner Principal</label>
                      <input type="text" value={formData.banner_text || ''} onChange={e => setFormData({ ...formData, banner_text: e.target.value })} className="w-full border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:ring-2 ring-black outline-none transition-all" placeholder="Ej. Bienvenidos a mi tienda" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Subtítulo Banner</label>
                      <input type="text" value={formData.banner_sub || ''} onChange={e => setFormData({ ...formData, banner_sub: e.target.value })} className="w-full border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:ring-2 ring-black outline-none transition-all" placeholder="Opcional" />
                    </div>
                  </div>
                </section>

                {/* WhatsApp */}
                <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 mb-5 flex items-center gap-2">
                    Integración WhatsApp
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Número Telefónico</label>
                      <input required type="text" value={formData.whatsapp_number || ''} onChange={e => setFormData({ ...formData, whatsapp_number: e.target.value })} className="w-full border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:ring-2 ring-black outline-none transition-all" placeholder="50688888888" />
                      <p className="text-[10px] text-gray-400 font-medium mt-1">Con código de país, sin el `+`.</p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Mensaje Automático</label>
                      <input type="text" value={formData.whatsapp_message || ''} onChange={e => setFormData({ ...formData, whatsapp_message: e.target.value })} className="w-full border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:ring-2 ring-black outline-none transition-all" placeholder="Hola, quiero hacer un pedido" />
                    </div>
                  </div>
                </section>
                </>
                )}
              </form>
            </div>

            <div className="p-6 bg-white border-t border-gray-200 flex gap-4 shrink-0">
              <button disabled={isSaving} type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold uppercase tracking-widest text-xs rounded-xl py-4 hover:bg-gray-50 transition-colors shadow-sm">
                Cancelar
              </button>
              <button disabled={isSaving} type="submit" form="store-form" className="flex-[2] bg-gray-950 hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold uppercase tracking-widest text-xs rounded-xl py-4 transition-all flex items-center justify-center gap-2 shadow-lg">
                {isSaving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Procesando...</> : 'Guardar y Desplegar Tenant'}
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  )
}

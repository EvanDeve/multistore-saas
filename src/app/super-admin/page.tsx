'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Store, Plus, Pencil, Trash2, X, RefreshCw, Upload,
  LogOut, Shield, ExternalLink, Settings, Users,
} from 'lucide-react'

export default function SuperAdminDashboard() {
  // ─── Auth State ──────────────────────────────────────────
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [authError, setAuthError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

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
      const storeId = formData.id // Might be undefined for new stores, uploaded after creation if needed

      // We'll construct the payload
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

      // Upload files if they exist (need store ID to upload to correct path)
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

        // Update again if URLs changed
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
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <header className="bg-[#0a0a0a] text-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">Platform Control</h1>
              <span className="text-[10px] text-gray-400 tracking-widest uppercase font-semibold">Super Admin Level</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors bg-white/5 px-4 py-2.5 rounded-lg border border-white/5 hover:bg-white/10"
          >
            <LogOut className="w-4 h-4" /> Salir
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Tiendas Activas</h2>
            <p className="text-gray-500 mt-1">Gestiona las instancias, recursos y suscripciones de tus clientes.</p>
          </div>
          <button
            onClick={handleStoreAdd}
            className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-bold tracking-wide transition-all shadow-md flex items-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-5 h-5" /> Nueva Tienda
          </button>
        </div>

        {/* Store List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full py-20 text-center flex flex-col items-center justify-center text-gray-400">
              <RefreshCw className="w-8 h-8 animate-spin mb-4 text-black" />
              <p className="text-sm font-medium uppercase tracking-widest">Sincronizando instancias...</p>
            </div>
          ) : stores.length === 0 ? (
            <div className="col-span-full py-32 bg-white rounded-3xl border border-gray-200 text-center flex flex-col items-center justify-center shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
                <Store className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No hay tiendas registradas</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                La plataforma está lista. Comienza creando el primer tenant para un cliente o para pruebas.
              </p>
              <button onClick={handleStoreAdd} className="bg-black text-white px-6 py-3 rounded-xl font-bold tracking-wide">
                Configurar primer tenant
              </button>
            </div>
          ) : (
            stores.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-lg transition-shadow">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                        {s.logo_url ? <img src={s.logo_url} className="w-full h-full object-contain" /> : <Store className="text-gray-300 w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 leading-tight group-hover:text-[var(--color-primary)] transition-colors">{s.name}</h3>
                        <a href={`/t/${s.slug}`} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1 font-medium">
                          /t/{s.slug} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-[10px] uppercase tracking-widest font-bold rounded-full ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {s.is_active ? 'Activo' : 'Suspendido'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Users className="w-3 h-3" /> Admin
                      </div>
                      <div className="text-sm font-medium text-gray-900 truncate" title={s.admin_email}>{s.admin_email}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Store className="w-3 h-3" /> Productos
                      </div>
                      <div className="text-sm font-medium text-gray-900">{s.product_count} items</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 p-4 bg-gray-50/50 flex gap-2">
                  <button onClick={() => handleStoreEdit(s)} className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    <Settings className="w-4 h-4" /> Configurar
                  </button>
                  <button onClick={() => handleStoreDelete(s.id, s.name)} className="py-2.5 px-4 bg-white border border-gray-200 text-red-600 rounded-lg shadow-sm hover:bg-red-50 hover:border-red-200 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Editor Drawer */}
      {isEditing && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={() => !isSaving && setIsEditing(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-gray-50 shadow-[0_0_40px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden">

            <div className="bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  {formData.id ? 'Configurar Tienda' : 'Nuevo Tenant'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">{formData.id ? 'Modifica los parámetros de este cliente.' : 'Despliega una nueva tienda aislada.'}</p>
              </div>
              <button disabled={isSaving} onClick={() => setIsEditing(false)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6">
              <form id="store-form" onSubmit={handleStoreSave} className="space-y-8">
                {/* General Info */}
                <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 mb-5 flex items-center gap-2">
                    <Store className="w-4 h-4 text-gray-400" /> Información Principal
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Nombre Público</label>
                        <input required type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Slug (URL)</label>
                        <div className="flex items-center text-sm border border-gray-200 bg-gray-50 rounded-lg overflow-hidden focus-within:ring-2 ring-black">
                          <span className="px-3 text-gray-400 bg-gray-100 border-r border-gray-200">/t/</span>
                          <input required disabled={!!formData.id} type="text" value={formData.slug || ''} onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} placeholder="mi-tienda" className="w-full px-3 py-2 bg-transparent outline-none disabled:text-gray-400" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Descripción</label>
                      <textarea rows={2} value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full border border-gray-200 rounded-lg p-3 text-sm bg-gray-50 focus:bg-white" />
                    </div>
                  </div>
                </section>

                {/* Access */}
                <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 mb-5 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-400" /> Control de Acceso
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Email del Administrador</label>
                      <input required type="email" value={formData.admin_email || ''} onChange={e => setFormData({ ...formData, admin_email: e.target.value })} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white" placeholder="dueño@cliente.com" />
                      <p className="text-[10px] text-gray-400 mt-2">Debe registrarse con este correo usando Supabase Auth.</p>
                    </div>
                    <div className="pt-6">
                      <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in text-sm">
                          <input type="checkbox" checked={formData.is_active !== false} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:right-0 checked:border-green-500 right-5 transition-all outline-none" />
                          <div className={`toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer ${formData.is_active !== false ? 'bg-green-500' : ''}`}></div>
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900">Tenant Activo</p>
                          <p className="text-[10px] text-gray-500">Pausar para suspender tienda.</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </section>

                {/* Branding */}
                <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
                  <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 mb-5 flex items-center gap-2">
                    Rendimiento Visual (Branding)
                  </h3>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Logo Upload */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Logo</label>
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative group">
                        <input type="file" accept="image/*" onChange={e => { if (e.target.files?.[0]) { setLogoFile(e.target.files[0]); setLogoPreview(URL.createObjectURL(e.target.files[0])) } }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <div className="flex flex-col items-center pointer-events-none">
                          {logoPreview ? (
                            <img src={logoPreview} className="w-16 h-16 object-contain mb-2" />
                          ) : (
                            <Upload className="w-8 h-8 text-gray-300 mb-2" />
                          )}
                          <span className="text-xs text-gray-500 font-medium">{logoPreview ? 'Cambiar Logo' : 'Subir Logo'}</span>
                        </div>
                      </div>
                    </div>
                    {/* Colors */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex justify-between">
                          <span>Primario</span>
                          <span className="text-gray-400 font-mono">{formData.primary_color || '#000000'}</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={formData.primary_color || '#000000'} onChange={e => setFormData({ ...formData, primary_color: e.target.value })} className="w-8 h-8 rounded shrink-0 cursor-pointer" />
                          <input type="text" value={formData.primary_color || '#000000'} onChange={e => setFormData({ ...formData, primary_color: e.target.value })} className="flex-1 border border-gray-200 rounded text-xs px-2 py-1.5 uppercase font-mono" pattern="^#[0-9A-Fa-f]{6}$" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex justify-between">
                          <span>Acento</span>
                          <span className="text-gray-400 font-mono">{formData.accent_color || '#000000'}</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={formData.accent_color || '#000000'} onChange={e => setFormData({ ...formData, accent_color: e.target.value })} className="w-8 h-8 rounded shrink-0 cursor-pointer" />
                          <input type="text" value={formData.accent_color || '#000000'} onChange={e => setFormData({ ...formData, accent_color: e.target.value })} className="flex-1 border border-gray-200 rounded text-xs px-2 py-1.5 uppercase font-mono" pattern="^#[0-9A-Fa-f]{6}$" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Hero Banner (Fondo)</label>
                    <div className="border border-gray-200 rounded-xl overflow-hidden relative group h-32 bg-gray-50">
                      <input type="file" accept="image/*" onChange={e => { if (e.target.files?.[0]) { setBannerFile(e.target.files[0]); setBannerPreview(URL.createObjectURL(e.target.files[0])) } }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      {bannerPreview ? (
                        <>
                          <img src={bannerPreview} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white font-bold text-sm">Cambiar Imagen</span>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 decoration-dashed">
                          <Upload className="w-6 h-6 mb-1" />
                          <span className="text-xs font-semibold">Subir Banner</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Texto Banner Principal</label>
                      <input type="text" value={formData.banner_text || ''} onChange={e => setFormData({ ...formData, banner_text: e.target.value })} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white" placeholder="Ej. Bienvenidos a mi tienda" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Subtítulo Banner</label>
                      <input type="text" value={formData.banner_sub || ''} onChange={e => setFormData({ ...formData, banner_sub: e.target.value })} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white" placeholder="Opcional" />
                    </div>
                  </div>
                </section>

                {/* WhatsApp */}
                <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 mb-5 flex items-center gap-2">
                    Integración de Pagos & WhatsApp
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Número de WhatsApp</label>
                      <input required type="text" value={formData.whatsapp_number || ''} onChange={e => setFormData({ ...formData, whatsapp_number: e.target.value })} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white" placeholder="50688888888" />
                      <p className="text-[10px] text-gray-400 mt-1">Con código de país, sin el `+`.</p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Mensaje Automático</label>
                      <input type="text" value={formData.whatsapp_message || ''} onChange={e => setFormData({ ...formData, whatsapp_message: e.target.value })} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white" placeholder="Hola, quiero hacer un pedido" />
                    </div>
                  </div>
                </section>
              </form>
            </div>

            <div className="p-6 bg-white border-t border-gray-200 flex gap-4 shrink-0">
              <button disabled={isSaving} type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold uppercase tracking-widest text-xs rounded-xl py-4 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button disabled={isSaving} type="submit" form="store-form" className="flex-[2] bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold uppercase tracking-widest text-xs rounded-xl py-4 transition-all flex items-center justify-center gap-2 shadow-lg">
                {isSaving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Procesando...</> : 'Guardar y Desplegar Tenant'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Embedded CSS for Toggle Switch */}
      <style dangerouslySetInnerHTML={{__html: `
        .toggle-checkbox:checked { right: 0; border-color: #22c55e; }
        .toggle-checkbox { right: 0; z-index: 1; border-color: #e5e7eb; transition: all 0.3s; }
        .toggle-label { width: 3.5rem; border-radius: 9999px; transition: all 0.3s; }
      `}} />
    </div>
  )
}

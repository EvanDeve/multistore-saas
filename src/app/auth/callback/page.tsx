'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()
  const [error, setError] = useState('')

  useEffect(() => {
    // Supabase redirects here with tokens in the URL hash:
    // /auth/callback#access_token=xxx&refresh_token=xxx&...
    const hash = window.location.hash.slice(1)
    const params = new URLSearchParams(hash)

    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const expiresAt = params.get('expires_at')

    if (!accessToken) {
      setError('Enlace inválido o expirado. Solicitá uno nuevo.')
      return
    }

    localStorage.setItem('tm_access_token', accessToken)
    if (refreshToken) localStorage.setItem('tm_refresh_token', refreshToken)
    if (expiresAt) localStorage.setItem('tm_expires_at', expiresAt)

    // Determine where to redirect based on role
    fetch('/api/auth/resolve-role', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.redirect) {
          router.replace(data.redirect)
        } else {
          setError('Tu cuenta no tiene acceso a ningún panel.')
        }
      })
      .catch(() => setError('Error de conexión. Intentá de nuevo.'))
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 shadow-xl max-w-sm w-full rounded-3xl border border-gray-200 text-center">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <button
            onClick={() => router.replace('/login')}
            className="text-sm font-bold text-[#0C447C] hover:underline"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[#0C447C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500 font-medium">Iniciando sesión...</p>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Shield, Mail, KeyRound } from 'lucide-react'

type Step = 'email' | 'code'

export default function LoginPage() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error enviando el código.')
        return
      }
      setStep('code')
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), token: code.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Código incorrecto o expirado.')
        return
      }
      localStorage.setItem('tm_access_token', data.access_token)
      localStorage.setItem('tm_refresh_token', data.refresh_token)
      if (data.expires_at) localStorage.setItem('tm_expires_at', String(data.expires_at))
      window.location.href = data.redirect
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-10 shadow-xl max-w-sm w-full rounded-3xl border border-gray-200">
        <div className="w-14 h-14 bg-[#E6F1FB] flex items-center justify-center mb-6 mx-auto rounded-2xl">
          <Shield className="w-6 h-6 text-[#0F1E33]" />
        </div>

        <h1 className="text-2xl font-bold text-center text-[#0F1E33] mb-1 tracking-tight">
          TicoMerce
        </h1>

        {step === 'email' ? (
          <>
            <p className="text-center text-[#5F5E5A] text-sm mb-8">
              Ingresá tu correo para recibir un código de acceso
            </p>
            <form onSubmit={handleSendLink} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-widest mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 bg-white rounded-xl pl-11 pr-4 py-3.5 focus:border-[#0C447C] focus:ring-1 focus:ring-[#0C447C] outline-none text-sm transition-all text-[#1A1A1A]"
                    placeholder="tu@correo.com"
                    required
                    autoFocus
                  />
                </div>
              </div>
              {error && (
                <p className="text-red-600 text-sm text-center font-semibold bg-red-50 py-2 rounded-lg border border-red-100">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0F1E33] hover:bg-[#0C447C] disabled:bg-gray-400 text-white text-sm font-bold py-4 transition-colors rounded-xl shadow-md cursor-pointer active:scale-95"
              >
                {loading ? 'Enviando...' : 'Enviar Código de Acceso'}
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="text-center text-[#5F5E5A] text-sm mb-8">
              Revisá tu correo <span className="font-bold text-[#0F1E33]">{email}</span> e ingresá el código de 6 dígitos
            </p>
            <form onSubmit={handleVerifyCode} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-widest mb-2">
                  Código de Verificación
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    className="w-full border border-gray-300 bg-white rounded-xl pl-11 pr-4 py-3.5 focus:border-[#0C447C] focus:ring-1 focus:ring-[#0C447C] outline-none text-center tracking-[0.3em] text-lg font-bold transition-all text-[#1A1A1A]"
                    placeholder="00000000"
                    maxLength={8}
                    required
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">El código expira en 10 minutos. Revisá también el spam.</p>
              </div>
              {error && (
                <p className="text-red-600 text-sm text-center font-semibold bg-red-50 py-2 rounded-lg border border-red-100">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || code.length < 6}
                className="w-full bg-[#0F1E33] hover:bg-[#0C447C] disabled:bg-gray-400 text-white text-sm font-bold py-4 transition-colors rounded-xl shadow-md cursor-pointer active:scale-95"
              >
                {loading ? 'Verificando...' : 'Entrar al Panel'}
              </button>
              <button
                type="button"
                onClick={() => { setStep('email'); setCode(''); setError('') }}
                className="w-full text-sm text-gray-500 hover:text-gray-900 py-2 font-semibold transition-colors"
              >
                Cambiar correo
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

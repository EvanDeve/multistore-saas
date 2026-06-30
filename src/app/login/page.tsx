'use client'

import { useState } from 'react'
import { Shield, Mail, CheckCircle } from 'lucide-react'

export default function LoginPage() {
  const [step, setStep] = useState<'email' | 'sent'>('email')
  const [email, setEmail] = useState('')
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
        setError(data.error || 'Error enviando el enlace.')
        return
      }
      setStep('sent')
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
          {step === 'sent' ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <Shield className="w-6 h-6 text-[#0F1E33]" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-center text-[#0F1E33] mb-1 tracking-tight">
          TicoMerce
        </h1>

        {step === 'email' ? (
          <>
            <p className="text-center text-[#5F5E5A] text-sm mb-8">
              Ingresá tu correo para recibir un enlace de acceso
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
                {loading ? 'Enviando enlace...' : 'Enviar Enlace de Acceso'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-[#5F5E5A] text-sm">
              Enviamos un enlace de acceso a
            </p>
            <p className="font-bold text-[#0F1E33]">{email}</p>
            <p className="text-[#5F5E5A] text-sm">
              Abrí tu correo y hacé clic en <strong>"Log In"</strong> para entrar al panel.
            </p>
            <p className="text-xs text-gray-400 pt-2">
              El enlace expira en 10 minutos. Revisá también el spam.
            </p>
            <button
              onClick={() => { setStep('email'); setError('') }}
              className="text-sm font-semibold text-[#0C447C] hover:underline pt-2"
            >
              Usar otro correo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

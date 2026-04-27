import Link from 'next/link'
import { Store, ArrowRight, Shield, Zap } from 'lucide-react'

/**
 * Platform landing page — shown at the root URL.
 * This is NOT a store page; it's the public face of the SaaS platform.
 */
export default function PlatformLanding() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="w-full border-b border-gray-100 bg-white/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-gray-900" />
            <span className="font-bold text-lg tracking-tight text-gray-900">MultiStore</span>
          </div>
          <Link
            href="/super-admin"
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            Admin
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1.5 text-gray-600 text-xs font-semibold tracking-wide uppercase mb-8">
            <Zap className="w-3 h-3" /> Plataforma Multi-Tienda
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
            Tu tienda online
            <br />
            <span className="text-gray-400">en minutos.</span>
          </h1>

          <p className="text-gray-500 text-lg max-w-lg mx-auto mb-10 leading-relaxed">
            Crea catálogos profesionales con pedidos por WhatsApp.
            Sin código. Sin complicaciones.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/super-admin"
              className="w-full sm:w-auto bg-gray-900 text-white font-bold px-8 py-4 rounded-xl text-sm hover:bg-gray-800 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              Crear una Tienda <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-3 gap-6 mt-20 text-left">
            {[
              { icon: Zap, title: 'Rápido', desc: 'Tu tienda lista en menos de 5 minutos' },
              { icon: Shield, title: 'Seguro', desc: 'Cada tienda aislada con acceso propio' },
              { icon: Store, title: 'Escalable', desc: 'Gestiona múltiples tiendas desde un panel' },
            ].map((f) => (
              <div key={f.title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <f.icon className="w-5 h-5 text-gray-900 mb-3" />
                <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

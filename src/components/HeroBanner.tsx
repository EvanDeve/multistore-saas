'use client'

import type { Store } from '@/lib/supabase'
import Link from 'next/link'
import { MessageCircle, CheckCircle, Sparkles } from 'lucide-react'

interface HeroBannerProps {
  store: Store
  slug: string
}

export function HeroBanner({ store, slug }: HeroBannerProps) {
  const handleCustomQuote = () => {
    if (!store.whatsapp_number) return alert('WhatsApp no configurado')
    const msg = encodeURIComponent(
      store.whatsapp_message || 'Hola, quiero hacer un pedido'
    )
    window.open(`https://wa.me/${store.whatsapp_number}?text=${msg}`, '_blank')
  }

  return (
    <section className="relative overflow-hidden min-h-[85vh] flex items-center justify-center">
      {/* Background Image */}
      {store.banner_url ? (
        <div className="absolute inset-0">
          <img
            src={store.banner_url}
            alt=""
            className="w-full h-full object-cover scale-105"
          />
        </div>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
          }}
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black/75" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        {/* Logo or Badge */}
        {store.logo_url ? (
          <div className="mx-auto w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full p-2 mb-8 shadow-2xl border-4 border-white/20 backdrop-blur-md overflow-hidden flex items-center justify-center">
            <img src={store.logo_url} alt={store.name} className="w-full h-full object-contain rounded-full" />
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 text-white/90 text-xs font-semibold tracking-widest uppercase mb-8">
            <Sparkles className="w-3 h-3" /> {store.name}
          </div>
        )}

        {/* Title */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-6 drop-shadow-lg">
          {store.banner_text || store.name}
        </h1>

        {/* Subtitle */}
        {(store.banner_sub || store.description) && (
          <p className="text-white/80 text-lg sm:text-xl max-w-xl mx-auto mb-10 font-light leading-relaxed">
            {store.banner_sub || store.description}
          </p>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/t/${slug}/productos`}
            className="w-full sm:w-auto bg-white font-bold px-10 py-4 rounded-xl text-sm tracking-wide transition-all shadow-lg shadow-black/20 flex items-center justify-center gap-2 hover:bg-gray-100"
            style={{ color: 'var(--color-primary)' }}
          >
            Ver Catálogo
          </Link>

          {store.whatsapp_number && (
            <button
              onClick={handleCustomQuote}
              className="w-full sm:w-auto border-2 border-white text-white font-bold px-10 py-4 rounded-xl text-sm tracking-wide hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Contactar por WhatsApp
            </button>
          )}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-white/60 text-xs font-medium">
          <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Sin registro necesario</span>
          <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Pedidos por WhatsApp</span>
          <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Respuesta rápida</span>
        </div>
      </div>
    </section>
  )
}

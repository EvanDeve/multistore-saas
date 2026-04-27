'use client'

import React from 'react'
import { MessageCircle } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useStore } from './StoreProvider'

export function GlobalAction() {
  const { store } = useStore()
  const pathname = usePathname()

  // Hide on admin pages or if no WhatsApp number configured
  if (pathname.includes('/admin') || !store.whatsapp_number) return null

  const handleContact = () => {
    const msg = encodeURIComponent(store.whatsapp_message || 'Hola, quiero hacer un pedido')
    window.open(`https://wa.me/${store.whatsapp_number}?text=${msg}`, '_blank')
  }

  return (
    <button
      onClick={handleContact}
      className="btn-pulse fixed bottom-6 right-6 z-30 text-white px-5 py-3.5 rounded-full font-bold text-sm shadow-xl flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 hover:brightness-110"
      style={{ backgroundColor: 'var(--color-primary)' }}
    >
      <MessageCircle className="w-5 h-5 flex-shrink-0" />
      <span className="hidden sm:inline">WhatsApp</span>
    </button>
  )
}

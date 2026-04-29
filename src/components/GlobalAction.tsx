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
      className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-30 bg-[#25D366] text-white w-14 h-14 rounded-full shadow-2xl shadow-green-900/20 flex items-center justify-center transition-all hover:scale-110 active:scale-95 hover:bg-[#20bd5a]"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </button>
  )
}

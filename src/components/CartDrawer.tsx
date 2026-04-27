'use client'

import React from 'react'
import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useCart } from './CartContext'
import { useStore } from './StoreProvider'
import { usePathname } from 'next/navigation'

export function CartDrawer() {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeItem, totalPrice } = useCart()
  const { store } = useStore()
  const pathname = usePathname()

  if (pathname.includes('/admin')) return null

  const handleCheckout = () => {
    if (!store.whatsapp_number) {
      alert('No hay número de WhatsApp configurado para esta tienda.')
      return
    }

    let message = `👋 ¡Hola! Me gustaría hacer un pedido en *${store.name}*:\n\n`

    items.forEach(item => {
      message += `- ${item.name} (x${item.quantity}) - ₡${(item.price * item.quantity).toLocaleString()}\n`
    })

    message += `\n💰 *Total estimado: ₡${totalPrice.toLocaleString()}*\n\n`
    message += 'Quedo a la espera para coordinar el pago y envío. ¡Gracias!'

    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/${store.whatsapp_number}?text=${encodedMessage}`, '_blank')
  }

  // Prevent scroll when drawer is open
  React.useEffect(() => {
    document.body.style.overflow = isCartOpen ? 'hidden' : 'auto'
    return () => { document.body.style.overflow = 'auto' }
  }, [isCartOpen])

  if (!isCartOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity backdrop-blur-sm"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full md:w-[400px] bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            <h2 className="text-lg font-bold text-gray-900">Tu Pedido</h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-500 gap-4">
              <ShoppingBag className="w-12 h-12 text-gray-300" />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <img
                  src={item.image_url || 'https://via.placeholder.com/80?text=Sin+Img'}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg bg-white"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 line-clamp-1">{item.name}</h3>
                    <p className="font-bold" style={{ color: 'var(--color-primary)' }}>
                      ₡{item.price.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-white border rounded-lg px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="transition-colors text-gray-500 hover:text-[var(--color-primary)]"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="transition-colors text-gray-500 hover:text-[var(--color-primary)]"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-red-500 hover:underline font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 font-medium">Total estimado</span>
              <span className="text-xl font-bold text-gray-900">₡{totalPrice.toLocaleString()}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-white py-3.5 rounded-xl font-bold tracking-wide shadow-lg shadow-green-500/30 flex justify-center items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Finalizar pedido por WhatsApp</span>
            </button>
          </div>
        )}
      </div>
    </>
  )
}

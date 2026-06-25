'use client'

import React, { useEffect, useRef, useState } from 'react'
import { X, Minus, Plus, ShoppingBag, MessageCircle, Trash2, Package } from 'lucide-react'
import { useCart } from './CartContext'
import { useStore } from './StoreProvider'
import { usePathname } from 'next/navigation'

export function CartDrawer() {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeItem, totalPrice, totalItems } = useCart()
  const { store } = useStore()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const prevItemCount = useRef(items.length)
  const [flashId, setFlashId] = useState<string | null>(null)

  if (pathname.includes('/admin')) return null

  // Track newly added items for flash animation
  useEffect(() => {
    if (items.length > prevItemCount.current) {
      const newItem = items[items.length - 1]
      if (newItem) {
        setFlashId(newItem.id)
        setTimeout(() => setFlashId(null), 600)
      }
    }
    prevItemCount.current = items.length
  }, [items])

  // Mount + animate open/close
  useEffect(() => {
    if (isCartOpen) {
      setMounted(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true))
      })
    } else {
      setVisible(false)
      const timer = setTimeout(() => setMounted(false), 350)
      return () => clearTimeout(timer)
    }
  }, [isCartOpen])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isCartOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isCartOpen])

  const handleCheckout = () => {
    if (!store.whatsapp_number) {
      alert('No hay número de WhatsApp configurado para esta tienda.')
      return
    }
    let message = `👋 ¡Hola! Me gustaría hacer un pedido en *${store.name}*:\n\n`
    items.forEach(item => {
      message += `• ${item.name} (x${item.quantity}) — ₡${(item.price * item.quantity).toLocaleString()}\n`
    })
    message += `\n💰 *Total estimado: ₡${totalPrice.toLocaleString()}*\n\nQuedo a la espera para coordinar el pago y envío. ¡Gracias!`
    window.open(`https://wa.me/${store.whatsapp_number}?text=${encodeURIComponent(message)}`, '_blank')
  }

  if (!mounted) return null

  return (
    <>
      {/* ── Backdrop ─────────────────────────────── */}
      <div
        onClick={() => setIsCartOpen(false)}
        style={{
          position: 'fixed', inset: 0, zIndex: 40,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* ── Drawer Panel ─────────────────────────── */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          zIndex: 50,
          width: '100%', maxWidth: 420,
          display: 'flex', flexDirection: 'column',
          background: '#fff',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.15)',
          transform: visible ? 'translateX(0)' : 'translateX(110%)',
          transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 20px 16px',
          borderBottom: '1px solid #f0f0f0',
          background: '#fafafa',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              background: 'var(--color-primary)', borderRadius: 10,
              padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShoppingBag size={18} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: 16, color: '#111', margin: 0, lineHeight: 1 }}>
                Tu Pedido
              </h2>
              <p style={{ fontSize: 11, color: '#999', margin: 0, marginTop: 2, fontWeight: 600 }}>
                {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            style={{
              background: '#f3f3f3', border: 'none', borderRadius: '50%',
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#e8e8e8')}
            onMouseLeave={e => (e.currentTarget.style.background = '#f3f3f3')}
          >
            <X size={16} color="#555" />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.length === 0 ? (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 12,
              padding: '60px 0', color: '#bbb',
            }}>
              <Package size={52} strokeWidth={1.2} />
              <p style={{ fontWeight: 700, fontSize: 14, color: '#aaa', margin: 0 }}>Tu carrito está vacío</p>
              <p style={{ fontSize: 12, color: '#ccc', margin: 0 }}>Agrega productos para comenzar tu pedido</p>
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  display: 'flex', gap: 12,
                  padding: '12px 14px',
                  background: flashId === item.id ? 'rgba(var(--color-primary-rgb, 0,123,255), 0.06)' : '#fafafa',
                  borderRadius: 16,
                  border: `1.5px solid ${flashId === item.id ? 'var(--color-primary)' : '#f0f0f0'}`,
                  transition: 'all 0.3s ease',
                  animation: idx === items.length - 1 && flashId === item.id
                    ? 'cartItemIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' : undefined,
                }}
              >
                {/* Product Image */}
                <div style={{
                  width: 72, height: 72, borderRadius: 12, overflow: 'hidden',
                  flexShrink: 0, background: '#fff',
                  border: '1px solid #eee',
                }}>
                  <img
                    src={item.image_url || 'https://via.placeholder.com/80'}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Info */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 13, color: '#111', margin: 0, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </p>
                    <p style={{ fontWeight: 800, fontSize: 15, color: 'var(--color-primary)', margin: '3px 0 0' }}>
                      ₡{item.price.toLocaleString()}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    {/* Qty controls */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 2,
                      background: '#fff', border: '1.5px solid #e8e8e8',
                      borderRadius: 10, padding: '2px 4px',
                    }}>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        style={{
                          width: 28, height: 28, border: 'none', background: 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', borderRadius: 7, color: '#555', transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Minus size={13} />
                      </button>
                      <span style={{ fontWeight: 800, fontSize: 13, minWidth: 22, textAlign: 'center', color: '#111' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{
                          width: 28, height: 28, border: 'none', background: 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', borderRadius: 7, color: '#555', transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Subtotal + Delete */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 12, color: '#888' }}>
                        ₡{(item.price * item.quantity).toLocaleString()}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        style={{
                          width: 28, height: 28, border: 'none', background: 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', borderRadius: 8, color: '#ccc', transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2' }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#ccc'; e.currentTarget.style.background = 'transparent' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{
            padding: '16px 16px 20px',
            borderTop: '1px solid #f0f0f0',
            background: '#fafafa',
          }}>
            {/* Order summary */}
            <div style={{
              background: '#fff', borderRadius: 14, padding: '14px 16px',
              border: '1px solid #f0f0f0', marginBottom: 12,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#999', fontWeight: 600 }}>Subtotal ({totalItems} {totalItems === 1 ? 'artículo' : 'artículos'})</span>
                <span style={{ fontSize: 12, color: '#666', fontWeight: 700 }}>₡{totalPrice.toLocaleString()}</span>
              </div>
              <div style={{ height: 1, background: '#f5f5f5', margin: '10px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 15, color: '#111', fontWeight: 800 }}>Total estimado</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: '#111' }}>₡{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <button
              onClick={handleCheckout}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #25D366 0%, #1aab56 100%)',
                color: '#fff',
                fontWeight: 800, fontSize: 14,
                border: 'none', borderRadius: 14,
                padding: '15px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(37,211,102,0.4)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(37,211,102,0.5)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,211,102,0.4)' }}
            >
              <MessageCircle size={18} />
              Finalizar pedido por WhatsApp
            </button>

            <p style={{ textAlign: 'center', fontSize: 10, color: '#bbb', marginTop: 8, fontWeight: 500 }}>
              Coordinarás el pago directamente con la tienda
            </p>
          </div>
        )}
      </div>

      {/* Keyframe styles */}
      <style>{`
        @keyframes cartItemIn {
          0% { transform: translateX(30px) scale(0.95); opacity: 0; }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }
      `}</style>
    </>
  )
}

'use client'

import type { Product } from '@/lib/supabase'
import { useCart } from './CartContext'
import { useStore } from './StoreProvider'
import { MessageCircle } from 'lucide-react'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const { store, basePath } = useStore()

  const handleInterested = () => {
    if (!store.whatsapp_number) return alert('WhatsApp no configurado')
    const message = encodeURIComponent(
      `Hola, estoy interesado en este artículo:\n*${product.name}*\nPrecio: ₡${product.price.toLocaleString()}\n\n¿Me pueden dar más información?`
    )
    window.open(`https://wa.me/${store.whatsapp_number}?text=${message}`, '_blank')
  }

  const hasDiscount = product.compare_price && product.compare_price > product.price

  return (
    <div className="group flex flex-col h-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">

      {/* Image */}
      <a
        href={`${basePath}/productos/${product.id}`}
        className="relative block overflow-hidden aspect-[4/3] bg-gray-50"
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Sin+Imagen' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">Sin Fotografía</div>
        )}

        {/* Tags */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {!product.is_available && (
            <span className="text-[10px] uppercase tracking-widest font-bold text-white bg-red-500 px-3 py-1 rounded-full">
              Agotado
            </span>
          )}
          {product.is_featured && (
            <span
              className="text-[10px] uppercase tracking-widest font-bold text-white px-3 py-1 rounded-full"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              Destacado
            </span>
          )}
          {hasDiscount && (
            <span className="text-[10px] uppercase tracking-widest font-bold text-white bg-red-500 px-3 py-1 rounded-full">
              Oferta
            </span>
          )}
        </div>
      </a>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4">
        <a
          href={`${basePath}/productos/${product.id}`}
          className="font-bold text-gray-900 text-sm mb-1 line-clamp-2 hover:text-[var(--color-primary)] transition-colors"
        >
          {product.name}
        </a>

        {product.description && (
          <p className="text-gray-400 text-xs line-clamp-2 font-light leading-relaxed mb-2">
            {product.description}
          </p>
        )}

        <div className="mt-auto pt-3 border-t border-gray-100">
          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-gray-900 font-extrabold text-lg">₡{product.price.toLocaleString()}</p>
            {hasDiscount && (
              <p className="text-gray-400 text-sm line-through">₡{product.compare_price!.toLocaleString()}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => addItem(product)}
              disabled={!product.is_available}
              className={`w-full py-3 text-xs tracking-wider uppercase font-bold rounded-xl transition-all ${
                !product.is_available
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'text-white hover:brightness-110 shadow-sm'
              }`}
              style={product.is_available ? { backgroundColor: 'var(--color-primary)' } : {}}
            >
              {product.is_available ? 'Agregar al carrito' : 'No disponible'}
            </button>

            <button
              onClick={handleInterested}
              className="w-full py-3 text-xs tracking-wider uppercase font-bold rounded-xl border-2 transition-all flex items-center justify-center gap-2"
              style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Pedir por WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

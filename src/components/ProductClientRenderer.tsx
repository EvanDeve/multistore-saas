'use client'

import type { Product } from '@/lib/supabase'
import { useCart } from './CartContext'
import { useStore } from './StoreProvider'
import { MessageCircle, ShoppingBag } from 'lucide-react'

interface ProductClientRendererProps {
  product: Product
  categoryName: string
}

export function ProductClientRenderer({ product, categoryName }: ProductClientRendererProps) {
  const { addItem } = useCart()
  const { store } = useStore()

  const hasDiscount = product.compare_price && product.compare_price > product.price

  const handleInterested = () => {
    if (!store.whatsapp_number) return alert('WhatsApp no configurado')
    const message = encodeURIComponent(
      `Hola, estoy interesado en este artículo:\n*${product.name}*\nPrecio: ₡${product.price.toLocaleString()}\n\n¿Me pueden dar más información?`
    )
    window.open(`https://wa.me/${store.whatsapp_number}?text=${message}`, '_blank')
  }

  return (
    <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

      {/* Image */}
      <div className="w-full lg:w-1/2">
        <div className="relative aspect-[4/5] bg-gray-50 flex items-center justify-center border border-gray-200 rounded-2xl overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x1000?text=Sin+Imagen'
              }}
            />
          ) : (
            <span className="text-gray-400">Sin Fotografía</span>
          )}
          {!product.is_available && (
            <div className="absolute top-4 left-4 text-[10px] uppercase tracking-widest font-bold text-white bg-red-500 px-4 py-2 rounded-full">
              No Disponible
            </div>
          )}
          {hasDiscount && (
            <div className="absolute top-4 right-4 text-[10px] uppercase tracking-widest font-bold text-white bg-red-500 px-4 py-2 rounded-full">
              Oferta
            </div>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="w-full lg:w-1/2 flex flex-col justify-start pt-4 lg:pt-10">
        {categoryName && (
          <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">
            {categoryName}
          </span>
        )}

        <h1 className="text-3xl lg:text-5xl font-bold text-black tracking-tighter mb-4 leading-none">
          {product.name}
        </h1>

        <div className="flex items-baseline gap-3 mb-10">
          <span className="text-xl lg:text-2xl font-semibold text-black">
            ₡{product.price.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-lg text-gray-400 line-through">
              ₡{product.compare_price!.toLocaleString()}
            </span>
          )}
        </div>

        {product.description && (
          <div className="mb-12">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-2">
              Descripción del Producto
            </h3>
            <p className="text-gray-600 text-sm font-light leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        )}

        <div className="mb-12 flex items-center text-sm border border-gray-100 p-4">
          <span className="w-32 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
            Disponibilidad
          </span>
          <span className={`font-semibold text-xs tracking-widest uppercase ${product.is_available ? 'text-black' : 'text-red-600'}`}>
            {product.is_available ? 'Disponible' : 'No disponible'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-auto pt-8">
          <button
            onClick={() => addItem(product)}
            disabled={!product.is_available}
            className={`flex-1 py-4 text-xs tracking-widest uppercase font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-3 ${
              !product.is_available
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'text-white hover:brightness-110'
            }`}
            style={product.is_available ? { backgroundColor: 'var(--color-primary)' } : {}}
          >
            <ShoppingBag className="w-4 h-4" />
            {product.is_available ? 'Añadir a la Bolsa' : 'No Disponible'}
          </button>

          <button
            onClick={handleInterested}
            className="flex-1 py-4 text-xs tracking-widest uppercase font-bold rounded-xl border-2 transition-all flex items-center justify-center gap-3"
            style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
          >
            <MessageCircle className="w-4 h-4" />
            Pedir o Consultar
          </button>
        </div>
      </div>
    </div>
  )
}

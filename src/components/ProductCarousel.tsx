'use client'

import React, { useRef } from 'react'
import type { Product } from '@/lib/supabase'
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react'
import { useCart } from './CartContext'

interface ProductCarouselProps {
  title: string
  products: Product[]
  slug: string
}

export function ProductCarousel({ title, products, slug }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { addItem } = useCart()

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300 // roughly one card width
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  if (!products || products.length === 0) return null

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h2>
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar -mx-6 px-6 lg:mx-0 lg:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <div 
              key={product.id} 
              className="min-w-[260px] sm:min-w-[280px] max-w-[280px] flex-shrink-0 snap-start group relative flex flex-col"
            >
              <a href={`/t/${slug}/productos/${product.id}`} className="block relative aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-4 border border-gray-100">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                    Sin imagen
                  </div>
                )}
                {product.compare_price && product.compare_price > product.price && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
                    Oferta
                  </div>
                )}
              </a>

              <div className="flex-1 flex flex-col">
                <a href={`/t/${slug}/productos/${product.id}`} className="block flex-1">
                  <h3 className="font-semibold text-gray-900 text-base line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors mb-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-black text-gray-900 text-lg">
                      ₡{product.price.toLocaleString()}
                    </span>
                    {product.compare_price && product.compare_price > product.price && (
                      <span className="text-gray-400 text-sm line-through">
                        ₡{product.compare_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </a>
                
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    addItem(product)
                  }}
                  className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shadow-sm"
                >
                  <ShoppingCart className="w-4 h-4" /> Agregar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

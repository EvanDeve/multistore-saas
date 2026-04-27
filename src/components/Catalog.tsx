'use client'

import { useState, useMemo } from 'react'
import type { Product, Category } from '@/lib/supabase'
import { ProductCard } from './ProductCard'
import { Search, Filter, AlertCircle, Package } from 'lucide-react'

interface CatalogProps {
  initialProducts: Product[]
  categories: Category[]
  dbError: string | null
}

export function Catalog({ initialProducts, categories, dbError }: CatalogProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const maxPossiblePrice = useMemo(() =>
    initialProducts.length > 0 ? Math.max(...initialProducts.map(p => p.price)) : 100000,
    [initialProducts]
  )

  const [selectedMaxPrice, setSelectedMaxPrice] = useState<number | null>(null)
  const currentMaxPrice = selectedMaxPrice !== null ? selectedMaxPrice : maxPossiblePrice

  const filteredProducts = useMemo(() =>
    initialProducts.filter(p => {
      const matchCategory = activeCategory === 'all' || p.category_id === activeCategory
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchPrice = p.price <= currentMaxPrice
      return matchCategory && matchSearch && matchPrice
    }),
    [initialProducts, activeCategory, searchQuery, currentMaxPrice]
  )

  if (dbError) {
    return (
      <div className="border border-red-200 bg-red-50 rounded-2xl p-8 text-center max-w-xl mx-auto">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">Error de conexión</h3>
        <p className="text-red-700 text-sm">{dbError}</p>
      </div>
    )
  }

  if (initialProducts.length === 0) {
    return (
      <div className="py-32 text-center flex flex-col items-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, white)' }}
        >
          <Package className="w-7 h-7" style={{ color: 'var(--color-primary)' }} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Catálogo vacío</h3>
        <p className="text-gray-500 text-sm">No hay artículos disponibles por el momento.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-10 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-5 items-end">

          {/* Search */}
          <div className="w-full lg:w-1/3">
            <label
              className="block text-[11px] font-bold uppercase tracking-widest mb-2"
              style={{ color: 'var(--color-primary)' }}
            >
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Nombre o descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="w-full lg:w-2/3 flex flex-col sm:flex-row gap-5">
            {/* Category filter */}
            <div className="w-full sm:w-1/2">
              <label
                className="block text-[11px] font-bold uppercase tracking-widest mb-2"
                style={{ color: 'var(--color-primary)' }}
              >
                Categoría
              </label>
              <div className="relative">
                <select
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 outline-none text-sm appearance-none cursor-pointer"
                >
                  <option value="all">Todos</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Price filter */}
            <div className="w-full sm:w-1/2">
              <div className="flex justify-between items-baseline mb-2">
                <label
                  className="block text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Precio máx.
                </label>
                <span className="text-xs font-bold text-gray-900">₡{currentMaxPrice.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="0"
                max={maxPossiblePrice}
                step="1000"
                value={currentMaxPrice}
                onChange={(e) => setSelectedMaxPrice(Number(e.target.value))}
                className="w-full cursor-pointer h-2 rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Count */}
      <p className="text-sm text-gray-400 font-medium mb-6">
        {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
      </p>

      {/* Empty state */}
      {filteredProducts.length === 0 && (
        <div className="py-24 text-center">
          <Filter className="w-10 h-10 mx-auto mb-4 text-gray-200" />
          <p className="text-gray-500 font-medium mb-4">No hay coincidencias para estos filtros.</p>
          <button
            onClick={() => { setSearchQuery(''); setActiveCategory('all'); setSelectedMaxPrice(null) }}
            className="text-sm font-bold rounded-xl border-2 px-6 py-2.5 transition-all"
            style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
          >
            Restaurar Filtros
          </button>
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

import { getStore } from '@/lib/get-store'
import { supabase, type Product, type Category } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { Catalog } from '@/components/Catalog'

export const dynamic = 'force-dynamic'

interface ProductosPageProps {
  params: Promise<{ slug: string }>
}

export default async function ProductosPage({ params }: ProductosPageProps) {
  const { slug } = await params
  const store = await getStore(slug)
  if (!store) notFound()

  // Fetch products and categories for this store in parallel
  const [productsResult, categoriesResult] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('store_id', store.id)
      .eq('is_available', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('categories')
      .select('*')
      .eq('store_id', store.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
  ])

  const products = (productsResult.data as Product[]) || []
  const categories = (categoriesResult.data as Category[]) || []
  const dbError = productsResult.error?.message || null

  return (
    <div className="w-full min-h-screen bg-[#fafafa]">
      {/* Header */}
      <section className="bg-white border-b border-gray-200/60 shadow-sm py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Catálogo de Productos
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Explora nuestro catálogo y arma tu pedido con un par de clics.
          </p>
        </div>
      </section>

      {/* Catalog */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Catalog
          initialProducts={products}
          categories={categories}
          dbError={dbError}
        />
      </section>
    </div>
  )
}

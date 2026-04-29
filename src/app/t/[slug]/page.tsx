import { getStore } from '@/lib/get-store'
import { getSupabaseAdmin, type Product, type Category } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { HeroBanner } from '@/components/HeroBanner'
import { ProductCarousel } from '@/components/ProductCarousel'
import { ShieldCheck, Clock, Zap } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface StoreHomeProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function StoreHome({ params }: StoreHomeProps) {
  const { slug } = await params
  const store = await getStore(slug)
  if (!store) notFound()

  const admin = getSupabaseAdmin()

  // Fetch all active categories for this store
  const { data: categories } = await admin
    .from('categories')
    .select('*')
    .eq('store_id', store.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  const storeCategories = (categories as Category[]) || []

  // Fetch all available products
  const { data: products } = await admin
    .from('products')
    .select('*')
    .eq('store_id', store.id)
    .eq('is_available', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  const allProducts = (products as Product[]) || []

  return (
    <div className="w-full bg-white">
      {/* Dynamic Hero Banner */}
      <HeroBanner store={store} slug={slug} />

      {/* Categorías Destacadas Grid */}
      {storeCategories.length > 0 && (
        <section className="py-16 px-6 lg:px-8 bg-gray-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-8">Nuestras Categorías</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {storeCategories.map((cat) => (
                <a
                  key={cat.id}
                  href={`/t/${slug}/productos?categoria=${cat.slug}`}
                  className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all group"
                >
                  <span className="font-bold text-gray-700 group-hover:text-[var(--color-primary)] transition-colors text-center text-sm">
                    {cat.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Carousels por Categoría o Único */}
      {storeCategories.length > 0 ? (
        <div className="space-y-4">
          {storeCategories.map(cat => {
            const catProducts = allProducts.filter(p => p.category_id === cat.id)
            if (catProducts.length === 0) return null
            return (
              <ProductCarousel 
                key={cat.id}
                title={cat.name}
                products={catProducts}
                slug={slug}
              />
            )
          })}
        </div>
      ) : (
        <div className="mt-8">
          <ProductCarousel 
            title="Todos nuestros productos"
            products={allProducts}
            slug={slug}
          />
        </div>
      )}

      {/* Propuesta de Valor de la Tienda */}
      <section className="py-16 px-6 bg-gray-950 text-white mt-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-800">
          <div className="flex flex-col items-center text-center pt-8 md:pt-0 px-4">
            <ShieldCheck className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="font-bold text-lg mb-2">Sin registro necesario</h3>
            <p className="text-gray-400 text-sm">Comprá directo, sin crear cuentas ni contraseñas.</p>
          </div>
          <div className="flex flex-col items-center text-center pt-8 md:pt-0 px-4">
            <Zap className="w-8 h-8 text-yellow-400 mb-4" />
            <h3 className="font-bold text-lg mb-2">Pedidos por WhatsApp</h3>
            <p className="text-gray-400 text-sm">Fácil, rápido y seguro. Hablás directo con nosotros.</p>
          </div>
          <div className="flex flex-col items-center text-center pt-8 md:pt-0 px-4">
            <Clock className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="font-bold text-lg mb-2">Respuesta rápida</h3>
            <p className="text-gray-400 text-sm">Atendemos tu pedido al instante para confirmar entrega.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

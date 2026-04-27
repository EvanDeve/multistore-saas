import { getStore } from '@/lib/get-store'
import { supabase, type Product } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { HeroBanner } from '@/components/HeroBanner'

export const dynamic = 'force-dynamic'

interface StoreHomeProps {
  params: Promise<{ slug: string }>
}

export default async function StoreHome({ params }: StoreHomeProps) {
  const { slug } = await params
  const store = await getStore(slug)
  if (!store) notFound()

  // Fetch featured products for the home page
  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', store.id)
    .eq('is_available', true)
    .eq('is_featured', true)
    .order('sort_order', { ascending: true })
    .limit(8)

  return (
    <div className="w-full bg-white">
      {/* Dynamic Hero Banner */}
      <HeroBanner
        store={store}
        slug={slug}
      />

      {/* Featured Products Preview */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-20 px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <span
                className="text-xs font-bold tracking-widest uppercase"
                style={{ color: 'var(--color-primary)' }}
              >
                Destacados
              </span>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-2">
                Productos Destacados
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {(featuredProducts as Product[]).map((product) => (
                <a
                  key={product.id}
                  href={`/t/${slug}/productos/${product.id}`}
                  className="group block"
                >
                  <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 mb-3">
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
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors">
                    {product.name}
                  </h3>
                  <p className="font-bold text-gray-900 text-sm mt-1">
                    ₡{product.price.toLocaleString()}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

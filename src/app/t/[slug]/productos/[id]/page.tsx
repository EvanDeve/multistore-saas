import { getStore } from '@/lib/get-store'
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ProductClientRenderer } from '@/components/ProductClientRenderer'

export const dynamic = 'force-dynamic'

interface ProductPageProps {
  params: Promise<{ slug: string; id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug, id } = await params
  const store = await getStore(slug)
  if (!store) notFound()

  // Fetch the product — verify it belongs to this store
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('store_id', store.id)
    .single()

  if (error || !product) {
    notFound()
  }

  // Fetch the category name if the product has one
  let categoryName = ''
  if (product.category_id) {
    const { data: category } = await supabase
      .from('categories')
      .select('name')
      .eq('id', product.category_id)
      .single()
    categoryName = category?.name || ''
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-24">
        <Link
          href={`/t/${slug}/productos`}
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase mb-16 hover:text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Catálogo
        </Link>

        <ProductClientRenderer
          product={product}
          categoryName={categoryName}
        />
      </div>
    </div>
  )
}

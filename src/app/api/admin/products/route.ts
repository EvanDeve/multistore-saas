import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { authenticateStoreAdmin, validateString, validatePrice } from '@/lib/api-auth'

/**
 * GET /api/admin/products
 * List all products for the authenticated admin's store.
 * Includes unavailable products (admin needs to see everything).
 */
export async function GET(request: NextRequest) {
  const auth = await authenticateStoreAdmin(request)
  if (auth instanceof NextResponse) return auth

  const admin = getSupabaseAdmin()
  const { data, error } = await admin
    .from('products')
    .select('*, categories(name)')
    .eq('store_id', auth.store.id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Error cargando productos' }, { status: 500 })
  }

  return NextResponse.json({ products: data })
}

/**
 * POST /api/admin/products
 * Create a new product for the authenticated admin's store.
 * store_id is derived server-side — never accepted from client.
 */
export async function POST(request: NextRequest) {
  const auth = await authenticateStoreAdmin(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()

    // Validate required fields
    const nameError = validateString(body.name, 'Nombre', 1, 200)
    if (nameError) return NextResponse.json({ error: nameError }, { status: 400 })

    const priceError = validatePrice(body.price, 'Precio')
    if (priceError) return NextResponse.json({ error: priceError }, { status: 400 })

    if (body.compare_price !== null && body.compare_price !== undefined) {
      const cpError = validatePrice(body.compare_price, 'Precio de comparación')
      if (cpError) return NextResponse.json({ error: cpError }, { status: 400 })
    }

    // If category_id is provided, verify it belongs to this store
    if (body.category_id) {
      const adminClient = getSupabaseAdmin()
      const { data: cat } = await adminClient
        .from('categories')
        .select('id')
        .eq('id', body.category_id)
        .eq('store_id', auth.store.id)
        .single()

      if (!cat) {
        return NextResponse.json(
          { error: 'Categoría no encontrada o no pertenece a tu tienda' },
          { status: 400 }
        )
      }
    }

    const admin = getSupabaseAdmin()
    const { data, error } = await admin
      .from('products')
      .insert({
        store_id: auth.store.id, // ← ALWAYS derived server-side
        category_id: body.category_id || null,
        name: body.name.trim(),
        description: body.description?.trim() || '',
        price: Number(body.price),
        compare_price: body.compare_price ? Number(body.compare_price) : null,
        image_url: body.image_url || '',
        is_available: body.is_available !== false,
        is_featured: body.is_featured === true,
        sort_order: Number(body.sort_order) || 0,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Error creando producto' }, { status: 500 })
    }

    return NextResponse.json({ product: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}

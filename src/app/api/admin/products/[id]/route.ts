import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { authenticateStoreAdmin, validateString, validatePrice } from '@/lib/api-auth'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * PUT /api/admin/products/[id]
 * Update a product. Verifies the product belongs to the admin's store.
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await authenticateStoreAdmin(request)
  if (auth instanceof NextResponse) return auth

  const { id } = await context.params
  const admin = getSupabaseAdmin()

  // Verify product belongs to this store
  const { data: existing } = await admin
    .from('products')
    .select('id')
    .eq('id', id)
    .eq('store_id', auth.store.id)
    .single()

  if (!existing) {
    return NextResponse.json(
      { error: 'Producto no encontrado' },
      { status: 404 }
    )
  }

  try {
    const body = await request.json()

    // Validate fields if provided
    if (body.name !== undefined) {
      const nameError = validateString(body.name, 'Nombre', 1, 200)
      if (nameError) return NextResponse.json({ error: nameError }, { status: 400 })
    }
    if (body.price !== undefined) {
      const priceError = validatePrice(body.price, 'Precio')
      if (priceError) return NextResponse.json({ error: priceError }, { status: 400 })
    }

    // If category_id is changed, verify it belongs to this store
    if (body.category_id) {
      const { data: cat } = await admin
        .from('categories')
        .select('id')
        .eq('id', body.category_id)
        .eq('store_id', auth.store.id)
        .single()

      if (!cat) {
        return NextResponse.json(
          { error: 'Categoría no válida' },
          { status: 400 }
        )
      }
    }

    // Build update object — only include provided fields
    const updateData: Record<string, unknown> = {}
    if (body.name !== undefined) updateData.name = body.name.trim()
    if (body.description !== undefined) updateData.description = body.description?.trim() || ''
    if (body.price !== undefined) updateData.price = Number(body.price)
    if (body.compare_price !== undefined) updateData.compare_price = body.compare_price ? Number(body.compare_price) : null
    if (body.category_id !== undefined) updateData.category_id = body.category_id || null
    if (body.image_url !== undefined) updateData.image_url = body.image_url
    if (body.is_available !== undefined) updateData.is_available = Boolean(body.is_available)
    if (body.is_featured !== undefined) updateData.is_featured = Boolean(body.is_featured)
    if (body.sort_order !== undefined) updateData.sort_order = Number(body.sort_order) || 0

    const { data, error } = await admin
      .from('products')
      .update(updateData)
      .eq('id', id)
      .eq('store_id', auth.store.id) // Double-check store ownership
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Error actualizando producto' }, { status: 500 })
    }

    return NextResponse.json({ product: data })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}

/**
 * DELETE /api/admin/products/[id]
 * Delete a product. Verifies the product belongs to the admin's store.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await authenticateStoreAdmin(request)
  if (auth instanceof NextResponse) return auth

  const { id } = await context.params
  const admin = getSupabaseAdmin()

  const { error } = await admin
    .from('products')
    .delete()
    .eq('id', id)
    .eq('store_id', auth.store.id) // Only delete if it belongs to this store

  if (error) {
    return NextResponse.json({ error: 'Error eliminando producto' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

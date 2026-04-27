import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { authenticateStoreAdmin, validateString } from '@/lib/api-auth'

/**
 * GET /api/admin/categories
 * List all categories for the authenticated admin's store.
 */
export async function GET(request: NextRequest) {
  const auth = await authenticateStoreAdmin(request)
  if (auth instanceof NextResponse) return auth

  const admin = getSupabaseAdmin()
  const { data, error } = await admin
    .from('categories')
    .select('*')
    .eq('store_id', auth.store.id)
    .order('sort_order', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'Error cargando categorías' }, { status: 500 })
  }

  return NextResponse.json({ categories: data })
}

/**
 * POST /api/admin/categories
 * Create a new category for the authenticated admin's store.
 */
export async function POST(request: NextRequest) {
  const auth = await authenticateStoreAdmin(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()

    const nameError = validateString(body.name, 'Nombre', 1, 80)
    if (nameError) return NextResponse.json({ error: nameError }, { status: 400 })

    // Auto-generate slug from name
    const slug = body.name
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    if (!slug) {
      return NextResponse.json({ error: 'No se pudo generar un slug válido' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()
    const { data, error } = await admin
      .from('categories')
      .insert({
        store_id: auth.store.id,
        name: body.name.trim(),
        slug,
        sort_order: Number(body.sort_order) || 0,
        is_active: body.is_active !== false,
      })
      .select()
      .single()

    if (error) {
      // Unique constraint violation — slug already exists for this store
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Ya existe una categoría con ese nombre en tu tienda' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: 'Error creando categoría' }, { status: 500 })
    }

    return NextResponse.json({ category: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}

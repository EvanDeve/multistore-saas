import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { authenticateStoreAdmin, validateString } from '@/lib/api-auth'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * PUT /api/admin/categories/[id]
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await authenticateStoreAdmin(request)
  if (auth instanceof NextResponse) return auth

  const { id } = await context.params
  const admin = getSupabaseAdmin()

  // Verify category belongs to this store
  const { data: existing } = await admin
    .from('categories')
    .select('id')
    .eq('id', id)
    .eq('store_id', auth.store.id)
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 })
  }

  try {
    const body = await request.json()

    const updateData: Record<string, unknown> = {}
    if (body.name !== undefined) {
      const nameError = validateString(body.name, 'Nombre', 1, 80)
      if (nameError) return NextResponse.json({ error: nameError }, { status: 400 })
      updateData.name = body.name.trim()

      // Regenerate slug
      updateData.slug = body.name
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    }
    if (body.sort_order !== undefined) updateData.sort_order = Number(body.sort_order) || 0
    if (body.is_active !== undefined) updateData.is_active = Boolean(body.is_active)

    const { data, error } = await admin
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .eq('store_id', auth.store.id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Ya existe una categoría con ese nombre' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: 'Error actualizando categoría' }, { status: 500 })
    }

    return NextResponse.json({ category: data })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}

/**
 * DELETE /api/admin/categories/[id]
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await authenticateStoreAdmin(request)
  if (auth instanceof NextResponse) return auth

  const { id } = await context.params
  const admin = getSupabaseAdmin()

  const { error } = await admin
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('store_id', auth.store.id)

  if (error) {
    return NextResponse.json({ error: 'Error eliminando categoría' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

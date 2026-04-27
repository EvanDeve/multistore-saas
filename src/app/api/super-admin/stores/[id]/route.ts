import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import {
  authenticateSuperAdmin,
  logSuperAdminAction,
  validateString,
  validateHexColor,
  validateEmail,
} from '@/lib/api-auth'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/super-admin/stores/[id]
 * Get a single store with all details.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await authenticateSuperAdmin(request)
  if (auth instanceof NextResponse) return auth

  const { id } = await context.params
  const admin = getSupabaseAdmin()

  const { data: store, error } = await admin
    .from('stores')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !store) {
    return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
  }

  // Get product & category counts
  const [productsResult, categoriesResult] = await Promise.all([
    admin.from('products').select('*', { count: 'exact', head: true }).eq('store_id', id),
    admin.from('categories').select('*', { count: 'exact', head: true }).eq('store_id', id),
  ])

  return NextResponse.json({
    store: {
      ...store,
      product_count: productsResult.count || 0,
      category_count: categoriesResult.count || 0,
    },
  })
}

/**
 * PUT /api/super-admin/stores/[id]
 * Update a store's configuration.
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await authenticateSuperAdmin(request)
  if (auth instanceof NextResponse) return auth

  const { id } = await context.params

  try {
    const body = await request.json()

    // Validate fields if provided
    if (body.name !== undefined) {
      const nameError = validateString(body.name, 'Nombre', 2, 100)
      if (nameError) return NextResponse.json({ error: nameError }, { status: 400 })
    }
    if (body.admin_email !== undefined && !validateEmail(body.admin_email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }
    if (body.primary_color !== undefined && !validateHexColor(body.primary_color)) {
      return NextResponse.json({ error: 'Color primario inválido' }, { status: 400 })
    }
    if (body.secondary_color !== undefined && !validateHexColor(body.secondary_color)) {
      return NextResponse.json({ error: 'Color secundario inválido' }, { status: 400 })
    }
    if (body.accent_color !== undefined && !validateHexColor(body.accent_color)) {
      return NextResponse.json({ error: 'Color de acento inválido' }, { status: 400 })
    }

    // Build update object — only include provided fields
    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'name', 'description', 'logo_url', 'banner_url',
      'banner_text', 'banner_sub', 'primary_color', 'secondary_color',
      'accent_color', 'whatsapp_number', 'whatsapp_message',
      'admin_email', 'is_active',
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (typeof body[field] === 'string') {
          updateData[field] = body[field].trim()
        } else {
          updateData[field] = body[field]
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No se proporcionaron campos para actualizar' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()
    const { data, error } = await admin
      .from('stores')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Store update error:', error)
      return NextResponse.json({ error: 'Error actualizando la tienda' }, { status: 500 })
    }

    // Audit log
    await logSuperAdminAction('store_updated', auth.email, id, {
      updated_fields: Object.keys(updateData),
    })

    return NextResponse.json({ store: data })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}

/**
 * DELETE /api/super-admin/stores/[id]
 * Delete a store and all its data (cascade).
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await authenticateSuperAdmin(request)
  if (auth instanceof NextResponse) return auth

  const { id } = await context.params
  const admin = getSupabaseAdmin()

  // Get store info before deletion for the audit log
  const { data: store } = await admin
    .from('stores')
    .select('slug, name')
    .eq('id', id)
    .single()

  if (!store) {
    return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
  }

  const { error } = await admin
    .from('stores')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Error eliminando la tienda' }, { status: 500 })
  }

  // Audit log (store_id will be null since we deleted it)
  await logSuperAdminAction('store_deleted', auth.email, null, {
    deleted_slug: store.slug,
    deleted_name: store.name,
  })

  return NextResponse.json({ success: true })
}

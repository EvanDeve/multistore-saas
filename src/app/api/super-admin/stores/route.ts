import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import {
  authenticateSuperAdmin,
  logSuperAdminAction,
  validateString,
  validateHexColor,
  validateEmail,
  validateSlug,
} from '@/lib/api-auth'

/**
 * GET /api/super-admin/stores
 * List all stores with product counts (active and inactive).
 */
export async function GET(request: NextRequest) {
  const auth = await authenticateSuperAdmin(request)
  if (auth instanceof NextResponse) return auth

  const admin = getSupabaseAdmin()

  // Get all stores
  const { data: stores, error } = await admin
    .from('stores')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Error cargando tiendas' }, { status: 500 })
  }

  // Get product counts per store
  const storesWithCounts = await Promise.all(
    (stores || []).map(async (store) => {
      const { count } = await admin
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', store.id)

      return { ...store, product_count: count || 0 }
    })
  )

  return NextResponse.json({ stores: storesWithCounts })
}

/**
 * POST /api/super-admin/stores
 * Create a new store.
 */
export async function POST(request: NextRequest) {
  const auth = await authenticateSuperAdmin(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()

    // ─── Validation ─────────────────────────────
    const errors: string[] = []

    if (!validateSlug(body.slug)) {
      errors.push('Slug inválido (3-50 caracteres, solo letras minúsculas, números y guiones)')
    }

    const nameError = validateString(body.name, 'Nombre de tienda', 2, 100)
    if (nameError) errors.push(nameError)

    if (!validateEmail(body.admin_email)) {
      errors.push('Email del administrador inválido')
    }

    if (body.primary_color && !validateHexColor(body.primary_color)) {
      errors.push('Color primario inválido (formato: #RRGGBB)')
    }
    if (body.secondary_color && !validateHexColor(body.secondary_color)) {
      errors.push('Color secundario inválido')
    }
    if (body.accent_color && !validateHexColor(body.accent_color)) {
      errors.push('Color de acento inválido')
    }

    if (body.whatsapp_number && typeof body.whatsapp_number === 'string' && body.whatsapp_number.length > 20) {
      errors.push('Número de WhatsApp demasiado largo')
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join('. ') }, { status: 400 })
    }

    // ─── Create store ───────────────────────────
    const admin = getSupabaseAdmin()
    const { data, error } = await admin
      .from('stores')
      .insert({
        slug: body.slug.trim().toLowerCase(),
        name: body.name.trim(),
        description: body.description?.trim() || '',
        logo_url: body.logo_url || '',
        banner_url: body.banner_url || '',
        banner_text: body.banner_text?.trim() || '',
        banner_sub: body.banner_sub?.trim() || '',
        primary_color: body.primary_color || '#007bff',
        secondary_color: body.secondary_color || '#0062cc',
        accent_color: body.accent_color || '#00c853',
        whatsapp_number: body.whatsapp_number?.trim() || '',
        whatsapp_message: body.whatsapp_message?.trim() || 'Hola, quiero hacer un pedido',
        admin_email: body.admin_email.trim().toLowerCase(),
        is_active: body.is_active !== false,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'El slug ya está en uso por otra tienda' },
          { status: 409 }
        )
      }
      console.error('Store creation error:', error)
      return NextResponse.json({ error: 'Error creando la tienda' }, { status: 500 })
    }

    // Audit log
    await logSuperAdminAction('store_created', auth.email, data.id, {
      slug: data.slug,
      name: data.name,
      admin_email: data.admin_email,
    })

    return NextResponse.json({ store: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}

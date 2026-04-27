import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { authenticateSuperAdmin } from '@/lib/api-auth'

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * POST /api/super-admin/upload
 * Upload images for any store (logo, banner, etc).
 *
 * Expects multipart/form-data with:
 * - file: The image file
 * - store_id: The target store's UUID
 * - type: "logo" | "banner" | "product"
 */
export async function POST(request: NextRequest) {
  const auth = await authenticateSuperAdmin(request)
  if (auth instanceof NextResponse) return auth

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const storeId = formData.get('store_id') as string | null
    const uploadType = (formData.get('type') as string) || 'logo'

    if (!file) {
      return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 })
    }
    if (!storeId) {
      return NextResponse.json({ error: 'store_id es requerido' }, { status: 400 })
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Tipo de archivo no permitido: ${file.type}` },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'El archivo excede 5MB' },
        { status: 400 }
      )
    }

    // Verify store exists
    const admin = getSupabaseAdmin()
    const { data: store } = await admin
      .from('stores')
      .select('id')
      .eq('id', storeId)
      .single()

    if (!store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    // Upload
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${ext}`
    const storagePath = `${storeId}/${uploadType}/${fileName}`

    const fileBuffer = await file.arrayBuffer()
    const { error: uploadError } = await admin.storage
      .from('stores-assets')
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Error subiendo archivo' }, { status: 500 })
    }

    const { data: urlData } = admin.storage
      .from('stores-assets')
      .getPublicUrl(storagePath)

    return NextResponse.json({
      url: urlData.publicUrl,
      path: storagePath,
    })
  } catch {
    return NextResponse.json({ error: 'Error procesando la solicitud' }, { status: 500 })
  }
}

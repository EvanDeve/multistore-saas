import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { authenticateStoreAdmin } from '@/lib/api-auth'

// Allowed MIME types for image uploads
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024

/**
 * POST /api/admin/upload
 * Uploads an image to Supabase Storage for the authenticated admin's store.
 *
 * Expects multipart/form-data with:
 * - file: The image file
 * - type: "product" | "logo" | "banner" (determines storage path)
 *
 * Returns the public URL of the uploaded image.
 */
export async function POST(request: NextRequest) {
  const auth = await authenticateStoreAdmin(request)
  if (auth instanceof NextResponse) return auth

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const uploadType = (formData.get('type') as string) || 'product'

    if (!file) {
      return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 })
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Tipo de archivo no permitido: ${file.type}. Solo se aceptan imágenes (JPEG, PNG, WebP, GIF, AVIF).` },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `El archivo excede el tamaño máximo permitido (5MB). Tamaño actual: ${(file.size / 1024 / 1024).toFixed(1)}MB` },
        { status: 400 }
      )
    }

    // Generate storage path: stores-assets/{store_id}/{type}/{timestamp}_{random}.{ext}
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 10)
    const fileName = `${timestamp}_${random}.${ext}`
    const storagePath = `${auth.store.id}/${uploadType}/${fileName}`

    // Upload to Supabase Storage
    const admin = getSupabaseAdmin()
    const fileBuffer = await file.arrayBuffer()

    const { error: uploadError } = await admin.storage
      .from('stores-assets')
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Error subiendo el archivo' },
        { status: 500 }
      )
    }

    // Get public URL
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

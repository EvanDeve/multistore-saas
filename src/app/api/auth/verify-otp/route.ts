import { NextRequest, NextResponse } from 'next/server'
import { supabase, getStoreByAdminEmail } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json()

    if (!email || !token) {
      return NextResponse.json({ error: 'Email y código requeridos' }, { status: 400 })
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      type: 'email',
    })

    if (error || !data.session) {
      return NextResponse.json(
        { error: 'Código incorrecto o expirado.' },
        { status: 401 }
      )
    }

    const { access_token, refresh_token, expires_at } = data.session
    const userEmail = data.user?.email ?? ''

    // Determine role and redirect
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL
    if (superAdminEmail && userEmail.toLowerCase() === superAdminEmail.toLowerCase()) {
      return NextResponse.json({
        access_token,
        refresh_token,
        expires_at,
        redirect: '/super-admin',
        role: 'super_admin',
      })
    }

    const store = await getStoreByAdminEmail(userEmail)
    if (!store) {
      return NextResponse.json(
        { error: 'Tu cuenta no tiene acceso a ningún panel.' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      access_token,
      refresh_token,
      expires_at,
      redirect: `/${store.slug}/admin`,
      role: 'store_admin',
      slug: store.slug,
    })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

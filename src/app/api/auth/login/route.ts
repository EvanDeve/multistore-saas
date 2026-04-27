import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * POST /api/auth/login
 * Authenticates a user via email/password using Supabase Auth.
 * Returns the session tokens on success.
 *
 * Used by both store admin and super admin login forms.
 * Authorization checks (store ownership, super admin) happen
 * at the route level AFTER authentication.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Input validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      )
    }
    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Contraseña es requerida' },
        { status: 400 }
      )
    }

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Return session — client stores the access_token for subsequent API calls
    return NextResponse.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    const origin = request.headers.get('origin') || 'http://localhost:3000'

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${origin}/auth/callback`,
      },
    })

    if (error) {
      const isRateLimit = error.status === 429
      const isNotFound = error.status === 400 && error.message.toLowerCase().includes('not found')
      return NextResponse.json(
        {
          error: isRateLimit
            ? 'Demasiados intentos. Esperá unos minutos e intentá de nuevo.'
            : isNotFound
              ? 'No encontramos una cuenta con ese correo.'
              : 'Error enviando el enlace. Intentá de nuevo.',
        },
        { status: error.status ?? 400 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

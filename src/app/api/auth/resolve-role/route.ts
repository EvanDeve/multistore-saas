import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUserFromAuthHeader } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const user = await getUserFromAuthHeader(authHeader)

  if (!user?.email) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL
  if (superAdminEmail && user.email.toLowerCase() === superAdminEmail.toLowerCase()) {
    return NextResponse.json({ redirect: '/super-admin', role: 'super_admin' })
  }

  // Query stores using the user's own token so RLS applies correctly
  const token = authHeader!.slice(7)
  const userClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    }
  )

  const { data: store } = await userClient
    .from('stores')
    .select('slug')
    .eq('admin_email', user.email)
    .maybeSingle()

  if (!store) {
    return NextResponse.json({ error: 'Sin acceso a ningún panel' }, { status: 403 })
  }

  return NextResponse.json({
    redirect: `/${store.slug}/admin`,
    role: 'store_admin',
    slug: store.slug,
  })
}

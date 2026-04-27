import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// ─── Type Definitions ───────────────────────────────────────
// These mirror the database schema defined in scripts/migration.sql.
// Keep them in sync when the schema changes.

export interface Store {
  id: string
  slug: string
  name: string
  description: string
  logo_url: string
  banner_url: string
  banner_text: string
  banner_sub: string
  primary_color: string
  secondary_color: string
  accent_color: string
  whatsapp_number: string
  whatsapp_message: string
  admin_email: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  store_id: string
  name: string
  slug: string
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  store_id: string
  category_id: string | null
  name: string
  description: string
  price: number
  compare_price: number | null
  image_url: string
  is_available: boolean
  is_featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface SuperAdminLog {
  id: string
  action: string
  store_id: string | null
  details: Record<string, unknown>
  performed_by: string
  created_at: string
}

// ─── Public Client (ANON_KEY) ───────────────────────────────
// Safe to use in both Server and Client Components.
// Respects RLS policies — only sees what public/authenticated users can see.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

// ─── Admin Client (SERVICE_ROLE_KEY) ────────────────────────
// ⚠️  NEVER import this in Client Components or files with "use client".
// ⚠️  This client BYPASSES all RLS policies — full database access.
// Only use in: Server Components, API Route Handlers, server-only utilities.

let _supabaseAdmin: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) return _supabaseAdmin

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. This client can only be used server-side.'
    )
  }

  _supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return _supabaseAdmin
}

// ─── Auth Helpers ───────────────────────────────────────────

/**
 * Extracts and verifies a Supabase Auth user from an Authorization header.
 * Used in API routes to authenticate requests.
 *
 * @param authHeader - The Authorization header value (e.g., "Bearer eyJ...")
 * @returns The authenticated user or null if invalid/expired
 */
export async function getUserFromAuthHeader(authHeader: string | null) {
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.slice(7)
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) return null
  return user
}

/**
 * Finds the store associated with an admin's email.
 * Uses the admin client to bypass RLS (since the store might be inactive).
 *
 * @param email - The admin's email address
 * @returns The store or null if no store is associated with this email
 */
export async function getStoreByAdminEmail(email: string): Promise<Store | null> {
  const admin = getSupabaseAdmin()
  const { data, error } = await admin
    .from('stores')
    .select('*')
    .eq('admin_email', email)
    .single()

  if (error || !data) return null
  return data as Store
}

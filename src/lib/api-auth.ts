import { NextRequest, NextResponse } from 'next/server'
import {
  getUserFromAuthHeader,
  getStoreByAdminEmail,
  getSupabaseAdmin,
  type Store,
} from './supabase'

// ─── Types ──────────────────────────────────────────────────

export interface AuthenticatedAdmin {
  userId: string
  email: string
  store: Store
}

export interface AuthenticatedSuperAdmin {
  userId: string
  email: string
}

// ─── Store Admin Auth ───────────────────────────────────────

/**
 * Validates that the request comes from an authenticated store admin.
 * Returns the admin's info and their associated store, or an error response.
 *
 * Security checks:
 * 1. Valid Supabase Auth token in Authorization header
 * 2. User's email matches a store's admin_email
 * 3. store_id is NEVER accepted from the client — always derived server-side
 */
export async function authenticateStoreAdmin(
  request: NextRequest
): Promise<AuthenticatedAdmin | NextResponse> {
  const authHeader = request.headers.get('authorization')
  const user = await getUserFromAuthHeader(authHeader)

  if (!user?.email) {
    return NextResponse.json(
      { error: 'No autenticado' },
      { status: 401 }
    )
  }

  const store = await getStoreByAdminEmail(user.email)
  if (!store) {
    return NextResponse.json(
      { error: 'Acceso denegado — no tienes una tienda asociada' },
      { status: 403 }
    )
  }

  return {
    userId: user.id,
    email: user.email,
    store,
  }
}

// ─── Super Admin Auth ───────────────────────────────────────

/**
 * Validates that the request comes from the platform super admin.
 *
 * Security checks:
 * 1. Valid Supabase Auth token
 * 2. User's email matches SUPER_ADMIN_EMAIL environment variable
 * 3. Checked on EVERY request — no cached sessions
 */
export async function authenticateSuperAdmin(
  request: NextRequest
): Promise<AuthenticatedSuperAdmin | NextResponse> {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL
  if (!superAdminEmail) {
    return NextResponse.json(
      { error: 'SUPER_ADMIN_EMAIL no configurado en el servidor' },
      { status: 500 }
    )
  }

  const authHeader = request.headers.get('authorization')
  const user = await getUserFromAuthHeader(authHeader)

  if (!user?.email) {
    return NextResponse.json(
      { error: 'No autenticado' },
      { status: 401 }
    )
  }

  if (user.email.toLowerCase() !== superAdminEmail.toLowerCase()) {
    return NextResponse.json(
      { error: 'Acceso denegado — no eres el administrador de la plataforma' },
      { status: 403 }
    )
  }

  return {
    userId: user.id,
    email: user.email,
  }
}

// ─── Super Admin Audit Logging ──────────────────────────────

/**
 * Logs a super admin action for audit trail.
 * Uses SERVICE_ROLE_KEY to bypass RLS on the log table.
 */
export async function logSuperAdminAction(
  action: string,
  performedBy: string,
  storeId?: string | null,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const admin = getSupabaseAdmin()
    await admin.from('super_admin_log').insert({
      action,
      store_id: storeId || null,
      performed_by: performedBy,
      details: details || {},
    })
  } catch (error) {
    // Log failures should not break the main operation
    console.error('Failed to log super admin action:', error)
  }
}

// ─── Input Validation Helpers ───────────────────────────────

/**
 * Validates that a string field meets basic requirements.
 */
export function validateString(
  value: unknown,
  fieldName: string,
  minLength = 1,
  maxLength = 500
): string | null {
  if (typeof value !== 'string' || value.trim().length < minLength) {
    return `${fieldName} es requerido (mín. ${minLength} caracteres)`
  }
  if (value.trim().length > maxLength) {
    return `${fieldName} es demasiado largo (máx. ${maxLength} caracteres)`
  }
  return null
}

/**
 * Validates that a value is a non-negative number.
 */
export function validatePrice(value: unknown, fieldName: string): string | null {
  const num = Number(value)
  if (isNaN(num) || num < 0) {
    return `${fieldName} debe ser un número positivo`
  }
  return null
}

/**
 * Validates a hex color string.
 */
export function validateHexColor(value: unknown): boolean {
  return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value)
}

/**
 * Validates an email address format.
 */
export function validateEmail(value: unknown): boolean {
  return typeof value === 'string' && /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value)
}

/**
 * Validates a store slug format (lowercase alphanumeric with hyphens).
 */
export function validateSlug(value: unknown): boolean {
  return typeof value === 'string' && /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/.test(value)
}

'use client'

import React, { createContext, useContext } from 'react'
import type { Store } from '@/lib/supabase'

// ─── Context ────────────────────────────────────────────────

interface StoreContextValue {
  store: Store
  /** Base path for all store routes (e.g., "/t/mariamoda") */
  basePath: string
}

const StoreContext = createContext<StoreContextValue | null>(null)

// ─── Provider ───────────────────────────────────────────────

interface StoreProviderProps {
  store: Store
  children: React.ReactNode
}

/**
 * Wraps the store's pages so any client component can access
 * the current store via `useStore()`.
 */
export function StoreProvider({ store, children }: StoreProviderProps) {
  const basePath = `/t/${store.slug}`

  return (
    <StoreContext.Provider value={{ store, basePath }}>
      {children}
    </StoreContext.Provider>
  )
}

// ─── Hook ───────────────────────────────────────────────────

/**
 * Access the current store's data and base path from any client component.
 * Must be used within a <StoreProvider>.
 *
 * @example
 * const { store, basePath } = useStore()
 * // store.whatsapp_number, store.primary_color, etc.
 * // basePath = "/t/mariamoda"
 */
export function useStore(): StoreContextValue {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error(
      'useStore() must be used within a <StoreProvider>. ' +
      'Make sure you are inside a /t/[slug]/ route.'
    )
  }
  return context
}

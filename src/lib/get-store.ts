import { cache } from 'react'
import { supabase, type Store } from './supabase'

/**
 * Resolves a store by its slug. Uses React `cache()` to memoize
 * per-request so multiple components in the same render tree
 * don't trigger duplicate queries.
 *
 * Only returns active stores (enforced by RLS policy).
 */
export const getStore = cache(async (slug: string): Promise<Store | null> => {
  if (!slug) return null

  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !data) return null
  return data as Store
})

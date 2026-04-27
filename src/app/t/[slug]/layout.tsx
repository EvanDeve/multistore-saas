import { notFound } from 'next/navigation'
import { getStore } from '@/lib/get-store'
import { StoreProvider } from '@/components/StoreProvider'
import { CartProvider } from '@/components/CartContext'
import { CartDrawer } from '@/components/CartDrawer'
import { Navbar } from '@/components/Navbar'
import { GlobalAction } from '@/components/GlobalAction'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface StoreLayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

/**
 * Generate dynamic metadata based on store data.
 */
export async function generateMetadata({ params }: StoreLayoutProps): Promise<Metadata> {
  const { slug } = await params
  const store = await getStore(slug)

  if (!store) {
    return { title: 'Tienda no encontrada' }
  }

  return {
    title: `${store.name} — Catálogo`,
    description: store.description || `Tienda online de ${store.name}`,
    icons: store.logo_url ? { icon: store.logo_url } : undefined,
  }
}

/**
 * Store-scoped layout — wraps all /t/[slug]/* pages.
 *
 * Responsibilities:
 * 1. Resolve the store from the slug param
 * 2. Return 404 if store doesn't exist or is inactive
 * 3. Inject dynamic CSS custom properties from store colors
 * 4. Wrap children in StoreProvider + CartProvider
 * 5. Render Navbar, CartDrawer, and GlobalAction
 */
export default async function StoreLayout({ children, params }: StoreLayoutProps) {
  const { slug } = await params
  const store = await getStore(slug)

  if (!store) {
    notFound()
  }

  // Dynamic CSS variables derived from the store's theme colors
  const themeStyles = `
    :root {
      --color-primary: ${store.primary_color};
      --color-secondary: ${store.secondary_color};
      --color-accent: ${store.accent_color};
    }
  `

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
      <StoreProvider store={store}>
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 flex flex-col w-full">
              {children}
            </main>
            <CartDrawer />
            <GlobalAction />
          </div>
        </CartProvider>
      </StoreProvider>
    </>
  )
}

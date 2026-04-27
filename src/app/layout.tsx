import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MultiStore — Plataforma de Tiendas Online',
  description: 'Crea y gestiona tu tienda online con pedidos por WhatsApp',
}

/**
 * Root layout — minimal shell shared by ALL routes.
 * Store-specific theming and providers are in /t/[slug]/layout.tsx.
 * This layout only provides the HTML skeleton and global styles.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        {children}
      </body>
    </html>
  )
}

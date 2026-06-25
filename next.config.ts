import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nogjhcdzevkxkqocuwwq.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async redirects() {
    return [
      // Redirect old /t/[slug] routes to /[slug] (301 permanent)
      { source: '/t/:slug', destination: '/:slug', permanent: true },
      { source: '/t/:slug/productos', destination: '/:slug/productos', permanent: true },
      { source: '/t/:slug/productos/:id', destination: '/:slug/productos/:id', permanent: true },
      { source: '/t/:slug/admin', destination: '/:slug/admin', permanent: true },
    ]
  },
};

export default nextConfig;

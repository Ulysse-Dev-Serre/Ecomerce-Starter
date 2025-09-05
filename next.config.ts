import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,   // laisse si tu veux que Vercel ne bloque pas sur les erreurs ESLint
  },
  typescript: {
    ignoreBuildErrors: false,   // laisse à "false" pour bloquer sur erreurs TS (bon réflexe)
  },
  turbopack: {
    // Tu peux mettre des options ici si besoin,
    // mais en général on laisse vide car Next gère déjà les extensions.
  },
  
  // Configuration des en-têtes de sécurité additionnels
  async headers() {
    return [
      {
        // Appliquer à toutes les routes
        source: '/(.*)',
        headers: [
          // Headers de sécurité supplémentaires qui ne sont pas dans le middleware
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Powered-By',
            value: '' // Masquer la signature Next.js
          },
        ],
      },
      {
        // Headers spécifiques pour les uploads/médias
        source: '/api/admin/media/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate'
          }
        ],
      }
    ]
  },

  // Règles de sécurité pour les redirections
  async redirects() {
    return [
      // Redirection HTTPS en production (si pas géré par le reverse proxy)
      ...(process.env.NODE_ENV === 'production' && process.env.FORCE_HTTPS === 'true' ? [
        {
          source: '/:path*',
          has: [
            {
              type: 'header',
              key: 'x-forwarded-proto',
              value: 'http',
            },
          ],
          destination: 'https://your-domain.com/:path*',
          permanent: true,
        },
      ] : []),
    ]
  },

  // Configuration de sécurité pour les images
  images: {
    domains: [],
    dangerouslyAllowSVG: false, // Bloquer les SVG par défaut pour sécurité
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Configuration de sécurité expérimentale
  experimental: {
    // Améliore la sécurité en production
    optimizeServerReact: true,
  },
};

export default nextConfig;

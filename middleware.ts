import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSecurityHeaders, defaultSecurityConfig } from '@/lib/security-headers'
import { authLimiter, getClientIP } from '@/lib/rate-limit'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.pathname
  
  // SÉCURITÉ: Rate limiting sur routes auth (protection bruteforce)
  if (url.startsWith('/api/auth/') && !url.includes('/session')) {
    const clientIP = getClientIP(request)
    const rateLimitResult = authLimiter.check(clientIP)
    
    if (!rateLimitResult.allowed) {
      console.warn(`[SECURITY] Rate limit exceeded for auth: ${clientIP} on ${url}`)
      
      return new NextResponse(
        JSON.stringify({
          error: 'TOO_MANY_REQUESTS',
          message: 'Trop de tentatives. Réessayez plus tard.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
          }
        }
      )
    }
  }

  // Créer la réponse
  const response = NextResponse.next()
  
  // Appliquer les en-têtes de sécurité
  const securityHeaders = getSecurityHeaders(defaultSecurityConfig)
  
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  // Logs de sécurité en développement
  if (process.env.NODE_ENV === 'development') {
    const clientIP = getClientIP(request)
    
    // Logger les requêtes suspectes
    if (url.includes('..') || url.includes('%2e%2e')) {
      console.warn(`🚨 Possible path traversal attempt: ${url} from ${clientIP}`)
    }
    
    // Logger les tentatives d'accès admin sans session (simplifié pour la démo)
    if (url.startsWith('/admin') && !request.cookies.has('next-auth.session-token')) {
      console.log(`🔐 Admin access attempt without session: ${url}`)
    }
  }
  
  return response
}

// Configuration: appliquer le middleware à toutes les routes sauf les exclusions
export const config = {
  matcher: [
    /*
     * Appliquer à toutes les routes sauf :
     * - api routes internes Next.js (_next)
     * - fichiers statiques (avec extension)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*))',
  ],
}

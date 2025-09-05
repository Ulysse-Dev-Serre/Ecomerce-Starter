import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSecurityHeaders, defaultSecurityConfig } from './src/lib/security-headers'

export function middleware(request: NextRequest) {
  // Créer la réponse
  const response = NextResponse.next()
  
  // Appliquer les en-têtes de sécurité
  const securityHeaders = getSecurityHeaders(defaultSecurityConfig)
  
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  // Logs de sécurité en développement
  if (process.env.NODE_ENV === 'development') {
    const url = request.nextUrl.pathname
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    
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

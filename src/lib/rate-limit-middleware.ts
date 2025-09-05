import { NextRequest, NextResponse } from 'next/server'
import { getClientIP, createCompositeIdentifier, authLimiter, cartLimiter, generalLimiter } from './rate-limit'

export type RateLimitType = 'auth' | 'cart' | 'general'

export interface RateLimitOptions {
  type: RateLimitType
  extractEmail?: (request: NextRequest) => Promise<string | null>
}

export async function withRateLimit(
  request: NextRequest,
  options: RateLimitOptions
): Promise<NextResponse | null> {
  const { type, extractEmail } = options
  
  try {
    const ip = getClientIP(request)
    let email: string | null = null
    
    // Extraire l'email si une fonction est fournie
    if (extractEmail) {
      try {
        email = await extractEmail(request)
      } catch (error) {
        // Ignorer les erreurs d'extraction d'email, utiliser seulement l'IP
        console.warn('Erreur extraction email pour rate limiting:', error)
      }
    }
    
    const identifier = createCompositeIdentifier(ip, email || undefined)
    
    // Sélectionner le bon limiter
    const limiter = type === 'auth' ? authLimiter : 
                   type === 'cart' ? cartLimiter : 
                   generalLimiter
    
    const result = limiter.check(identifier)
    
    if (!result.allowed) {
      console.warn(`Rate limit dépassé - Type: ${type}, IP: ${ip}, Email: ${email || 'N/A'}, Erreur: ${result.error}`)
      
      return NextResponse.json(
        { 
          error: result.error || 'Trop de requêtes',
          code: 'RATE_LIMIT_EXCEEDED'
        }, 
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': getLimitForType(type).toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
          }
        }
      )
    }
    
    // Log pour monitoring (en développement seulement)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Rate limit OK - Type: ${type}, IP: ${ip}, Remaining: ${result.remaining}`)
    }
    
    return null // Pas de limite atteinte, continuer
    
  } catch (error) {
    // En cas d'erreur du rate limiter, laisser passer (fail open)
    console.error('Erreur dans rate limiting middleware:', error)
    return null
  }
}

function getLimitForType(type: RateLimitType): number {
  switch (type) {
    case 'auth': return 5
    case 'cart': return 30
    case 'general': return 100
    default: return 100
  }
}

// Helper pour extraire l'email du body de la requête pour auth
export async function extractEmailFromAuthBody(request: NextRequest): Promise<string | null> {
  try {
    // Cloner la requête pour pouvoir lire le body sans l'affecter
    const body = await request.clone().json()
    return body?.email || null
  } catch {
    return null
  }
}

// Helper pour extraire l'userId des params d'URL (pour cart)
export function extractUserIdFromParams(request: NextRequest): string | null {
  const url = new URL(request.url)
  const pathParts = url.pathname.split('/')
  
  // Pour /api/cart/[userId] ou /api/cart/[userId]/[itemId]
  if (pathParts.includes('cart')) {
    const cartIndex = pathParts.indexOf('cart')
    return pathParts[cartIndex + 1] || null
  }
  
  return null
}

// Wrapper pour les route handlers avec rate limiting
export function withRateLimitedRouteHandler(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  options: RateLimitOptions
) {
  return async (request: NextRequest, context?: any) => {
    // Vérifier le rate limit
    const rateLimitResponse = await withRateLimit(request, options)
    if (rateLimitResponse) {
      return rateLimitResponse
    }
    
    // Continuer avec le handler original
    return handler(request, context)
  }
}

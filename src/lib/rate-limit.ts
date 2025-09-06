interface RateLimitStore {
  count: number
  resetTime: number
  blocked: boolean
}

interface RateLimitConfig {
  windowMs: number // Fenêtre de temps en millisecondes
  max: number // Nombre maximum de requêtes
  skipSuccessfulRequests?: boolean
  blockDuration?: number // Durée de blocage en millisecondes après dépassement
  keyGenerator?: (identifier: string) => string
}

const stores = new Map<string, RateLimitStore>()

// Configuration rate limiting par type d'endpoint
const RATE_LIMIT_CONFIGS = {
  auth: { 
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 5,                    // 5 tentatives max
    blockDuration: 30 * 60 * 1000  // Blocage 30 min
  },
  cart: {
    windowMs: 60 * 1000,      // 1 minute  
    max: 30,                   // 30 requêtes max
    blockDuration: 5 * 60 * 1000   // Blocage 5 min
  },
  general: {
    windowMs: 60 * 1000,      // 1 minute
    max: 100,                  // 100 requêtes max
    blockDuration: 60 * 1000   // Blocage 1 min
  }
}

// Nettoie les entrées expirées toutes les 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, store] of stores.entries()) {
    if (now > store.resetTime) {
      stores.delete(key)
    }
  }
}, 5 * 60 * 1000)

export function createRateLimiter(config: RateLimitConfig) {
  const {
    windowMs,
    max,
    skipSuccessfulRequests = false,
    blockDuration = windowMs * 2,
    keyGenerator = (id: string) => id
  } = config

  return {
    check: (identifier: string): { allowed: boolean; remaining: number; resetTime: number; error?: string } => {
      const key = keyGenerator(identifier)
      const now = Date.now()
      
      let store = stores.get(key)
      
      // Initialiser ou réinitialiser le store si expiré
      if (!store || now > store.resetTime) {
        store = {
          count: 0,
          resetTime: now + windowMs,
          blocked: false
        }
        stores.set(key, store)
      }
      
      // Vérifier si encore bloqué après dépassement
      if (store.blocked && now < store.resetTime) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: store.resetTime,
          error: `Trop de tentatives. Réessayez dans ${Math.ceil((store.resetTime - now) / 1000)} secondes.`
        }
      }
      
      // Reset du blocage si la période est écoulée
      if (store.blocked && now >= store.resetTime) {
        store.count = 0
        store.blocked = false
        store.resetTime = now + windowMs
      }
      
      store.count++
      
      // Vérifier si limite dépassée
      if (store.count > max) {
        store.blocked = true
        store.resetTime = now + blockDuration
        return {
          allowed: false,
          remaining: 0,
          resetTime: store.resetTime,
          error: `Limite de ${max} requêtes par ${Math.ceil(windowMs / 1000)}s dépassée. Bloqué pour ${Math.ceil(blockDuration / 1000)}s.`
        }
      }
      
      return {
        allowed: true,
        remaining: Math.max(0, max - store.count),
        resetTime: store.resetTime
      }
    },
    
    hit: (identifier: string, success: boolean = true) => {
      if (skipSuccessfulRequests && success) return
      // La logique de comptage est déjà dans check()
    },
    
    reset: (identifier: string) => {
      stores.delete(keyGenerator(identifier))
    },
    
    // Utilitaire pour obtenir les stats
    getStats: (identifier: string) => {
      const store = stores.get(keyGenerator(identifier))
      if (!store) return null
      return {
        count: store.count,
        resetTime: store.resetTime,
        blocked: store.blocked
      }
    }
  }
}

// Configuration pour différents types d'endpoints
export const rateLimitConfigs = {
  // Auth endpoints - strict
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives par 15 min
    blockDuration: 30 * 60 * 1000, // Block 30 min après dépassement
    keyGenerator: (identifier: string) => `auth:${identifier}`
  },
  
  // Cart operations - modéré
  cart: {
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 opérations par minute
    blockDuration: 5 * 60 * 1000, // Block 5 min
    keyGenerator: (identifier: string) => `cart:${identifier}`
  },
  
  // API générale - souple
  general: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requêtes par minute
    blockDuration: 60 * 1000, // Block 1 min
    keyGenerator: (identifier: string) => `api:${identifier}`
  }
}

// Instances de rate limiters
export const authLimiter = createRateLimiter(rateLimitConfigs.auth)
export const cartLimiter = createRateLimiter(rateLimitConfigs.cart)
export const generalLimiter = createRateLimiter(rateLimitConfigs.general)

// Helper pour extraire l'IP de la requête
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfIP = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  if (cfIP) {
    return cfIP
  }
  
  // Fallback pour développement local
  return 'unknown'
}

// Helper pour créer un identifiant composite (IP + email)
export function createCompositeIdentifier(ip: string, email?: string): string {
  return email ? `${ip}:${email}` : ip
}

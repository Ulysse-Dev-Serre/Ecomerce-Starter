# Rate Limiting

## Vue d'Ensemble

Protection contre les attaques par déni de service (DoS) et l'abus des API via limitation du taux de requêtes.

## Configuration

### Limites par Endpoint

| Endpoint | Limite | Fenêtre | Type |
|----------|--------|---------|------|
| `/api/auth/*` | 5 req | 15 min | IP + Email |
| `/api/cart/*` | 60 req | 1 min | User |
| `/api/products` | 100 req | 1 min | IP |
| `/api/orders` | 10 req | 1 min | User |
| `/api/contact` | 3 req | 10 min | IP |

### Implémentation
```typescript
// middleware/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

// Configuration par endpoint
const rateLimits = {
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    analytics: true,
  }),
  
  cart: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "1 m"),
    analytics: true,
  }),
  
  products: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"),
    analytics: true,
  })
}
```

## Stratégies de Limitation

### Par IP (Anonyme)
```typescript
export async function rateLimitByIP(
  request: NextRequest,
  endpoint: keyof typeof rateLimits
) {
  const ip = getClientIP(request)
  const { success, limit, remaining, reset } = await rateLimits[endpoint].limit(ip)
  
  if (!success) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        limit,
        remaining,
        resetTime: new Date(reset)
      }),
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
          'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString()
        }
      }
    )
  }
  
  return { success: true, remaining, reset }
}
```

### Par Utilisateur (Authentifié)
```typescript
export async function rateLimitByUser(
  userId: string,
  endpoint: keyof typeof rateLimits
) {
  const key = `user:${userId}`
  const { success, limit, remaining, reset } = await rateLimits[endpoint].limit(key)
  
  return { success, limit, remaining, reset }
}
```

### Par Email (Auth)
```typescript
export async function rateLimitByEmail(
  email: string,
  endpoint: 'auth' = 'auth'
) {
  const key = `email:${email.toLowerCase()}`
  const { success, limit, remaining, reset } = await rateLimits[endpoint].limit(key)
  
  return { success, limit, remaining, reset }
}
```

## Usage dans les API Routes

### Authentification
```typescript
// app/api/auth/signin/route.ts
export async function POST(request: NextRequest) {
  // Rate limiting par IP ET par email
  const ip = getClientIP(request)
  const { email } = await request.json()
  
  const [ipLimit, emailLimit] = await Promise.all([
    rateLimitByIP(request, 'auth'),
    rateLimitByEmail(email, 'auth')
  ])
  
  if (!ipLimit.success) return ipLimit
  if (!emailLimit.success) return emailLimit
  
  // Continuer avec l'authentification
  return await signIn(email)
}
```

### Panier utilisateur
```typescript
// app/api/cart/route.ts
export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session) return unauthorized()
  
  const rateLimitResult = await rateLimitByUser(session.user.id, 'cart')
  if (!rateLimitResult.success) {
    return new Response(
      JSON.stringify({ error: 'Too many requests' }),
      { status: 429 }
    )
  }
  
  // Continuer avec l'ajout au panier
  return await addToCart(session.user.id, data)
}
```

## Gestion des Headers

### Headers de Réponse
```typescript
// Toujours inclure les headers de rate limiting
function addRateLimitHeaders(
  response: Response,
  { limit, remaining, reset }: RateLimitInfo
) {
  response.headers.set('X-RateLimit-Limit', limit.toString())
  response.headers.set('X-RateLimit-Remaining', remaining.toString())
  response.headers.set('X-RateLimit-Reset', reset.toString())
  
  if (remaining === 0) {
    response.headers.set('Retry-After', Math.ceil((reset - Date.now()) / 1000).toString())
  }
  
  return response
}
```

### Réponse Standard 429
```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again later.",
  "limit": 60,
  "remaining": 0,
  "resetTime": "2024-03-01T11:15:00.000Z",
  "retryAfter": 45
}
```

## Exemptions et Whitelist

### IPs privilégiées
```typescript
const PRIVILEGED_IPS = [
  '127.0.0.1',      // Localhost
  '::1',            // IPv6 localhost
  '10.0.0.0/8',     // Internal network
]

export function isPrivilegedIP(ip: string): boolean {
  return PRIVILEGED_IPS.some(privilegedIP => {
    if (privilegedIP.includes('/')) {
      return isInSubnet(ip, privilegedIP)
    }
    return ip === privilegedIP
  })
}
```

### Utilisateurs premium
```typescript
export async function getRateLimitMultiplier(userId: string): Promise<number> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true, plan: true }
  })
  
  if (user?.role === 'ADMIN') return 10
  if (user?.plan === 'PREMIUM') return 3
  if (user?.plan === 'PRO') return 2
  
  return 1 // Standard
}
```

## Monitoring et Alertes

### Métriques
```typescript
// Tracker les violations de rate limit
export async function logRateLimitViolation(
  ip: string,
  endpoint: string,
  userId?: string
) {
  await db.securityLog.create({
    data: {
      type: 'RATE_LIMIT_VIOLATION',
      ip,
      endpoint,
      userId,
      timestamp: new Date(),
      metadata: {
        userAgent: getUserAgent(),
        referer: getReferer()
      }
    }
  })
}
```

### Détection d'Abus
```typescript
export async function detectAbusePattern(ip: string): Promise<boolean> {
  const violations = await db.securityLog.count({
    where: {
      ip,
      type: 'RATE_LIMIT_VIOLATION',
      timestamp: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24h
      }
    }
  })
  
  // Plus de 10 violations en 24h = pattern d'abus
  return violations > 10
}
```

### Auto-ban Temporaire
```typescript
export async function autoban(
  ip: string,
  duration: number = 24 * 60 * 60 * 1000 // 24h
) {
  await redis.setex(`banned:${ip}`, Math.ceil(duration / 1000), '1')
  
  await db.securityLog.create({
    data: {
      type: 'AUTO_BAN',
      ip,
      metadata: { duration, reason: 'Rate limit abuse' }
    }
  })
}
```

## Configuration Avancée

### Rate Limiting Adaptatif
```typescript
export async function getAdaptiveRateLimit(
  endpoint: string,
  currentLoad: number
): Promise<number> {
  const baseLimit = rateLimits[endpoint].limit
  
  // Réduire les limites sous forte charge
  if (currentLoad > 80) return Math.floor(baseLimit * 0.5)
  if (currentLoad > 60) return Math.floor(baseLimit * 0.7)
  
  return baseLimit
}
```

### Burst Allowance
```typescript
// Permettre des pics temporaires
const burstLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.tokenBucket(5, "10 s", 20), // 5/s, max 20 tokens
  analytics: true,
})
```

## Tests et Validation

### Test de Rate Limiting
```typescript
describe('Rate Limiting', () => {
  it('blocks requests after limit exceeded', async () => {
    const responses = []
    
    // Faire 6 requêtes (limite: 5)
    for (let i = 0; i < 6; i++) {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({ email: 'test@example.com' })
      responses.push(response)
    }
    
    // Les 5 premières passent
    expect(responses.slice(0, 5)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ status: 200 })
      ])
    )
    
    // La 6ème est bloquée
    expect(responses[5].status).toBe(429)
    expect(responses[5].body.code).toBe('RATE_LIMIT_EXCEEDED')
  })
})
```

## Performance

### Cache des Configurations
- Configuration rate limit en mémoire
- Redis optimisé pour latence
- Pas d'impact sur requêtes normales

### Nettoyage Automatique
```typescript
// Nettoyage périodique des anciens logs
export async function cleanupOldLogs() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  
  await db.securityLog.deleteMany({
    where: {
      timestamp: { lt: thirtyDaysAgo }
    }
  })
}
```

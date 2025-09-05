# Rate Limiting - Documentation

## Vue d'ensemble

Le système de rate limiting protège l'application contre les abus, les attaques par force brute et les attaques par déni de service (DoS). Il limite le nombre de requêtes qu'un utilisateur peut faire par fenêtre de temps.

## Configuration des limites

### Endpoints d'authentification (`auth`)
- **Limite**: 5 requêtes par 15 minutes
- **Blocage**: 30 minutes après dépassement
- **Cible**: Connexion, rappel OAuth, sessions
- **Identifiant**: IP + email (si disponible)

### Opérations panier (`cart`)
- **Limite**: 30 requêtes par minute
- **Blocage**: 5 minutes après dépassement
- **Cible**: Ajout/modification/suppression d'articles
- **Identifiant**: IP + userId

### API générale (`general`)
- **Limite**: 100 requêtes par minute
- **Blocage**: 1 minute après dépassement
- **Cible**: Autres endpoints API
- **Identifiant**: IP uniquement

## Fonctionnement technique

### Identification des clients

1. **IP principale**: Extraite des headers dans cet ordre:
   - `X-Forwarded-For` (premier IP si multiple)
   - `X-Real-IP`
   - `CF-Connecting-IP` (Cloudflare)

2. **Identifiant composite**: 
   - Pour auth: `IP:email`
   - Pour cart: `IP:userId`
   - Fallback: `IP` seulement

### Stockage en mémoire

- Utilise une `Map` JavaScript avec TTL
- Nettoyage automatique toutes les 5 minutes
- Structure: `{ count, resetTime, blocked }`

### Réponses en cas de dépassement

```json
{
  "error": "Limite de 5 requêtes par 15min dépassée. Bloqué pour 1800s.",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

**Headers HTTP**:
- `X-RateLimit-Limit`: Limite configurée
- `X-RateLimit-Remaining`: Requêtes restantes
- `X-RateLimit-Reset`: Timestamp de reset
- `Retry-After`: Secondes avant nouvelle tentative

## Endpoints protégés

### Authentification
```
POST /api/auth/[...nextauth]
├── signin (rate limited)
├── callback (rate limited) 
└── session (rate limited)
```

### Panier
```
/api/cart/[userId]
├── GET (rate limited)
├── POST (rate limited)

/api/cart/[userId]/[itemId]
├── DELETE (rate limited)
└── PATCH (rate limited)
```

## Tests et monitoring

### Tests manuels
```bash
# Utiliser REST Client dans VS Code
code tests/rate-limiting.http

# Ou script Node.js automatisé
node tests/test-rate-limiting.js
```

### Tests automatisés
Le fichier `tests/test-rate-limiting.js` contient des tests pour:
- ✅ Dépassement de limite auth après 6 requêtes
- ✅ Dépassement de limite panier après 31 requêtes  
- ✅ Vérification des headers HTTP
- ✅ Rate limiting par IP différentes
- ✅ Reset automatique après expiration

### Monitoring en production

1. **Logs applicatifs**:
```javascript
console.warn(`Rate limit dépassé - Type: auth, IP: 192.168.1.1, Email: user@email.com`)
```

2. **Headers de debug** (développement):
```javascript
console.log(`Rate limit OK - Type: cart, IP: 192.168.1.1, Remaining: 25`)
```

## Configuration avancée

### Personnalisation des limites

```typescript
// src/lib/rate-limit.ts
export const rateLimitConfigs = {
  auth: {
    windowMs: 15 * 60 * 1000,  // Modifier la fenêtre
    max: 5,                    // Modifier la limite
    blockDuration: 30 * 60 * 1000  // Modifier le blocage
  }
}
```

### Ajout d'un nouvel endpoint

```typescript
// Dans votre route handler
import { withRateLimit } from '@/lib/rate-limit-middleware'

export async function POST(request: NextRequest) {
  const rateLimitResponse = await withRateLimit(request, { 
    type: 'auth' // ou 'cart', 'general'
  })
  if (rateLimitResponse) return rateLimitResponse
  
  // Votre logique métier...
}
```

## Considérations de sécurité

### Contournement potentiel

1. **Rotation d'IP**: Les attaquants peuvent changer d'IP
   - Solution: Utiliser aussi l'email/userId quand possible
   - Considérer un rate limiting global plus strict

2. **Headers forgés**: `X-Forwarded-For` peut être falsifié
   - Solution: Vérifier la configuration du reverse proxy
   - Utiliser `X-Real-IP` de Cloudflare en production

### Bonnes pratiques

1. **Fail Open**: En cas d'erreur du rate limiter, laisser passer
2. **Monitoring**: Logger tous les dépassements pour détection d'attaques
3. **Graduel**: Escalade progressive (warning → rate limit → blocage)
4. **Whitelist**: Exempter les IPs internes/admin si nécessaire

## Métriques recommandées

- Nombre de dépassements par endpoint
- IPs les plus bloquées  
- Emails avec le plus de tentatives
- Temps de réponse du middleware
- Efficacité du nettoyage automatique

## Intégration Cloudflare (Production)

En production avec Cloudflare, le rate limiting applicatif complète les règles Cloudflare:

```javascript
// Cloudflare rate limiting (couche réseau)
// + Application rate limiting (couche applicative)
// = Protection multicouche
```

## Dépannage

### Performance
- Le nettoyage automatique évite l'accumulation de mémoire
- Monitoring du nombre d'entrées en Map
- Considérer Redis pour une charge très élevée

### Faux positifs
- Ajuster les limites selon l'usage réel
- Implémenter une whitelist pour les cas légitimes
- Logs détaillés pour investiguer

### Tests de charge
```bash
# Simuler une charge
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/signin \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' &
done
```

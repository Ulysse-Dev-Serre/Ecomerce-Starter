# En-têtes de Sécurité - Documentation

## Vue d'ensemble

Cette application implémente un ensemble complet d'en-têtes de sécurité HTTP pour protéger contre les attaques web courantes. La configuration suit les meilleures pratiques de sécurité modernes.

## En-têtes implémentés

### Content Security Policy (CSP)
**Protection**: XSS, injection de code, ressources malveillantes

```
Content-Security-Policy: default-src 'self'; 
  script-src 'self' 'unsafe-inline' https://accounts.google.com; 
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
  font-src 'self' https://fonts.gstatic.com data:; 
  img-src 'self' data: blob: https: http:; 
  connect-src 'self' https://accounts.google.com; 
  frame-src 'self' https://accounts.google.com; 
  object-src 'none'; 
  base-uri 'self'
```

**Justifications**:
- `default-src 'self'`: Bloc toutes les ressources non explicitement autorisées
- `script-src 'unsafe-inline'`: Nécessaire pour Next.js et React
- `object-src 'none'`: Bloque Flash et plugins dangereux
- `upgrade-insecure-requests`: Force HTTPS en production

### HTTP Strict Transport Security (HSTS)
**Protection**: Downgrade HTTPS, man-in-the-middle

```
Strict-Transport-Security: max-age=15768000; includeSubDomains; preload
```

**Configuration**:
- **6 mois minimum** (15,768,000 secondes)
- `includeSubDomains`: Protège tous les sous-domaines
- `preload`: Éligible pour la liste de préchargement des navigateurs

### Protection Headers Standards

#### X-Content-Type-Options
```
X-Content-Type-Options: nosniff
```
Empêche le navigateur de deviner le type MIME.

#### X-Frame-Options
```
X-Frame-Options: DENY
```
Bloque l'embedding dans des frames (protection clickjacking).

#### X-XSS-Protection
```
X-XSS-Protection: 1; mode=block
```
Active la protection XSS legacy des navigateurs.

#### Referrer-Policy
```
Referrer-Policy: strict-origin-when-cross-origin
```
Contrôle les informations de référent envoyées.

### Headers de Isolation

#### Cross-Origin-Opener-Policy
```
Cross-Origin-Opener-Policy: same-origin
```
Isole la fenêtre des autres origines.

#### Cross-Origin-Resource-Policy
```
Cross-Origin-Resource-Policy: same-origin
```
Contrôle qui peut inclure cette ressource.

#### Permissions-Policy
```
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(self)
```
Contrôle l'accès aux APIs du navigateur.

## Configuration des Cookies

### Cookies d'authentification NextAuth

```typescript
cookies: {
  sessionToken: {
    options: {
      httpOnly: true,     // ✅ Bloque l'accès JavaScript
      secure: true,       // ✅ HTTPS seulement (prod)
      sameSite: 'lax',    // ✅ Protection CSRF
      maxAge: 604800      // ✅ 7 jours
    }
  }
}
```

**Propriétés de sécurité**:
- ✅ **HttpOnly**: Empêche l'accès via JavaScript (protection XSS)
- ✅ **Secure**: Transmission HTTPS uniquement (production)
- ✅ **SameSite=lax**: Protection CSRF avec navigation normale
- ✅ **MaxAge**: Expiration définie (7 jours)

## Architecture d'implémentation

### Middleware Next.js
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const headers = getSecurityHeaders(defaultConfig)
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}
```

### Configuration Next.js
```typescript
// next.config.ts
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'X-Powered-By', value: '' } // Masque Next.js
      ]
    }
  ]
}
```

## Tests et validation

### Tests automatisés
```bash
# Test complet des en-têtes
npm run test:security-headers

# Test d'un endpoint spécifique
node tests/security-headers-test.js https://your-domain.com
```

### Tests manuels REST Client
```http
### Vérifier tous les headers de sécurité
GET http://localhost:3000/
```

### Diagnostic admin (développement)
```
GET /api/admin/security-check
```

**Réponse exemple**:
```json
{
  "score": 95,
  "environment": "development",
  "validation": {
    "csp": { "valid": true, "errors": [] },
    "hsts": { "enabled": false, "reason": "development" }
  },
  "recommendations": [
    {
      "type": "info",
      "message": "Mode développement",
      "details": ["HSTS désactivé", "Cookies non sécurisés"]
    }
  ]
}
```

## Environnements spécifiques

### Développement
- HSTS: **Désactivé** (évite problèmes localhost)
- Cookies Secure: **Désactivé** (permet HTTP)
- CSP: **Permissive** (`'unsafe-eval'` pour hot reload)
- Logs: **Verbeux** (tentatives suspectes)

### Production
- HSTS: **6+ mois** avec `includeSubDomains` et `preload`
- Cookies Secure: **Obligatoire**
- CSP: **Restrictive** (pas d'`unsafe-eval`)
- Logs: **Sécurité critiques** seulement

## Conformité et standards

### OWASP Top 10
- ✅ **A03 - Injection**: CSP bloque l'injection de contenu
- ✅ **A05 - Security Misconfiguration**: Headers sécurisés par défaut
- ✅ **A06 - Vulnerable Components**: CSP limite les ressources tierces

### Score de sécurité
L'implémentation vise un score ≥ 90% sur:
- [SecurityHeaders.com](https://securityheaders.com)
- [Mozilla Observatory](https://observatory.mozilla.org)
- [OWASP ZAP](https://www.zaproxy.org)

## Troubleshooting

### Erreurs CSP courantes

**Problème**: Script bloqué par CSP
```
Refused to execute inline script because it violates CSP directive
```

**Solution**: Ajouter un nonce ou autoriser le domaine
```typescript
"script-src 'self' 'nonce-${nonce}' https://trusted-domain.com"
```

**Problème**: Style inline bloqué
```
Refused to apply inline style because it violates CSP directive
```

**Solution**: Pour Tailwind/CSS-in-JS
```typescript
"style-src 'self' 'unsafe-inline'"
```

### Problèmes HSTS

**Problème**: Impossible d'accéder en HTTP après HSTS
**Solution**: Développement - utiliser un domaine différent ou effacer HSTS dans le navigateur

### Cookies non sécurisés

**Problème**: Cookies marqués comme non sécurisés
**Solution**: Vérifier `NODE_ENV=production` et HTTPS actif

## Intégrations tierces

### Google OAuth
CSP configuré pour:
- `https://accounts.google.com` (frame, script)
- `https://api.google.com` (connect)

### Stripe/PayPal
Ajouter si nécessaire:
```typescript
"frame-src https://checkout.stripe.com https://www.paypal.com"
"connect-src https://api.stripe.com https://api.paypal.com"
```

### Analytics (GA, etc.)
```typescript
"script-src https://www.googletagmanager.com"
"img-src https://www.google-analytics.com"
```

## Surveillance et monitoring

### Métriques recommandées
- Violations CSP reportées
- Tentatives d'accès HTTPS après HSTS
- Headers manquants ou incorrects
- Temps de réponse du middleware

### Alertes critiques
- CSP bypassé
- HSTS désactivé en production  
- Cookies non sécurisés détectés
- Score sécurité < 80%

## Mise à jour et maintenance

### Revue périodique
- **Mensuel**: Vérifier score sécurité
- **Trimestriel**: Audit CSP complet
- **Annuel**: Mise à jour durée HSTS

### Outils de monitoring
- [SecurityHeaders.com](https://securityheaders.com)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com)
- [HSTS Preload](https://hstspreload.org)

## Commandes utiles

```bash
# Test headers local
npm run test:security-headers

# Validation CSP
curl -I http://localhost:3000 | grep -i content-security

# Check HSTS
curl -I https://your-domain.com | grep -i strict-transport

# Test complet avec external scanner
npm run security:audit
```

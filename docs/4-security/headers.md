# En-têtes de Sécurité

## Vue d'Ensemble

Ensemble complet d'en-têtes HTTP pour protéger contre les attaques web courantes suivant les meilleures pratiques modernes.

## En-têtes Implémentés

### Content Security Policy (CSP)
**Protection** : XSS, injection de code, ressources malveillantes

```
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' 'unsafe-inline' https://accounts.google.com; 
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
  font-src 'self' https://fonts.gstatic.com data:; 
  img-src 'self' data: blob: https: http:; 
  connect-src 'self' https://accounts.google.com; 
  frame-src 'self' https://accounts.google.com; 
  object-src 'none'; 
  base-uri 'self'
```

### HTTP Strict Transport Security (HSTS)
**Protection** : Downgrade HTTPS, attaques man-in-the-middle

```
Strict-Transport-Security: max-age=15768000; includeSubDomains; preload
```

- 6 mois minimum (15,768,000 secondes)
- `includeSubDomains` : Protège tous les sous-domaines
- `preload` : Éligible pour la liste de préchargement navigateurs

### Headers de Protection Standards

#### X-Content-Type-Options
```
X-Content-Type-Options: nosniff
```
Empêche le navigateur de deviner le type MIME.

#### X-Frame-Options
```
X-Frame-Options: DENY
```
Protection clickjacking - bloque l'embedding dans frames.

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

### Headers d'Isolation Moderne

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

## Configuration Cookies

### Cookies NextAuth sécurisés
```typescript
cookies: {
  sessionToken: {
    options: {
      httpOnly: true,     // Bloque l'accès JavaScript
      secure: true,       // HTTPS seulement (production)
      sameSite: 'lax',    // Protection CSRF
      maxAge: 604800      // 7 jours
    }
  }
}
```

## Implémentation

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

## Environnements

### Développement
- **HSTS** : Désactivé (évite problèmes localhost)
- **Cookies Secure** : Désactivé (permet HTTP)
- **CSP** : Permissive (`'unsafe-eval'` pour hot reload)
- **Logs** : Verbeux

### Production
- **HSTS** : 6+ mois avec `includeSubDomains` et `preload`
- **Cookies Secure** : Obligatoire
- **CSP** : Restrictive (pas d'`unsafe-eval`)
- **Logs** : Critiques seulement

## Intégrations Tierces

### Google OAuth
CSP configuré pour :
- `https://accounts.google.com` (frame, script)
- `https://apis.google.com` (connect)

### Stripe Payments
```typescript
"frame-src https://js.stripe.com https://hooks.stripe.com"
"connect-src https://api.stripe.com"
```

### Analytics (optionnel)
```typescript
"script-src https://www.googletagmanager.com"
"img-src https://www.google-analytics.com"
```

## Tests et Validation

### Score de Sécurité
Vise ≥ 90% sur :
- [SecurityHeaders.com](https://securityheaders.com)
- [Mozilla Observatory](https://observatory.mozilla.org)
- [OWASP ZAP](https://www.zaproxy.org)

### Tests automatisés
```bash
# Test complet des en-têtes
npm run test:security-headers

# Validation locale
curl -I http://localhost:3000 | grep -i content-security
```

### Diagnostic admin (dev)
```
GET /api/admin/security-check
```

## Résolution de Problèmes

### Erreurs CSP
**Script bloqué** :
```
Refused to execute inline script because it violates CSP
```
**Solution** : Ajouter un nonce ou autoriser le domaine

**Style bloqué** :
```
Refused to apply inline style because it violates CSP
```
**Solution** : Pour Tailwind/CSS-in-JS, utiliser `'unsafe-inline'`

### Problèmes HSTS
**Accès HTTP impossible après HSTS** :
- Développement : utiliser domaine différent
- Effacer HSTS dans paramètres navigateur

### Cookies non sécurisés
Vérifier :
- `NODE_ENV=production`
- HTTPS actif
- Configuration cookies correcte

## Conformité Standards

### OWASP Top 10
- ✅ **A03 - Injection** : CSP bloque injection contenu
- ✅ **A05 - Security Misconfiguration** : Headers sécurisés par défaut
- ✅ **A06 - Vulnerable Components** : CSP limite ressources tierces

### Bonnes Pratiques
1. **Fail Secure** : Rejet par défaut
2. **Defense in Depth** : Multiple couches protection
3. **Least Privilege** : Permissions minimales
4. **Monitoring** : Surveillance continue

## Maintenance

### Revue Périodique
- **Mensuel** : Vérifier score sécurité
- **Trimestriel** : Audit CSP complet
- **Annuel** : Mise à jour durée HSTS

### Outils Recommandés
- [CSP Evaluator](https://csp-evaluator.withgoogle.com)
- [HSTS Preload](https://hstspreload.org)
- [Security Headers Scanner](https://securityheaders.com)

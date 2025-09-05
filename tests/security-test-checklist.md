# Checklist Tests de Sécurité - En-têtes HTTP

## ✅ Tests automatisés

### 1. Test des en-têtes de sécurité
```bash
npm run test:security-headers
```

**Vérifie**:
- CSP configuré avec `default-src 'self'`
- HSTS activé avec durée >= 6 mois (production)
- Cookies marqués `HttpOnly`, `Secure`, `SameSite=Lax`
- Headers de protection activés (X-Frame-Options, etc.)

## 📋 Tests manuels

### 2. REST Client tests (VS Code)
```bash
code tests/security-headers.http
```

**Tests inclus**:
- Page d'accueil → vérifier tous headers
- Endpoints API → headers appliqués
- Routes admin → sécurité renforcée
- Tentatives d'injection XSS → protection CSP
- Path traversal → blocage et logs

### 3. Diagnostic développement
```bash
# Démarrer le serveur
npm run dev

# Tester l'endpoint admin
GET http://localhost:3000/api/admin/security-check
```

**Score attendu**: ≥ 80% en développement, ≥ 95% en production

## 🌐 Tests avec scanners externes

### 4. SecurityHeaders.com
1. Déployer l'app en production
2. Scanner sur: https://securityheaders.com/?q=YOUR_DOMAIN
3. **Score attendu**: A+ ou A

### 5. Mozilla Observatory  
Scanner sur: https://observatory.mozilla.org/analyze/YOUR_DOMAIN
**Score attendu**: A+ ou A

### 6. Qualys SSL Labs
Scanner SSL sur: https://www.ssllabs.com/ssltest/analyze.html?d=YOUR_DOMAIN

## 🎯 Critères d'acceptation validés

### ✅ CSP configuré
- [x] `default-src 'self'` ✓
- [x] Exceptions pour Google OAuth ✓
- [x] Blocage `object-src 'none'` ✓
- [x] Scripts inline autorisés (Next.js) ✓

### ✅ HSTS activé  
- [x] Durée >= 6 mois (15,768,000 sec) ✓
- [x] `includeSubDomains` ✓
- [x] `preload` pour éligibilité navigateurs ✓
- [x] Activé seulement en production ✓

### ✅ Cookies sécurisés
- [x] `HttpOnly`: Empêche accès JavaScript ✓
- [x] `Secure`: HTTPS seulement (production) ✓  
- [x] `SameSite=Lax`: Protection CSRF ✓
- [x] Expiration définie (7 jours) ✓

### ✅ Scanner de sécurité
- [x] Tests automatisés implémentés ✓
- [x] Outil de diagnostic admin ✓
- [x] Documentation des URLs de test ✓
- [x] Aucun avertissement critique attendu ✓

## 📊 Résultats attendus

### Développement (localhost)
```
Score sécurité: 75-85%
CSP: ✅ Valide avec unsafe-inline
HSTS: ⚠️ Désactivé (normal)  
Cookies: ⚠️ Non sécurisés (HTTP)
Headers: ✅ Tous présents
```

### Production (HTTPS)
```
Score sécurité: 95-100%
CSP: ✅ Restrictif sans unsafe-eval
HSTS: ✅ 6+ mois avec subdomains
Cookies: ✅ Secure + HttpOnly + SameSite
Headers: ✅ Configuration optimale
```

## 🚨 Actions si tests échouent

### CSP violations
1. Vérifier console navigateur pour erreurs CSP
2. Ajuster directives dans `security-headers.ts`
3. Tester avec `unsafe-inline` temporairement

### HSTS problèmes
1. Vérifier `NODE_ENV=production`
2. Confirmer HTTPS actif
3. Vider cache HSTS navigateur si besoin

### Cookies non sécurisés
1. Vérifier configuration NextAuth
2. Tester en HTTPS
3. Contrôler variable d'environnement

### Score faible scanner
1. Comparer avec headers attendus
2. Vérifier middleware actif
3. Contrôler configuration reverse proxy

## 🔧 Commandes utiles

```bash
# Test complet local
npm run test:security-headers

# Vérifier headers spécifique
curl -I http://localhost:3000 | grep -i security

# Test CSP uniquement  
curl -I http://localhost:3000 | grep -i content-security

# Test HSTS (production)
curl -I https://your-domain.com | grep -i strict-transport
```

## 📝 Notes importantes

- Tests en développement: certains avertissements normaux (HSTS, cookies)
- Tests en production: score ≥ 95% requis pour conformité
- Scanner externe: attendre propagation DNS si nouveau domaine
- CSP: ajuster selon intégrations tierces futures

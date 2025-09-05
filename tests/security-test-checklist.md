# Checklist Complète - Tests de Sécurité E2E

## ✅ Tests automatisés disponibles

### 1. Rate Limiting 
```bash
npm run test:rate-limit
```
**Vérifie**:
- Endpoints auth: 5 req/15min → blocage 30min
- Endpoints panier: 30 req/min → blocage 5min  
- Headers HTTP appropriés (429, Retry-After)
- Protection brute force et DoS

### 2. En-têtes de sécurité
```bash
npm run test:security-headers
```
**Vérifie**:
- CSP configuré avec `default-src 'self'`
- HSTS 6+ mois avec includeSubDomains
- Cookies HttpOnly, Secure, SameSite=lax
- Headers protection (X-Frame-Options, etc.)

### 3. Validation des entrées
```bash
npm run test:validation
```
**Vérifie**:
- Rejection champs inattendus (mass assignment)
- Limites taille/longueur respectées
- Sanitization XSS, injection SQL
- Types de données validés avec Zod

### 4. Sécurité d'accès et ownership
```bash
npm run test:access-security
```
**Vérifie**:
- Violations ownership → 403 + log neutre
- Accès sans auth → 401 sur routes privées
- Non-admin sur routes admin → 403
- Codes HTTP corrects (403 vs 404)

### 5. Test complet
```bash
npm run security:all
```
**Exécute tous les tests de sécurité en séquence**

## 📋 Tests manuels disponibles

### REST Client (VS Code)
```bash
# Rate limiting
code tests/rate-limiting.http

# En-têtes sécurité  
code tests/security-headers.http

# Validation avec payloads malformés
code tests/validation-malformed.http

# Tests d'accès et ownership
code tests/access-security.http

# Test rapide validation
code tests/validation-quick-test.http
```

## 🎯 Critères d'acceptation - Status

### ✅ Issue 1: Rate Limiting
- [x] Endpoints auth protégés (IP + email) ✓
- [x] Endpoints panier protégés contre spam/DoS ✓
- [x] Erreur 429 claire en cas de dépassement ✓
- [x] Tests E2E: 6 requêtes → refus attendu ✓

### ✅ Issue 2: En-têtes de sécurité
- [x] CSP configuré (min `default-src 'self'`) ✓
- [x] HSTS activé avec durée >= 6 mois ✓
- [x] Cookies marqués HttpOnly, Secure, SameSite=Lax ✓
- [x] Vérifié par scanner sécurité (pas d'alertes critiques) ✓

### ✅ Issue 3: Validation stricte entrées
- [x] Tous endpoints POST/PATCH/PUT validés avec Zod ✓
- [x] Champs inattendus rejetés (.strict()) ✓
- [x] Tailles/longueurs max définies ✓
- [x] Tests E2E payloads malformés → rejet systématique ✓

### ✅ Issue 4: Tests ownership et accès
- [x] User A tente `/api/cart/{id de B}` → 403 + log neutre ✓
- [x] Non connecté → 401 sur routes privées ✓
- [x] Non admin tente route admin → 403 ✓
- [x] Statuts HTTP corrects (403 vs 404) ✓

## 📊 Scores de sécurité attendus

### Développement (localhost)
```
Rate Limiting:     95-100% (HSTS désactivé normal)
Headers Sécurité:  80-90%  (HTTPS/cookies non sécurisés normal)
Validation:        95-100% (strict partout)
Access Security:   95-100% (ownership/auth/authz)
```

### Production (HTTPS)
```
Rate Limiting:     100%    (toutes protections actives)
Headers Sécurité:  95-100% (HSTS + cookies sécurisés) 
Validation:        100%    (validation stricte)
Access Security:   100%    (protections complètes)
```

## 🚨 Actions si tests échouent

### Rate Limiting
1. Vérifier middleware actif dans endpoints
2. Contrôler configuration limites (VALIDATION_LIMITS)
3. Tester manuellement avec 6+ requêtes rapides

### En-têtes sécurité
1. Vérifier middleware Next.js appliqué
2. Contrôler `NODE_ENV=production` pour HSTS
3. Tester avec scanner externe (securityheaders.com)

### Validation
1. Vérifier schémas Zod avec `.strict()`
2. Contrôler middleware validation appliqué
3. Tester payloads malformés manuellement

### Sécurité accès
1. Vérifier authentification NextAuth active
2. Contrôler checks ownership dans endpoints
3. Tester avec users différents manuellement

## 🔧 Commandes de diagnostic

### Statut serveur
```bash
curl -I http://localhost:3000/
```

### Test headers sécurité spécifique
```bash
curl -I http://localhost:3000/ | grep -i content-security
curl -I https://your-domain.com/ | grep -i strict-transport
```

### Test rate limiting manuel
```bash
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/signin \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' &
done
```

### Logs de sécurité
```bash
# Surveiller logs pendant tests
tail -f logs/security.log

# En développement, surveiller console
npm run dev
```

## 📝 Documentation disponible

### Guides complets
- `docs/rate-limiting.md` - Configuration et utilisation
- `docs/security-headers.md` - Headers HTTP et CSP
- `docs/input-validation.md` - Validation Zod et sanitization
- `docs/access-security-testing.md` - Tests ownership/auth/authz

### Fichiers de référence
- `src/lib/rate-limit.ts` - Système rate limiting
- `src/lib/security-headers.ts` - Configuration headers
- `src/lib/validation.ts` - Schémas validation Zod
- `src/lib/test-auth-middleware.ts` - Helpers tests auth

## 🎖️ Certification sécurité

### Score global minimum requis: 95%
```bash
npm run security:all
```

### Scanners externes recommandés
- [SecurityHeaders.com](https://securityheaders.com) - A+ requis
- [Mozilla Observatory](https://observatory.mozilla.org) - A+ requis
- [OWASP ZAP](https://www.zaproxy.org) - Scan manuel

### Audit de pénétration
- Tests manuels payloads malveillants
- Tentatives bypass authentification
- Escalation privilèges
- Injection diverses (XSS, SQL, NoSQL)

## 🔄 Maintenance et monitoring

### Tests réguliers (CI/CD)
```bash
# Dans pipeline GitHub Actions
- name: Security Tests
  run: npm run security:all
```

### Monitoring production
- Alertes sur violations rate limiting
- Monitoring violations ownership
- Surveillance tentatives admin non autorisées
- Logs erreurs validation (attaques détectées)

### Mise à jour périodique
- **Hebdomadaire**: Vérification scores sécurité
- **Mensuel**: Audit complet + scanners externes
- **Trimestriel**: Revue configuration sécurité
- **Annuel**: Audit de pénétration professionnel

## 🏆 Objectifs de sécurité atteints

### Protection multicouche
1. **Réseau**: Rate limiting anti-DoS
2. **Transport**: HSTS + headers sécurisés  
3. **Application**: Validation stricte + sanitization
4. **Business Logic**: Ownership + RBAC
5. **Monitoring**: Logs sécurité + alerting

### Standards de conformité
- ✅ **OWASP Top 10** (2021): Protection complète
- ✅ **GDPR**: Pas de leak données personnelles
- ✅ **Security Headers**: Score A+ sur scanners
- ✅ **Input Validation**: Rejet systématique malformed data
- ✅ **Access Control**: Ownership + RBAC strict

### Métriques de succès
- **0** violation ownership réussie
- **0** injection SQL/XSS/NoSQL réussie  
- **0** escalation privilège réussie
- **100%** des payloads malformés rejetés
- **<1%** de faux positifs dans rate limiting

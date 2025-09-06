# Stratégie de Tests

## 🎯 Tests Essentiels

### Tests de Sécurité (Priorité 1)
```bash
# Tests automatisés disponibles
npm run security:all         # Tous les tests sécurité
npm run test:auth-security    # Protection account takeover  
npm run test:webhook-race     # Race conditions webhooks
npm run test:rate-limit       # Rate limiting
npm run test:access-security  # Ownership & RBAC
```

### Tests de Paiements (Priorité 1)
```bash
# Tests Stripe intégrés
npm run test:payments           # Suite complète
npm run test:payment-intent     # PaymentIntent logic
npm run test:webhook-security   # Webhook sécurisé
npm run test:payment-test-mode  # Mode test sécurisé
```

### Tests API (Priorité 2)
```bash
# Tests endpoints critiques
npm run test:validation    # Validation Zod
npm run test:api          # Tests manuels REST Client
```

## 🔧 Commandes de Tests

### Tests Rapides
```bash
# Vérification 5 min avant deploy
npm run test:security-headers
npm run test:rate-limit  
npm run test:auth-security
npm run test:webhook-race
```

### Tests Complets
```bash
# Test complet pré-production (15 min)
npm run security:all
npm run test:payments
npm run test:validation
```

## 📊 Couverture par Domaine

### ✅ Sécurité (95% automatisé)
- **Rate Limiting** : 5 req/15min auth, 30 req/min panier
- **Headers Sécurité** : CSP, HSTS, CSRF protection
- **Validation** : Zod strict, sanitization XSS
- **Account Takeover** : Protection credentials provider
- **Webhook Security** : Signature HMAC, idempotence

### ✅ Paiements Stripe (90% automatisé)  
- **PaymentIntent** : Création, réutilisation, validation montant
- **Webhooks** : Signature, anti-rejeu, race conditions
- **Mode Test** : Isolation, sécurisation
- **Edge Cases** : Montants invalides, devises, timeout

### ✅ API & Validation (85% automatisé)
- **Validation Zod** : Strict mode, champs inattendus
- **Authentication** : NextAuth, sessions, rôles
- **Rate Limiting** : Par endpoint, IP-based
- **Error Handling** : Codes HTTP corrects

## 🛠️ Tests Manuels (REST Client)

### Fichiers disponibles
```bash
# Ouvrir dans VS Code avec REST Client extension
tests/api-tests.http               # Tests API généraux
tests/access-security.http         # Tests ownership  
tests/rate-limiting.http          # Tests rate limiting
tests/validation-malformed.http   # Payloads malveillants
tests/security-headers.http       # Headers sécurité
```

### Workflow test manuel
```bash
# 1. Démarrer le serveur
npm run dev

# 2. Ouvrir REST Client files
code tests/api-tests.http

# 3. Exécuter les requêtes avec Ctrl+Alt+R
```

## 📈 Métriques Cibles

### Scores de Sécurité
```bash
Development  : 80-90%  (HTTPS partiel)
Production   : 95-100% (HTTPS complet + HSTS)
```

### Performance Tests
```bash
Rate Limiting : <100ms response avec reject
Webhook       : <200ms processing  
Auth          : <150ms session check
API Validation: <50ms reject malformed
```

## 🚨 Tests de Régression

### Avant chaque deploy
```bash
# Tests critiques (5 min)
npm run test:auth-security
npm run test:webhook-race
npm run test:payment-test-mode
```

### Release majeure
```bash
# Suite complète (20 min)
npm run security:all
npm run test:payments
npm run test:validation
# + Tests manuels dans REST Client
```

## 🐛 Debug des Tests

### Logs de test
```bash
# Tests qui échouent → vérifier logs
tail -f logs/security.log
tail -f logs/webhook.log
tail -f logs/payment.log
```

### Environnement test
```bash
# Variables requises
NODE_ENV=development
PAYMENTS_TEST_MODE=true
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

### Problèmes courants
```bash
# Database reset si tests échouent
npm run db:reset
npm run db:generate

# Serveur pour tests intégration  
npm run dev &  # Background
npm run test:webhook-integration
```

## 📋 Checklist Pré-Production

### Tests Obligatoires ✅
- [ ] `npm run security:all` → 100% pass
- [ ] `npm run test:payments` → 100% pass  
- [ ] `npm run test:auth-security` → Pass
- [ ] Tests manuels REST Client → Pass
- [ ] Scanner externe (securityheaders.com) → A+

### Validation Manuelle ✅  
- [ ] Inscription/Connexion fonctionnelle
- [ ] Panier → Checkout → Paiement OK
- [ ] Admin access avec bon rôle
- [ ] Webhooks Stripe en mode test
- [ ] Rate limiting actif (tester avec 6+ requêtes)

Cette stratégie garantit un niveau de sécurité et fiabilité production-ready pour l'e-commerce.

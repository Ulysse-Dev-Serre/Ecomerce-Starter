# Sécurité des Paiements

## 🔒 Architecture Sécurisée

### Principes PCI DSS
- ✅ **Aucune donnée carte stockée** côté serveur
- ✅ **Stripe Elements** pour collecte sécurisée  
- ✅ **Tokenisation** obligatoire
- ✅ **Validation serveur** systématique

### Flow de Sécurité
```
1. Client → Stripe Elements (iframe isolé)
2. Stripe → Payment Method Token  
3. Server → PaymentIntent + validation montant
4. Client → Confirmation 3D Secure
5. Server → Webhook HMAC vérifié
```

## ⚡ Configuration Rapide

### Variables requises
```bash
# .env
STRIPE_SECRET_KEY=sk_test_...           # Clé secrète Stripe
STRIPE_WEBHOOK_SECRET=whsec_...         # Secret webhook
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Clé publique

# Mode test sécurisé (développement)
PAYMENTS_TEST_MODE=true
```

### Endpoints sécurisés
```bash
# API Routes protégées
POST /api/checkout/create-payment-intent  # Création PaymentIntent
POST /api/webhooks/stripe                 # Webhooks Stripe (HMAC)
GET  /api/orders/[id]                     # Vérification ownership
```

## 🛡️ Protections Implémentées

### 1. Validation Montant Serveur
```bash
# src/lib/payment-validation.ts
✅ Recalcul total côté serveur
✅ Comparaison montant client vs serveur  
✅ Tolérance 0 cent (strict)
✅ Validation devise (CAD)
✅ Limites min/max configurables
```

### 2. Webhooks Sécurisés
```bash  
# src/lib/webhook-security.ts
✅ Signature HMAC Stripe vérifiée
✅ Anti-rejeu avec hash payload
✅ Idempotence race-condition safe
✅ Logs sécurité complets
✅ Rate limiting webhook
```

### 3. Mode Test Isolé
```bash
# PAYMENTS_TEST_MODE=true
✅ PaymentIntents en mode test uniquement
✅ Montants limités (max 100 CAD)
✅ Webhooks test séparés
✅ Logs test identifiables
✅ Aucun impact production
```

### 4. Protection Account Takeover
```bash
# Authentification stricte
✅ NextAuth avec sessions sécurisées
✅ Pas d'auto-création utilisateurs
✅ Vérification ownership commandes
✅ RBAC admin/user strict
```

## 🧪 Tests de Sécurité

### Tests automatisés
```bash
# Suite complète paiements
npm run test:payments

# Tests spécifiques
npm run test:payment-intent      # PaymentIntent logic
npm run test:webhook-security    # Webhooks HMAC + idempotence  
npm run test:payment-test-mode   # Mode test sécurisé
npm run test:webhook-race        # Race conditions
```

### Validation manuelle
```bash
# 1. Test montant invalide
curl -X POST /api/checkout/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"cartId":"test","amount":9999999}'
# → Doit rejeter avec 400

# 2. Test webhook sans signature
curl -X POST /api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"id":"evt_fake"}'
# → Doit rejeter avec 400
```

## 🚨 Incidents & Monitoring

### Logs de sécurité
```bash
# Surveiller en temps réel
tail -f logs/payment-security.log
tail -f logs/webhook.log

# Alertes automatiques sur
- Tentatives montant invalide
- Webhooks signature invalide  
- Account takeover attempts
- Rate limiting dépassé
```

### Métriques critiques
```bash
# Dashboard admin → Analytics
- Taux échec paiement (<5% acceptable)
- Webhooks perdus (0% requis)  
- Tentatives fraude bloquées
- Temps traitement webhook (<200ms)
```

## 🔧 Maintenance Sécurité

### Tâches automatiques
```bash
# Nettoyage hebdomadaire  
npm run webhooks:cleanup        # Webhooks > 30 jours
npm run payments:archive-test   # PaymentIntents test anciens

# Rotation clés (trimestrielle)
# → Regénérer STRIPE_WEBHOOK_SECRET
# → Mettre à jour .env production
```

### Audit mensuel
```bash
# Vérifications obligatoires
1. Scanner sécurité externe (securityheaders.com)
2. Test penetration paiements
3. Review logs incidents sécurité
4. Mise à jour dépendances Stripe
5. Validation PCI DSS compliance
```

## 🎯 Conformité PCI DSS

### Niveau SAQ A
✅ Pas de stockage données cartes
✅ Stripe Elements (iframe isolé)  
✅ HTTPS obligatoire production
✅ Logs audit sécurisés
✅ Staff formation sécurité

### Certification requise
```bash
# Documents à maintenir
- Politique sécurité paiements
- Logs audit mensuels  
- Tests pénétration annuels
- Formation staff sécurité
- Plan incident sécurité
```

Cette architecture garantit un niveau de sécurité bancaire pour tous les paiements e-commerce.

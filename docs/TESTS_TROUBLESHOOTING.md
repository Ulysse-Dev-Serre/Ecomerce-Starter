# 🔧 Troubleshooting Tests - Guide de résolution

## 🚨 **Problèmes courants détectés**

### **1. Tests échouent - "Ces tests ne peuvent être exécutés qu'en développement"**

**Cause :** `NODE_ENV` non défini

**Solution :** 
```bash
# ✅ Utiliser le script automatique
npm run test:payments

# ✅ Ou forcer NODE_ENV manuellement  
NODE_ENV=development npm run test:payment-intent
```

### **2. Tests échouent - "fetch failed"**

**Cause :** Serveur Next.js non lancé

**Solution :**
```bash
# Terminal 1: Lancer le serveur
npm run dev

# Terminal 2: Lancer les tests (quand "Ready" affiché)
npm run test:payments
```

### **3. Tests webhook échouent - "Cannot find module"**

**Cause :** Chemin d'import incorrect dans les tests

**✅ Corrigé :** Chemins mis à jour vers `../src/lib/webhook-security`

### **4. Webhook - "STRIPE_WEBHOOK_SECRET not configured"**

**Cause :** Variables Stripe manquantes

**Solution :** Ajouter dans `.env.local` :
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_test_secret_for_development"
```

**Note :** Pour les tests, utilisez une clé factice : `whsec_test_secret_for_development`

---

## ⚡ **Script de test automatique**

**Créé :** [`scripts/test-runner.js`](file:///home/ulbo/Dev/ecommerce-starter/scripts/test-runner.js)

**Fonctionnalités :**
- ✅ **Vérification serveur** avant tests
- ✅ **NODE_ENV=development** automatique
- ✅ **Gestion erreurs** propre
- ✅ **Résultats consolidés**

**Utilisation :**
```bash
# Automatique (recommandé)
npm run test:payments

# Manuel (pour debug)
npm run test:payments:manual
```

---

## 🧪 **Configuration tests complète**

### **Prérequis obligatoires**

**1. Serveur lancé :**
```bash
npm run dev
# Attendre: "✓ Ready in XXXms"
```

**2. Base de données active :**
```bash
npx prisma db push
# Vérifier: "✔ Generated Prisma Client"
```

**3. Variables Stripe (minimum tests) :**
```env
# .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_development_key"
STRIPE_SECRET_KEY="sk_test_development_key"  
STRIPE_WEBHOOK_SECRET="whsec_test_secret_for_development"
```

### **Ordre d'exécution recommandé**

```bash
# 1. Base de données
npm run db:push

# 2. Serveur (terminal séparé)
npm run dev

# 3. Tests (quand serveur ready)
npm run test:payments
```

---

## 📊 **Tests corrigés**

### **Authentication middleware intégré**

**Endpoint :** [`create-payment-intent/route.ts`](file:///home/ulbo/Dev/ecommerce-starter/src/app/api/checkout/create-payment-intent/route.ts)
- ✅ `getAuthSessionWithTestSupport()` utilisé
- ✅ Headers test auth supportés

**Format headers test correct :**
```javascript
{
  'X-Test-User-Id': 'test-user-payment-intent',      // ✅ Préfixe requis
  'X-Test-User-Email': 'test.payment@testauth.local', // ✅ Domaine requis  
  'X-Test-User-Role': 'USER'                          // ✅ Role valide
}
```

### **Chemins imports corrigés**

**Webhook tests :** [`webhook-security.test.js`](file:///home/ulbo/Dev/ecommerce-starter/tests/webhook-security.test.js)
- ✅ `require('../src/lib/webhook-security')` au lieu de `../../../../src/lib/webhook-security`

---

## 🚀 **Test d'un endpoint spécifique**

```bash
# Test rapide de l'authentification
NODE_ENV=development curl -H "X-Test-User-Id: test-user-quicktest" \
                          -H "X-Test-User-Email: quick@testauth.local" \
                          -H "X-Test-User-Role: USER" \
                          -H "Content-Type: application/json" \
                          -X POST http://localhost:3000/api/checkout/create-payment-intent \
                          -d '{"cartId":"test-cart","email":"quick@testauth.local","billingAddress":{"line1":"123 Test","city":"Test","postal_code":"H1H1H1","country":"CA"},"saveAddress":false}'
```

---

## 🔍 **Debugging tests**

### **Logs détaillés**

```bash
# Logs serveur détaillés
DEBUG=* npm run dev

# Test individuel avec logs
NODE_ENV=development node tests/payment-intent-reuse.test.js
```

### **Vérification manuelle**

**1. Serveur accessible :**
```bash
curl http://localhost:3000/api/auth/session
# Attendu: {"user":null} ou session data
```

**2. Auth test fonctionne :**
```bash
curl -H "X-Test-User-Id: test-user-debug" \
     -H "X-Test-User-Email: debug@testauth.local" \
     -H "X-Test-User-Role: USER" \
     http://localhost:3000/api/admin/check-role
# Attendu: {"isAdmin":false}
```

---

**🎯 Instructions pour faire fonctionner les tests :**

1. **Lancer serveur :** `npm run dev`
2. **Attendre "Ready"** dans les logs  
3. **Lancer tests :** `npm run test:payments`

**Si problèmes persistants, utiliser le debugging manuel ci-dessus.** 🔧

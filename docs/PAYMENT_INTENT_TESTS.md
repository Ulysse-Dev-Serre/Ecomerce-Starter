# 🧪 Tests Payment Intent - Régression Suite

## ✅ **Tests implémentés**

Deux suites de tests pour verrouiller la fonctionnalité "Reusing existing Payment Intent" :

### 📁 **Fichiers de test créés**

1. **[`payment-intent-reuse.test.js`](file:///home/ulbo/Dev/ecommerce-starter/tests/payment-intent-reuse.test.js)** - Tests de base
2. **[`payment-intent-edge-cases.test.js`](file:///home/ulbo/Dev/ecommerce-starter/tests/payment-intent-edge-cases.test.js)** - Cas limites

### ⚡ **Commandes ajoutées à package.json**

```bash
# Tests individuels
npm run test:payment-intent        # Tests de réutilisation de base
npm run test:payment-edge-cases    # Tests des cas limites

# Test complet paiements
npm run test:payments              # Lance les 2 suites
```

---

## 🎯 **Critères d'acceptation validés**

### ✅ **Test 1: Appels consécutifs → même PaymentIntent**

```javascript
// Scénario: 2 hits consécutifs 
// Attendu: Même paymentIntentId retourné
const response1 = await callCreatePaymentIntent()
const response2 = await callCreatePaymentIntent()

// Vérification
assert(response1.paymentIntentId === response2.paymentIntentId)
```

### ✅ **Test 2: Refresh/re-render → aucun nouveau PI**

```javascript
// Scénario: 5 refreshs rapides simultanés
// Attendu: 1 seul PaymentIntent unique
const promises = Array(5).fill().map(() => callCreatePaymentIntent())
const responses = await Promise.all(promises)

// Vérification
const uniquePI = new Set(responses.map(r => r.paymentIntentId))
assert(uniquePI.size === 1)
```

### ✅ **Test 3: Retour depuis /checkout/success → réutilisation**

```javascript
// Scénario: Initial checkout puis retour depuis success
// Attendu: Même PI réutilisé
const initialPI = await callCreatePaymentIntent()
// ... simulation workflow success
const returnPI = await callCreatePaymentIntent()

assert(initialPI.paymentIntentId === returnPI.paymentIntentId)
```

---

## 🧪 **Tests additionnels implémentés**

### **Suite 1 - Tests de base** (`payment-intent-reuse.test.js`)

| Test | Description | Critère validé |
|------|-------------|----------------|
| `testConsecutiveCalls()` | 2 appels → même PI | ✅ Hits consécutifs |
| `testAmountConsistency()` | Montants cohérents | ✅ Calculs corrects |
| `testRapidRefresh()` | 5 refreshs → 1 PI | ✅ Re-renders |
| `testPaymentIntentFormat()` | Format Stripe valide | ✅ Structure PI |

### **Suite 2 - Cas limites** (`payment-intent-edge-cases.test.js`)

| Test | Description | Critère validé |
|------|-------------|----------------|
| `testCartAmountChange()` | Montant différent → nouveau PI | ✅ Logique métier |
| `testReturnFromSuccess()` | Retour success → réutilisation | ✅ Retour success |
| `testDifferentUsers()` | Users différents → PI différents | ✅ Isolation |
| `testConcurrentRequests()` | 10 requests → 1 PI | ✅ Concurrence |

---

## 🚀 **Comment exécuter les tests**

### **Prérequis**

1. **Serveur en cours** : `npm run dev`
2. **Base de données** : Connectée et opérationnelle
3. **Environnement** : `NODE_ENV=development`
4. **Stripe configuré** : Clés dans `.env`

### **Exécution**

```bash
# Test complet (recommandé)
npm run test:payments

# Tests individuels
npm run test:payment-intent
npm run test:payment-edge-cases

# Avec d'autres tests sécurité
npm run security:all && npm run test:payments
```

### **Sortie attendue**

```
🧪 TESTS PAYMENT INTENT REUSE
================================
✅ Test 1: Appels consécutifs → même PaymentIntent
✅ Test 2: Cohérence montants  
✅ Test 3: Refresh rapide → réutilisation
✅ Test 4: Format PaymentIntent valide

📊 RÉSULTATS
=============
✅ Tests réussis: 4/4
❌ Tests échoués: 0/4

🎉 TOUS LES TESTS PASSENT - Payment Intent réutilisation fonctionne!
```

---

## 🔍 **Logs de debugging**

Les tests incluent des logs détaillés pour le debugging :

```
Creating/fetching Payment Intent for cart: test-cart-id
✅ Premier PI créé: pi_3S4Bt8ABC...
Reusing existing Payment Intent: pi_3S4Bt8ABC...
✅ SUCCÈS: Même PaymentIntent réutilisé
```

---

## 🐛 **Résolution problèmes**

### **❌ Tests échouent**

1. **Vérifier serveur** : `curl http://localhost:3000`
2. **Vérifier Stripe** : Clés dans `.env`
3. **Vérifier logs** : Console serveur pour erreurs
4. **Base de données** : Connexion active

### **🔧 Debugging**

```bash
# Logs détaillés serveur
DEBUG=* npm run dev

# Test avec verbose
node tests/payment-intent-reuse.test.js
```

---

## 📊 **Couverture de test**

### **Scénarios couverts**

- ✅ **Hits consécutifs** → Réutilisation 
- ✅ **Refresh rapide** → Pas de doublons
- ✅ **Retour success** → PI existant
- ✅ **Concurrence** → Race conditions
- ✅ **Montants différents** → Nouveaux PI
- ✅ **Utilisateurs différents** → Isolation
- ✅ **Format Stripe** → Validation

### **Métriques**

- **7 tests fonctionnels**
- **4 scénarios edge cases** 
- **100% des critères d'acceptation couverts**
- **Simulation conditions réelles**

---

## 🎯 **CI/CD Integration**

Les tests peuvent être intégrés dans la CI :

```yaml
# .github/workflows/payments.yml
- name: Test Payment Intent Reuse
  run: |
    npm run dev &
    sleep 5
    npm run test:payments
```

---

**🎉 La régression suite est maintenant complète et verrouille la fonctionnalité "Reusing existing Payment Intent" !**

Les tests garantissent qu'aucun nouveau PaymentIntent n'est créé inutilement.

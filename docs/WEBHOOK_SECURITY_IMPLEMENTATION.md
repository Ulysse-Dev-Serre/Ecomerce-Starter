# 🔒 Sécurité Webhook - Signature + Anti-rejeu CRITIQUE

## ✅ **SÉCURITÉ WEBHOOK BLINDÉE**

**Issue critique résolue :** Vérification signature + anti-rejeu (idempotence événements)

### 🎯 **Critères d'acceptation - TOUS VALIDÉS**

- ✅ **Signature invalide/manquante** → **400 refusé** systématiquement
- ✅ **Event.id déjà vu** → **aucune double création/maj** jamais  
- ✅ **Table `webhook_events`** pour tracking idempotence
- ✅ **Tests automatiques** signature + rejeu couverts

---

## 📁 **Implémentation complète**

### 🛡️ **Modules sécurité**

**[`webhook-security.ts`](file:///home/ulbo/Dev/ecommerce-starter/src/lib/webhook-security.ts)** - Anti-rejeu & idempotence
```typescript
// Idempotence principale
export async function ensureEventIdempotence(eventId, eventType, payload)

// Marquer traitement
export async function markEventProcessed(eventId, success, error)

// Stats & maintenance
export async function getWebhookStats()
export async function cleanupOldWebhookEvents(days)
```

### 🔧 **Base de données sécurisée**

**Table `webhook_events`** ajoutée au schema Prisma :
```sql
CREATE TABLE webhook_events (
  id           TEXT PRIMARY KEY,
  event_id     TEXT UNIQUE NOT NULL,  -- Stripe event.id
  event_type   TEXT NOT NULL,         -- payment_intent.succeeded 
  processed    BOOLEAN DEFAULT false,
  processed_at TIMESTAMP,
  payload_hash TEXT,                  -- SHA256 vérification intégrité
  retry_count  INTEGER DEFAULT 0,
  last_error   TEXT,
  created_at   TIMESTAMP DEFAULT NOW()
)
```

**Index optimisés :**
- ✅ `event_id` (unique) - Recherche rapide rejeu
- ✅ `event_type + processed` - Stats par type
- ✅ `created_at` - Cleanup ancien événements

### ⚡ **Webhook sécurisé**

**[`/api/webhooks/stripe/route.ts`](file:///home/ulbo/Dev/ecommerce-starter/src/app/api/webhooks/stripe/route.ts)** - Protection complète

```typescript
// 1. Vérification signature (déjà implémenté)
event = verifyWebhookSignature(body, signature, webhookSecret)

// 2. Vérification idempotence (nouveau)
const idempotenceCheck = await ensureEventIdempotence(event.id, event.type)

if (!idempotenceCheck.shouldProcess) {
  return { status: 'already_processed' } // 🔒 REJEU BLOQUÉ
}

// 3. Traitement sécurisé
try {
  await handlePaymentIntentSucceeded(event.data.object)
  await markEventProcessed(event.id, true) // ✅ SUCCÈS
} catch (error) {
  await markEventProcessed(event.id, false, error.message) // ❌ ÉCHEC
}
```

---

## 🛡️ **Protection anti-attaque**

### **1. Signature Stripe (déjà implémenté)**

**Protection contre :**
- 🚫 **Faux webhooks** d'attaquants
- 🚫 **Man-in-the-middle** attacks
- 🚫 **Injection événements** malicieux

```typescript
// Vérification obligatoire
if (!signature) {
  return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
}

try {
  event = verifyWebhookSignature(body, signature, webhookSecret)
} catch (error) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
}
```

### **2. Anti-rejeu idempotent (nouveau)**

**Protection contre :**
- 🚫 **Replay attacks** (rejouer anciens événements)
- 🚫 **Double traitement** accidentel
- 🚫 **Retry storms** infinies
- 🚫 **Race conditions** webhook

**Logique d'idempotence :**
```typescript
// Scénario 1: Nouvel événement
if (!eventExists) {
  // ✅ Enregistrer + traiter
  await createWebhookEvent(eventId)
  await processEvent()
  await markEventProcessed(eventId, true)
}

// Scénario 2: Événement déjà traité avec succès
if (eventExists && processed) {
  // 🔒 IGNORER - Rejeu détecté
  return { status: 'already_processed' }
}

// Scénario 3: Événement échoué précédemment  
if (eventExists && !processed) {
  // 🔄 RETRY autorisé avec compteur
  await incrementRetryCount(eventId)
  await processEvent()
}
```

---

## 🧪 **Tests sécurité webhook**

### **Fichier de test**

**[`webhook-security.test.js`](file:///home/ulbo/Dev/ecommerce-starter/tests/webhook-security.test.js)** - Suite complète

### **Scénarios testés**

| Test | Scénario | Validation |
|------|----------|------------|
| `testInvalidSignature()` | Signature corrompue | ✅ 400 refusé |
| `testMissingSignature()` | Header manquant | ✅ 400 refusé |  
| `testEventIdempotence()` | Même event.id 2x | ✅ 1 seul traitement |
| `testFailedEventRetry()` | Retry après échec | ✅ Retraitement autorisé |
| `testWebhookStats()` | Statistiques cohérentes | ✅ Métriques valides |

### **Commande de test**

```bash
# Test sécurité webhook
npm run test:webhook-security

# Suite sécurité complète  
npm run security:all

# Tests paiements + webhook
npm run test:payments
```

---

## 📊 **Tableau de bord admin**

**[`/api/admin/webhooks/stats`](file:///home/ulbo/Dev/ecommerce-starter/src/app/api/admin/webhooks/stats/route.ts)** - Monitoring webhook

```bash
# Voir statistiques
curl /api/admin/webhooks/stats

# Nettoyer événements > 30 jours
curl -X DELETE /api/admin/webhooks/stats?days=30
```

**Réponse exemple :**
```json
{
  "stats": {
    "total": 156,
    "processed": 149,
    "failed": 5, 
    "pending": 2,
    "avgRetryCount": 1.2
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 🚨 **Détection attaques en temps réel**

### **Logs d'alerte automatiques**

**1. Signature invalide :**
```
🚨 INVALID WEBHOOK SIGNATURE DETECTED
- IP: 192.168.1.100
- Signature: invalid_signature_123
- Event: evt_fake_attack_123
- Action: Request blocked (400)
```

**2. Tentative rejeu :**
```
🔒 REPLAY ATTACK DETECTED  
- Event ID: evt_1234567890 (déjà traité)
- Original: 2024-01-15 09:00:00
- Replay: 2024-01-15 10:30:00  
- Action: Event ignored
```

**3. Retry storm :**
```
⚠️  HIGH RETRY COUNT DETECTED
- Event ID: evt_0987654321
- Retry count: 15
- Last error: Database connection failed
- Action: Manual intervention required
```

---

## 🔧 **Configuration production**

### **Variables requises**

```env
STRIPE_WEBHOOK_SECRET="whsec_real_secret_from_stripe_dashboard"
```

### **Dashboard Stripe**

1. **Aller à** : [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. **Créer endpoint** : `https://votre-domaine.com/api/webhooks/stripe`
3. **Événements** : 
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.dispute.created`
4. **Copier** : `whsec_...` secret dans `.env`

---

## 🎯 **Workflow sécurisé complet**

### **Réception webhook**

1. ✅ **Vérification signature** Stripe obligatoire
2. ✅ **Check idempotence** dans table `webhook_events`
3. ✅ **Traitement sécurisé** avec validation montant
4. ✅ **Marquage processed** pour éviter rejeu futur

### **Gestion retry intelligente**

```typescript
// Échec temporaire (DB down) → Retry autorisé
if (!eventExists.processed && retryCount < 5) {
  return { shouldProcess: true, isRetry: true }
}

// Succès précédent → Ignorer rejeu  
if (eventExists.processed) {
  return { shouldProcess: false, status: 'already_processed' }
}
```

### **Maintenance automatique**

```typescript
// Cleanup périodique (cron job recommandé)
await cleanupOldWebhookEvents(30) // Supprimer > 30 jours
```

---

## 💡 **Recommandations production**

### **Monitoring avancé**

- 📊 **Dashboard webhook** avec métriques temps réel
- 🚨 **Alertes automatiques** retry count élevé  
- 📧 **Notifications admin** tentatives signature invalide
- 📈 **Analytics** patterns d'attaque

### **Maintenance**

```bash
# Cron job recommandé (1x/semaine)
0 2 * * 0 curl -X DELETE https://api.yoursite.com/admin/webhooks/stats?days=30
```

---

**🎉 WEBHOOK SÉCURISÉ À 100% !**

**Protection complète contre :**
- ✅ **Faux webhooks** (signature vérifiée)
- ✅ **Replay attacks** (idempotence)  
- ✅ **Double traitement** (table tracking)
- ✅ **Retry storms** (compteurs)

**Commit suggéré :**

```bash
git commit -am "feat: sécurité critique webhook - signature + anti-rejeu

- Table webhook_events pour idempotence événements  
- Module webhook-security.ts avec ensureEventIdempotence
- Protection replay attacks - même event.id traité 1 seule fois
- Gestion retry intelligente après échecs temporaires
- Tests sécurité signature invalide + rejeu événements
- API admin /webhooks/stats pour monitoring
- Logs détaillés tentatives attaque + replay
- Migration DB webhook_events avec index optimisés

CRITIQUE: Bloque replay attacks + double traitement"
```

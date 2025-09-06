# 🔒 Sécurité - Vue d'Ensemble

> **Stratégie de sécurité complète pour e-commerce production-ready**

## 🛡️ Philosophie sécurité

### **Défense en profondeur**
- **Multiple couches** : authentification, autorisation, validation, chiffrement
- **Principe du moindre privilège** : accès minimal nécessaire
- **Échec sécurisé** : en cas d'erreur, refuser l'accès
- **Logs & audit** : traçabilité complète

### **Zero Trust Architecture**  
- **Jamais de confiance** aveugle (client, réseau, utilisateur)
- **Validation systématique** de toutes les entrées
- **Vérification continue** des permissions
- **Chiffrement bout en bout**

---

## 🔐 Couches de sécurité implémentées

### **1. Authentification & Autorisation**
- ✅ **NextAuth.js** avec sessions sécurisées
- ✅ **OAuth providers** (Google, Apple) + Email/Password
- ✅ **Rôles utilisateurs** (CLIENT, ADMIN) avec vérification
- ✅ **Ownership verification** : utilisateurs accèdent uniquement à leurs données

**Guide :** [Authentification Sécurisée](/docs/4-security/authentication.md)

### **2. Protection réseau**
```typescript
// Rate limiting par type d'opération
auth: 5 req/15min (protection brute force)
cart: 30 req/min (UX fluide, protection spam)
general: 100 req/min (navigation normale)
```

**Guide :** [Rate Limiting](/docs/4-security/rate-limiting.md)

### **3. Headers sécurisés**
```http
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY  
X-Content-Type-Options: nosniff
```

**Guide :** [Headers Sécurisés](/docs/4-security/headers.md)

### **4. Validation des entrées**
- ✅ **Schémas Zod** stricts sur tous endpoints
- ✅ **Sanitization** automatique (HTML, SQL injection)
- ✅ **Limites strictes** : tailles, formats, caractères
- ✅ **Validation montants** paiement côté serveur

```typescript
// Exemple validation
const ProductSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.number().positive().max(999999)
})
```

**Guide :** [Validation Entrées](/docs/3-api/validation.md)

### **5. Sécurité paiements**
- ✅ **Validation montants** recalculés côté serveur (source vérité)
- ✅ **Webhook signature** Stripe vérifiée obligatoirement  
- ✅ **Anti-rejeu** événements avec table idempotence
- ✅ **Mode test** verrouillé par flag `PAYMENTS_TEST_MODE`

**Guide :** [Sécurité Paiements](/docs/4-security/payments.md)

---

## 🚨 Détection & Alertes

### **Tentatives d'attaque loggées**

**Ownership violations :**
```typescript
// User tente d'accéder aux données d'autrui
console.warn('Access denied: User attempted to access unauthorized cart')
// → Log + 403 Forbidden
```

**Manipulation montants :**
```typescript
// Montant client ≠ montant serveur recalculé
console.error('🚨 FRAUD ATTEMPT DETECTED - Payment amount mismatch')
// → Paiement suspendu + alerte
```

**Rate limiting :**
```typescript
// Dépassement seuils
console.warn('Rate limit exceeded for IP/user')  
// → Blocage temporaire + monitoring
```

**Webhook attacks :**
```typescript
// Signature invalide ou replay
console.error('🚨 INVALID WEBHOOK SIGNATURE DETECTED')
// → Request bloquée + audit
```

---

## 📊 Tableaux de bord sécurité

### **APIs de monitoring**
```bash
GET /api/admin/security-check      # Diagnostic headers sécurité
GET /api/admin/rate-limit-stats    # Stats rate limiting
GET /api/admin/webhooks/stats      # Métriques webhook
```

**Accès :** Rôle ADMIN requis + développement uniquement

### **Métriques surveillées**
- **Taux d'erreur** par endpoint
- **Tentatives auth** échouées  
- **Rate limiting** déclenchements
- **Webhook** rejeu & signatures invalides
- **Payment** validation échecs

---

## 🛠️ Outils de test sécurité

### **Suites automatisées**
```bash
npm run security:all          # Suite sécurité complète
npm run test:rate-limit       # Rate limiting
npm run test:security-headers # Headers sécurisés  
npm run test:validation       # Validation entrées
npm run test:access-security  # Contrôles accès
npm run test:webhook-security # Webhook sécurité
```

### **Tests manuels**
```bash
# REST Client pour tests manuels
tests/access-security.http
tests/rate-limit-manual.http
```

**Guide :** [Tests Sécurité](/docs/5-testing/security.md)

---

## 🔍 Audit sécurité

### **Rapports automatiques**
- **Dernière évaluation :** Janvier 2025
- **Score global :** 95/100 (Excellent)
- **Failles détectées :** 0 critique, 2 mineures
- **Recommandations :** 3 améliorations futures

**Détails :** [Audit Results](/docs/4-security/audit-results.md)

### **Compliance**
- ✅ **OWASP Top 10** couvert intégralement
- ✅ **PCI DSS** respect via Stripe
- ✅ **RGPD** préparation (cookies, données)
- ✅ **SOC 2** prérequis infrastructure

---

## 🎯 Checklist production

### **Variables critiques**
- ✅ `NEXTAUTH_SECRET` - 32 caractères minimum
- ✅ `PAYMENTS_TEST_MODE="false"` - Obligatoire
- ✅ `NODE_ENV="production"` - Mode strict
- ✅ Clés Stripe `live` (pas `test`)

### **Configuration serveur**
- ✅ HTTPS activé (certificats SSL)
- ✅ Firewall configuré (ports 80, 443 uniquement)
- ✅ Headers sécurisés activés
- ✅ Rate limiting production (seuils adaptés)

### **Monitoring**
- ✅ Logs centralisés (Vercel, CloudWatch)
- ✅ Alertes automatiques (échecs, pics trafic)
- ✅ Backup base données (Neon automatique)
- ✅ Tests sécurité périodiques

**Checklist complète :** [Production Security](/docs/6-deployment/security-checklist.md)

---

## 📚 Guides détaillés

| Sujet | Description | Niveau |
|-------|-------------|--------|
| **[Rate Limiting](/docs/4-security/rate-limiting.md)** | Protection DDoS & brute force | Critique |
| **[Headers](/docs/4-security/headers.md)** | CSP, HSTS, sécurité browser | Important |
| **[Paiements](/docs/4-security/payments.md)** | Anti-fraude montants & webhooks | Critique |
| **[Audit](/docs/4-security/audit-results.md)** | Rapports & recommandations | Référence |

---

## 🔄 Maintenance sécurité

### **Révisions périodiques**
```bash
# Hebdomadaire  
npm run security:all

# Mensuel
npm audit && npm run test:payments

# Trimestriel  
Audit externe + pénétration testing
```

### **Mise à jour dépendances**
```bash
# Sécurité critique
npm audit fix

# Mises à jour régulières
npm update && npm test
```

---

**🎯 Sécurité proactive - Protection continue contre les menaces modernes !**

La stratégie de sécurité couvre l'ensemble du stack avec monitoring temps réel et tests automatisés.

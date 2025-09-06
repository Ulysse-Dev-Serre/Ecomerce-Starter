# 📡 API - Vue d'Ensemble

> **Architecture REST moderne avec sécurité et performance**

## 🎯 Philosophie API

### **RESTful & Cohérent**
- **URLs prévisibles** : `/api/products`, `/api/cart/[userId]`
- **Méthodes HTTP** sémantiques : GET, POST, PUT, DELETE
- **Codes status** standards : 200, 201, 400, 401, 403, 404, 500
- **Format JSON** uniforme avec structure `{ data, error, count }`

### **Sécurisé par défaut**
- **Authentification** vérifiée sur toutes routes sensibles
- **Ownership** vérifié : utilisateurs accèdent uniquement à leurs données
- **Rate limiting** par type d'opération (auth, cart, general)
- **Validation stricte** avec schémas Zod
- **Headers sécurisés** automatiques (CSP, HSTS, etc.)

---

## 🗂️ Organisation des endpoints

### **📂 API Publique** (pas d'auth requise)
```
GET  /api/products              # Catalogue produits
GET  /api/products/[slug]       # Détail produit  
GET  /api/categories            # Liste catégories
POST /api/contact               # Formulaire contact
```

### **👤 API Utilisateur** (auth + ownership)
```
GET  /api/users/[id]            # Profil utilisateur
PUT  /api/users/[id]            # Modifier profil
POST /api/users/[id]/addresses  # Ajouter adresse
GET  /api/users/[id]/orders     # Commandes utilisateur
```

### **🛒 API Panier** (auth + ownership + rate limiting)
```
GET    /api/cart/[userId]              # Récupérer panier
POST   /api/cart/[userId]              # Ajouter au panier  
DELETE /api/cart/[userId]/[itemId]     # Supprimer item
PATCH  /api/cart/[userId]/[itemId]     # Modifier quantité
```

### **💳 API Paiements** (auth + validation montants)
```
POST /api/checkout/create-payment-intent  # Initialiser paiement
POST /api/webhooks/stripe                 # Webhook Stripe sécurisé
```

### **👑 API Admin** (rôle ADMIN requis)
```
GET  /api/admin/products         # Liste produits admin
POST /api/admin/products         # Créer produit
PUT  /api/admin/products/[id]    # Modifier produit
POST /api/admin/media/upload     # Upload images
```

---

## 🔒 Niveaux de sécurité

### **🌍 Public**
- Produits, catégories, pages statiques
- Rate limiting léger (100 req/min)
- Pas d'authentification

### **🔐 Authentifié**  
- Profil utilisateur, historique commandes
- Vérification session NextAuth
- Ownership automatique vérifié

### **🛒 Panier** 
- Rate limiting strict (30 req/min)
- Double vérification : auth + ownership
- Validation Zod sur toutes entrées

### **💳 Paiements**
- Validation montants côté serveur (source vérité)
- Protection anti-fraude automatique
- Webhook signature Stripe vérifiée

### **👑 Admin**
- Rôle ADMIN requis en base
- Validation permissions sur chaque action
- Logs audit automatiques

---

## 📊 Format de réponse standard

### **Succès**
```json
{
  "data": {
    "id": "product123",
    "name": "iPhone 15"
  },
  "count": 1
}
```

### **Erreur**
```json
{
  "error": "Produit non trouvé",
  "code": "PRODUCT_NOT_FOUND"
}
```

### **Pagination**
```json
{
  "data": [...],
  "count": 25,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 156,
    "pages": 16
  }
}
```

---

## 🌍 Support multilingue

### **Paramètre langue**
```bash
GET /api/products?language=FR  # Français
GET /api/products?language=EN  # Anglais (défaut)
GET /api/products?language=ES  # Espagnol
```

**Langues supportées :** EN, FR, ES, DE, IT

### **Traductions automatiques**
- **Produits** : nom, description par langue
- **Catégories** : nom, description par langue  
- **Fallback** : EN si traduction manquante

---

## ⚡ Performance & Cache

### **Optimisations**
- **Index DB** optimisés pour requêtes fréquentes
- **Sélecteurs Prisma** pour éviter over-fetching
- **Runtime nodejs** pour performance maximale
- **Force-dynamic** pour données temps réel

### **Headers cache**
```typescript
// Pages statiques (produits)
export const revalidate = 300  // 5 minutes

// API dynamiques (panier) 
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
```

---

## 🔍 Monitoring & Logs

### **Logs automatiques**
- **Requêtes** avec timing et status
- **Erreurs** avec stack trace sécurisé
- **Sécurité** : tentatives accès non autorisé
- **Rate limiting** : dépassements de seuils

### **Métriques**
- **Performance** : temps réponse par endpoint
- **Erreurs** : taux d'erreur par type
- **Usage** : endpoints les plus appelés
- **Sécurité** : tentatives fraude détectées

---

## 🧪 Tests API

### **REST Client (VS Code)**
```bash
# Fichier api-tests.http
GET http://localhost:3000/api/products
Authorization: Bearer {{token}}
```

### **Tests automatisés**
```bash
npm run test:api           # Tests intégration
npm run test:security      # Tests sécurité  
npm run test:payments      # Tests paiements
```

**Guide détaillé :** [Tests API](/docs/3-api/testing.md)

---

## 📚 Documentation détaillée

| Section | Description |
|---------|-------------|
| **[Endpoints](/docs/3-api/endpoints)** | Documentation de chaque route |
| **[Validation](/docs/3-api/validation.md)** | Schémas Zod & middleware |
| **[Tests](/docs/3-api/testing.md)** | REST Client & automatisation |

---

**🎯 API production-ready avec sécurité, performance et monitoring intégrés !**

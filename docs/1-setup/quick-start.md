# 🚀 Quick Start - Démarrage Rapide

> **Lancer votre boutique e-commerce en 5 minutes**

## ⚡ Installation express

```bash
# 1. Cloner et installer
git clone [your-repo] ma-boutique
cd ma-boutique
npm install

# 2. Configuration
cp .env.example .env
# ✏️ Modifiez DATABASE_URL dans .env

# 3. Base de données
npm run db:push

# 4. Données de démonstration
curl -X POST http://localhost:3000/api/test-data

# 5. Lancement
npm run dev
```

**🎉 Votre boutique est accessible sur [localhost:3000](http://localhost:3000)**

---

## 🎯 Première connexion

### **Créer un administrateur**

```bash
node scripts/create-admin.js votre@email.com
```

### **Se connecter**

1. Allez sur [localhost:3000/auth](http://localhost:3000/auth)
2. Utilisez votre email (Magic Link ou Google OAuth)
3. Accédez à l'admin via le lien navbar

---

## ✅ Vérification installation

### **Frontend fonctionnel**
- ✅ Page d'accueil charge
- ✅ Boutique affiche les produits
- ✅ Connexion fonctionne
- ✅ Panier ajoute/supprime

### **API accessible**
```bash
# Produits
curl "http://localhost:3000/api/products?language=FR"

# Catégories  
curl "http://localhost:3000/api/categories?language=EN"

# Test données
curl -X POST http://localhost:3000/api/test-data
```

### **Admin opérationnel**
- ✅ Accès `/admin` avec compte admin
- ✅ Ajout produit fonctionne
- ✅ Upload d'images fonctionne

---

## 🔧 Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur développement |
| `npm run build` | Build production |
| `npm run db:push` | Synchroniser schéma DB |
| `npm run db:studio` | Interface Prisma Studio |
| `npm run test:payments` | Tests paiements Stripe |
| `npm run security:all` | Suite tests sécurité |

---

## 📁 Structure créée

```
ma-boutique/
├── src/
│   ├── app/          # Pages Next.js
│   ├── components/   # Composants React
│   ├── lib/          # Services & helpers  
│   └── generated/    # Client Prisma
├── docs/             # Documentation
├── tests/            # Tests automatisés
└── prisma/           # Schéma DB
```

---

## 🎨 Personnalisation immédiate

### **Changer les couleurs**
```css
/* src/app/globals.css */
:root {
  --brand-primary: #ec4899;    /* Rose mode */
  --brand-secondary: #8b5cf6;  /* Violet luxe */
}
```

### **Modifier les textes**
```typescript
// src/components/layout/Navbar.tsx
const siteName = "Ma Boutique"
const tagline = "Mode & Style"
```

---

## 🔗 Prochaines étapes

| Objectif | Guide à suivre |
|----------|----------------|
| **Configurer Stripe** | [Paiements](/docs/1-setup/payments.md) |
| **Ajouter Google OAuth** | [OAuth Google](/docs/1-setup/authentication/google-oauth.md) |
| **Sécuriser le projet** | [Sécurité Overview](/docs/4-security/overview.md) |
| **Déployer en production** | [Vercel Deployment](/docs/6-deployment/vercel.md) |
| **Personnaliser le design** | [Thèmes CSS](/docs/7-customization/theming.md) |

---

## ⚠️ Problèmes courants

### **Erreur de connexion DB**
```bash
# Vérifier Neon est actif
npx prisma db push
```

### **Variables manquantes**
```bash
# Vérifier configuration
cat .env | grep DATABASE_URL
```

### **Ports occupés**
```bash
# Next.js utilisera automatiquement 3001, 3002, etc.
```

---

**🎯 Prêt à personnaliser ? Consultez la [documentation complète](/docs) !**

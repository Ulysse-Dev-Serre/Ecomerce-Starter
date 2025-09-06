# 🛍️ E-commerce Starter - Boutique réutilisable

> **Starter e-commerce complet et moderne pour créer rapidement des boutiques en ligne de qualité professionnelle.**

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.15-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-6772E5?style=for-the-badge&logo=stripe)](https://stripe.com/)

## ⚡ Démarrage rapide

```bash
# 1. Cloner et installer
git clone [your-repo] ma-nouvelle-boutique
cd ma-nouvelle-boutique
npm install

# 2. Configurer la base de données
cp .env.example .env
# Ajoutez votre DATABASE_URL Neon PostgreSQL

# 3. Initialiser
npm run db:init

# 4. Lancer en développement
npm run dev
```

## 🎯 Fonctionnalités

### ✅ E-commerce complet
- **Catalogue produits** avec variantes, attributs, médias
- **Panier persistant** avec ajout/suppression temps réel  
- **Commandes** avec gestion statuts et expéditions
- **Authentification** Google, Apple, Email, Password
- **Profil utilisateur** avec historique achats

### ✅ Internationalisé
- **Multilingue** : FR, EN, ES, DE, IT (extensible)
- **Multi-devise** : CAD par défaut (configurable)
- **Traductions** : Produits et catégories

### ✅ Production-ready
- **Base PostgreSQL** avec Neon (serverless)
- **Déploiement Vercel** en 1-clic
- **Auth sécurisée** avec sessions JWT et vérification d'ownership
- **Création automatique** : Comptes créés à la connexion OAuth
- **Performance** : Index optimisés, requêtes efficaces

## 🏗️ Architecture

```
src/
├── app/
│   ├── api/                 # REST endpoints
│   ├── auth/                # Authentification
│   ├── shop/                # Catalogue produits  
│   ├── cart/                # Panier
│   └── profile/             # Compte utilisateur
├── lib/
│   ├── db.ts                # Connexion Prisma
│   ├── config.ts            # Configuration globale
│   ├── prisma/selectors.ts  # Requêtes réutilisables
│   └── [cart|products|...].ts # Services métier
├── components/
│   ├── layout/              # Navbar, Footer
│   ├── ui/                  # Avatar, Toast, etc.
│   └── cart/                # Composants panier
└── contexts/
    └── CartContext.tsx      # État global panier
```

## 🎨 Personnalisation par niche

### 1. Copier le starter
```bash
cp -r ecommerce-starter boutique-mode
cd boutique-mode
```

### 2. Adapter les variables CSS
```css
/* src/styles/themes/ma-niche.css */
:root {
  --brand-primary: #ec4899;    /* Rose mode */
  --brand-secondary: #8b5cf6;  /* Violet luxe */
}
```

### 3. Modifier les textes
```typescript
// Navbar, Footer, pages
siteName = "Ma Boutique Mode"
companyInfo = { name: "Mode & Style Inc." }
```

## 🔧 Variables d'environnement

```env
# Base de données (Neon PostgreSQL)
DATABASE_URL="postgresql://..."

# NextAuth.js
NEXTAUTH_SECRET="secret-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Email (optionnel)
EMAIL_SERVER="smtp://..."
EMAIL_FROM="noreply@boutique.com"
```

## 📡 API Endpoints

Testez avec le fichier [`api-tests.http`](api-tests.http) :

```http
# Produits
GET /api/products?language=FR

# Panier  
POST /api/cart/{userId}
{"variantId": "...", "quantity": 1}

# Commandes
POST /api/orders
{"userId": "...", "shippingAddress": {...}}
```

## 🚀 Déploiement Vercel

1. **Push sur GitHub**
2. **Connecter à Vercel** 
3. **Ajouter variables d'environnement**
4. **Build automatique** ✅

Détails : [`docs/VERCEL_CHECKLIST.md`](docs/VERCEL_CHECKLIST.md)

## 📚 Documentation complète

**📖 [Voir la documentation complète](docs/README.md)**

**🎯 Guides essentiels :**
- **[Quick Start](docs/1-setup/quick-start.md)** - Démarrage en 5 minutes
- **[Configuration](docs/1-setup/env-variables.md)** - Variables d'environnement
- **[API Documentation](docs/3-api/overview.md)** - Endpoints & exemples
- **[Sécurité](docs/4-security/overview.md)** - Protection production
- **[Tests](docs/5-testing/strategy.md)** - Validation automatique
- **[Déploiement Vercel](docs/6-deployment/vercel.md)** - Production ready

## 🎯 Exemples de niches

- **Mode** : Variables rose/violet, navigation Collections/Lookbook
- **Tech** : Variables cyan/violet, navigation PC Gaming/Consoles  
- **Beauté** : Variables rose/lavande, navigation Visage/Corps/Parfums
- **Maison** : Variables vert/orange, navigation Salon/Cuisine/Chambre

## 🔒 Sécurité

**Politique de comptes :**
- Création automatique lors de la première connexion OAuth
- Vérification stricte d'ownership sur toutes les ressources utilisateur
- Journalisation des tentatives d'accès non autorisé
- Pas de purge automatique des comptes non vérifiés (à configurer selon vos besoins)

## 🏷️ Licence

MIT - Utilisez pour tous vos projets commerciaux !

---

**🎯 Un starter → ∞ boutiques personnalisées en quelques heures !**

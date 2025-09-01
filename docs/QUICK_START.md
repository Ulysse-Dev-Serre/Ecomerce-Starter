# 🚀 E-commerce Starter - Guide de démarrage

## ✅ Stack technique

### 🗄️ Backend
- **Database** : PostgreSQL + Prisma ORM
- **API** : Next.js App Router (REST endpoints) 
- **Auth** : NextAuth.js (Google, Apple, Email, Password)
- **Schema** : 15+ modèles e-commerce complets

### 🎨 Frontend  
- **Framework** : Next.js 15 + React 19
- **Styling** : TailwindCSS + variables CSS personnalisables
- **UI** : Composants réutilisables (Navbar, Cart, Avatar)
- **UX** : Single-page auth, toast notifications, loading states

## 🛠️ Commandes disponibles

```bash
# Base de données
npm run db:init         # Initialiser PostgreSQL
npm run db:push         # Synchroniser schema  
npm run db:studio       # Interface visuelle Prisma
npm run db:generate     # Générer client Prisma

# Développement
npm run dev             # Serveur development
npm run build           # Build production
npm run docs            #  documentation

# Documentation
http://localhost:3000/docs      # API 
http://localhost:3000           # Site e-commerce
```

## 📡 Tester l'API

### 1. Créer des données de test
```bash
curl -X POST http://localhost:3000/api/test-data
```

### 2. Tester les endpoints
```bash
# Produits
curl "http://localhost:3000/api/products?language=FR"

# Catégories  
curl "http://localhost:3000/api/categories?language=EN"

# Panier (remplace USER_ID)
curl "http://localhost:3000/api/cart/USER_ID"
```

## 🎨 Personnaliser pour votre niche

### 1. Copier le thème par défaut
```bash
cp src/styles/themes/default.css src/styles/themes/ma-niche.css
```

### 2. Modifier les couleurs dans votre thème
```css
:root {
  /* Mode/Fashion */
  --brand-primary: #ec4899;      /* Rose élégant */
  --brand-secondary: #8b5cf6;    /* Violet luxe */
  
  /* Tech/Gaming */
  --brand-primary: #06b6d4;      /* Cyan tech */
  --brand-secondary: #8b5cf6;    /* Violet gaming */
}
```

### 3. Importer votre thème
```css
/* Dans src/app/globals.css */
@import "../styles/themes/ma-niche.css";
```

## 📂 Structure du projet

```
src/
├── app/
│   ├── api/           # Endpoints REST
│   ├── docs/          #  UI
│   └── globals.css    # Point d'entrée CSS
├── lib/               # Helpers TypeScript
│   ├── db.ts          # Connexion Prisma
│   ├── products.ts    # Gestion produits
│   ├── cart.ts        # Gestion panier
│   └── orders.ts      # Gestion commandes
├── styles/            # Architecture CSS
│   ├── globals.css    # Base (ne pas modifier)
│   ├── .css    #  (isolé)
│   ├── themes/        # Thèmes personnalisables
│   └── components/    # Styles e-commerce
└── generated/         # Code généré Prisma
```

## 🌍 Support multilingue

L'API supporte 5 langues par défaut :
- **EN** (English) - défaut
- **FR** (Français)  
- **ES** (Español)
- **DE** (Deutsch)
- **IT** (Italiano)

Ajoutez `?language=FR` à vos requêtes API !

## 💰 Multi-devise

Devise par défaut : **CAD** (Dollar canadien)
Chaque produit peut avoir sa propre devise.

## 🔄 Workflow de développement

1. **Modifier le schema** → `npm run db:push`
2. **Tester l'API** →  `/docs`
3. **Personnaliser le style** → Modifier theme CSS
4. **Développer le frontend** → Utiliser les helpers lib/

---

**🎯 Objectif :** Starter e-commerce 100% réutilisable pour toutes vos niches !

# Structure des Dossiers

## Vue d'Ensemble

```
src/
├── app/                     # App Router (Next.js 13+)
│   ├── (auth)/             # Groupe de routes authentification
│   ├── api/                # API Routes
│   ├── checkout/           # Pages de paiement
│   └── globals.css         # Styles globaux
├── components/             # Composants réutilisables
│   ├── ui/                 # Composants UI de base
│   ├── checkout/           # Composants paiement
│   └── layout/             # Composants de mise en page
├── lib/                    # Utilitaires et configurations
├── styles/                 # Styles CSS organisés
└── types/                  # Types TypeScript
```

## Détails par Dossier

### `/app` - Pages et Routes
```
app/
├── (auth)/                 # Routes d'authentification groupées
│   ├── signin/
│   └── signup/
├── api/                    # Endpoints API
│   ├── auth/
│   ├── cart/
│   ├── products/
│   └── webhooks/
├── checkout/               # Tunnel de paiement
├── shop/                   # Pages boutique
├── layout.tsx              # Layout racine
├── page.tsx                # Page d'accueil
└── globals.css             # Point d'entrée CSS
```

### `/components` - Composants
```
components/
├── ui/                     # Composants UI réutilisables
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Avatar.tsx
│   └── Modal.tsx
├── layout/                 # Composants de structure
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Navbar.tsx
├── checkout/               # Spécifiques au paiement
└── products/               # Spécifiques aux produits
```

### `/lib` - Logique Métier
```
lib/
├── auth.ts                 # Configuration NextAuth
├── db.ts                   # Client Prisma
├── stripe.ts               # Client Stripe
├── validations.ts          # Schémas de validation
└── utils.ts                # Fonctions utilitaires
```

### `/styles` - Styles CSS
```
styles/
├── globals.css             # Base e-commerce
├── themes/                 # Thèmes par niche
│   ├── default.css
│   ├── fashion.css
│   └── tech.css
└── components/             # Styles par composant
    ├── product.css
    ├── cart.css
    └── checkout.css
```

## Conventions de Nommage

### Fichiers
- **Pages** : `page.tsx`
- **Layouts** : `layout.tsx`
- **Composants** : `PascalCase.tsx`
- **Utilitaires** : `camelCase.ts`
- **Types** : `types.ts` ou `*.types.ts`

### Dossiers
- **Routes** : `kebab-case`
- **Groupes** : `(parentheses)`
- **Composants** : `camelCase`

## Organisation par Fonctionnalité

### Principe
Grouper par domaine métier plutôt que par type technique :

```
components/
├── checkout/               # Tout le paiement ensemble
├── products/               # Tout les produits ensemble
└── auth/                   # Toute l'authentification ensemble
```

### Avantages
- Cohésion forte dans chaque dossier
- Facilité de maintenance
- Réutilisation claire
- Navigation intuitive

## Import et Exports

### Chemins absolus
```typescript
// Utiliser des chemins absolus
import { Button } from '@/components/ui/Button'
import { db } from '@/lib/db'

// Éviter les chemins relatifs
import { Button } from '../../../components/ui/Button'
```

### Barrel exports
```typescript
// components/ui/index.ts
export { Button } from './Button'
export { Input } from './Input'
export { Avatar } from './Avatar'

// Usage
import { Button, Input } from '@/components/ui'
```

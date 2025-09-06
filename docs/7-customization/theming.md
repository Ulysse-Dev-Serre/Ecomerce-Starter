# Personnalisation et Thèmes

## Architecture CSS

### Structure des Fichiers
```
src/
├── app/
│   └── globals.css              # Point d'entrée principal
└── styles/
    ├── globals.css              # Base e-commerce (ne pas modifier)
    ├── themes/
    │   ├── default.css          # Thème par défaut (personnalisable)
    │   ├── fashion.css          # Exemple : niche mode
    │   └── tech.css             # Exemple : niche tech
    └── components/
        ├── product.css          # Styles produits
        ├── cart.css             # Styles panier
        ├── checkout.css         # Styles checkout
        └── layout.css           # Styles layout
```

## Personnalisation par Niche

### 1. Créer un Nouveau Thème
```bash
# Copier le thème par défaut
cp src/styles/themes/default.css src/styles/themes/ma-niche.css
```

### 2. Modifier les Variables CSS
```css
/* src/styles/themes/ma-niche.css */
:root {
  /* Couleurs principales */
  --brand-primary: #ec4899;      /* Rose élégant */
  --brand-secondary: #8b5cf6;    /* Violet luxe */
  --brand-accent: #f59e0b;       /* Or accent */
  
  /* E-commerce spécialisées */
  --price-color: #1f2937;        /* Prix */
  --sale-color: #ef4444;         /* Promotions */
  --new-product-color: #10b981;  /* Badge nouveau */
  --out-of-stock-color: #6b7280; /* Produits épuisés */
}
```

### 3. Importer le Thème
```css
/* Dans src/app/globals.css */
@import "../styles/themes/ma-niche.css";
```

## Variables Disponibles

### Couleurs Principales
```css
:root {
  /* Identité visuelle */
  --brand-primary: #0570de;      /* Couleur principale (boutons, liens) */
  --brand-secondary: #8b5cf6;    /* Couleur secondaire (accents) */
  --brand-accent: #f59e0b;       /* Couleur d'accent (promotions) */
  
  /* États et feedbacks */
  --success-color: #10b981;      /* Succès, validation */
  --error-color: #ef4444;        /* Erreurs, alertes */
  --warning-color: #f59e0b;      /* Avertissements */
  --info-color: #3b82f6;         /* Informations */
}
```

### E-commerce Spécialisé
```css
:root {
  /* Prix et promotions */
  --price-color: #1f2937;        /* Prix standard */
  --price-discount: #ef4444;     /* Prix barré */
  --sale-color: #dc2626;         /* Promotions, soldes */
  --savings-color: #059669;      /* Économies réalisées */
  
  /* Badges produits */
  --new-product-color: #10b981;  /* Badge "nouveau" */
  --bestseller-color: #f59e0b;   /* Badge "best-seller" */
  --limited-color: #8b5cf6;      /* Badge "édition limitée" */
  --out-of-stock-color: #6b7280; /* Produits épuisés */
}
```

### Layout et Espacement
```css
:root {
  /* Conteneurs */
  --container-max-width: 1200px; /* Largeur max contenu */
  --container-padding: 1rem;     /* Padding conteneurs */
  
  /* Grilles produits */
  --product-grid-gap: 1.5rem;    /* Espacement grille */
  --product-card-radius: 0.5rem; /* Arrondi cartes */
  
  /* Layout spécialisé */
  --header-height: 4rem;         /* Hauteur header */
  --cart-sidebar-width: 400px;   /* Largeur panier latéral */
  --footer-height: 200px;        /* Hauteur footer */
}
```

## Exemples de Thèmes

### Mode/Fashion
```css
:root {
  --brand-primary: #ec4899;      /* Rose fashion */
  --brand-secondary: #8b5cf6;    /* Violet luxe */
  --brand-accent: #f59e0b;       /* Or élégant */
  
  --price-color: #1f2937;        /* Prix sobre */
  --sale-color: #ef4444;         /* Soldes rouge */
  --new-product-color: #ec4899;  /* Nouveau en rose */
  
  /* Typographie élégante */
  --font-primary: 'Playfair Display', serif;
  --font-secondary: 'Inter', sans-serif;
}
```

### Tech/Gaming
```css
:root {
  --brand-primary: #06b6d4;      /* Cyan tech */
  --brand-secondary: #8b5cf6;    /* Violet gaming */
  --brand-accent: #10b981;       /* Vert tech */
  
  --price-color: #06b6d4;        /* Prix en bleu tech */
  --sale-color: #f59e0b;         /* Promo en orange */
  --new-product-color: #10b981;  /* Nouveau en vert */
  
  /* Typographie moderne */
  --font-primary: 'JetBrains Mono', monospace;
  --font-secondary: 'Inter', sans-serif;
}
```

### Beauté/Cosmétiques
```css
:root {
  --brand-primary: #f472b6;      /* Rose beauté */
  --brand-secondary: #c084fc;    /* Violet doux */
  --brand-accent: #fbbf24;       /* Doré glamour */
  
  --price-color: #be185d;        /* Prix en rose foncé */
  --sale-color: #dc2626;         /* Soldes rouge */
  --new-product-color: #f472b6;  /* Nouveau en rose */
  
  /* Typographie raffinée */
  --font-primary: 'Cormorant Garamond', serif;
  --font-secondary: 'Inter', sans-serif;
}
```

## Classes Utilitaires

### Boutons E-commerce
```css
.btn-add-to-cart {
  @apply bg-brand-primary text-white px-6 py-3 rounded-lg font-semibold;
  @apply hover:bg-brand-primary/90 transition-colors;
  @apply focus:outline-none focus:ring-2 focus:ring-brand-primary/50;
}

.btn-buy-now {
  @apply bg-brand-accent text-white px-6 py-3 rounded-lg font-semibold;
  @apply hover:bg-brand-accent/90 transition-colors;
}

.btn-wishlist {
  @apply border-2 border-brand-primary text-brand-primary px-4 py-2 rounded-lg;
  @apply hover:bg-brand-primary hover:text-white transition-colors;
}
```

### Cartes Produits
```css
.product-card {
  @apply bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow;
  @apply border border-gray-200 overflow-hidden;
}

.product-grid {
  @apply grid gap-6;
  @apply grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4;
}

.price {
  @apply text-xl font-bold;
  color: var(--price-color);
}

.price-discount {
  @apply line-through text-sm;
  color: var(--price-discount);
}
```

### Badges de Statut
```css
.badge-new {
  @apply px-2 py-1 text-xs font-semibold rounded-full text-white;
  background-color: var(--new-product-color);
}

.badge-sale {
  @apply px-2 py-1 text-xs font-semibold rounded-full text-white;
  background-color: var(--sale-color);
}

.badge-bestseller {
  @apply px-2 py-1 text-xs font-semibold rounded-full text-white;
  background-color: var(--bestseller-color);
}

.badge-out-of-stock {
  @apply px-2 py-1 text-xs font-semibold rounded-full text-white;
  background-color: var(--out-of-stock-color);
}
```

## Responsive Design

### Mobile-First Approach
```css
/* Mobile par défaut */
.container {
  @apply px-4 mx-auto;
  max-width: var(--container-max-width);
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    @apply px-6;
  }
  
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    @apply px-8;
  }
  
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### Breakpoints Tailwind
```css
/* Breakpoints standards */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large */
2xl: 1536px /* 2X Extra large */
```

## Dark Mode Support

### Configuration
```css
/* Variables pour dark mode */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
}

[data-theme="dark"] {
  --bg-primary: #1f2937;
  --bg-secondary: #111827;
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
}
```

### Toggle Dark Mode
```typescript
// hooks/use-theme.ts
export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
  
  return { theme, setTheme }
}
```

## Animations et Transitions

### Transitions Fluides
```css
.transition-smooth {
  @apply transition-all duration-300 ease-in-out;
}

.hover-lift {
  @apply transform transition-transform duration-200;
}

.hover-lift:hover {
  @apply -translate-y-1 shadow-lg;
}

.fade-in {
  @apply opacity-0 animate-fade-in;
}

@keyframes fade-in {
  to {
    opacity: 1;
  }
}
```

### Micro-Interactions
```css
.button-press {
  @apply active:scale-95 transition-transform;
}

.card-hover {
  @apply hover:scale-105 transition-transform duration-200;
}

.pulse-notification {
  @apply animate-pulse bg-brand-accent;
}
```

## Composants Personnalisables

### Product Card
```typescript
interface ProductCardProps {
  product: Product
  variant?: 'default' | 'compact' | 'featured'
  showBadges?: boolean
  className?: string
}

export function ProductCard({ 
  product, 
  variant = 'default',
  showBadges = true,
  className 
}: ProductCardProps) {
  const cardClasses = cn(
    'product-card',
    {
      'product-card--compact': variant === 'compact',
      'product-card--featured': variant === 'featured',
    },
    className
  )
  
  return (
    <div className={cardClasses}>
      {/* Contenu */}
    </div>
  )
}
```

## Bonnes Pratiques

### Do's ✅
1. **Toujours utiliser les variables CSS** au lieu de valeurs fixes
2. **Créer un nouveau fichier thème** plutôt que modifier l'existant
3. **Tester la responsivité** sur différents écrans
4. **Maintenir la cohérence** entre les couleurs
5. **Utiliser les classes utilitaires** existantes

### Don'ts ❌
1. **Ne jamais modifier** `globals.css` et `.css` de base
2. **Éviter les !important** sauf cas extrêmes
3. **Ne pas casser l'accessibilité** (contraste, focus)
4. **Éviter les animations trop agressives**
5. **Ne pas oublier le dark mode**

## Tests et Validation

### Visual Testing
```bash
# Tester différents thèmes
npm run dev
# Changer thème dans globals.css et recharger
```

### Accessibilité
- Vérifier contraste couleurs (minimum 4.5:1)
- Tester navigation clavier
- Valider avec screen readers
- Utiliser outils comme axe-core

### Performance
- Optimiser taille CSS bundle
- Lazy loading pour thèmes optionnels
- Préférer CSS custom properties à JavaScript
- Minimiser repaints/reflows

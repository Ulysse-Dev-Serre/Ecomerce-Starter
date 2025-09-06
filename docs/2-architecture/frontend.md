# Architecture Frontend

## Vue d'Ensemble

Interface utilisateur moderne basée sur **Next.js 14** avec App Router et **React Server Components**.

## Stack Technique

### Core
- **Next.js 14** : Framework React avec App Router
- **React 18** : UI library avec Server Components
- **TypeScript** : Typage statique
- **Tailwind CSS** : Utility-first CSS

### State Management
- **Server Components** : État côté serveur par défaut
- **useState/useEffect** : État local côté client
- **Context API** : État partagé léger
- **URL State** : Navigation et filtres

## Structure des Composants

### Hiérarchie
```
components/
├── ui/                     # Composants de base réutilisables
│   ├── Button.tsx         # Boutons avec variants
│   ├── Input.tsx          # Champs de saisie
│   ├── Avatar.tsx         # Avatar intelligent
│   └── Modal.tsx          # Modales
├── layout/                # Structure de page
│   ├── Header.tsx         # En-tête avec navigation
│   ├── Footer.tsx         # Pied de page
│   └── Navbar.tsx         # Barre de navigation
├── products/              # Composants produits
│   ├── ProductCard.tsx    # Carte produit
│   ├── ProductGrid.tsx    # Grille de produits
│   └── ProductDetails.tsx # Détails produit
├── checkout/              # Tunnel de paiement
│   ├── CheckoutForm.tsx   # Formulaire Stripe
│   └── OrderSummary.tsx   # Récapitulatif
└── auth/                  # Authentification
    ├── SignInForm.tsx     # Connexion
    └── SignUpForm.tsx     # Inscription
```

## Pages et Routing

### App Router Structure
```
app/
├── (auth)/                # Groupe routes auth
│   ├── signin/page.tsx
│   └── signup/page.tsx
├── shop/                  # Boutique
│   ├── page.tsx           # Liste produits
│   └── [slug]/page.tsx    # Détail produit
├── cart/page.tsx          # Panier
├── checkout/              # Paiement
│   ├── page.tsx
│   └── success/page.tsx
├── profile/page.tsx       # Profil utilisateur
├── layout.tsx             # Layout racine
└── page.tsx               # Accueil
```

### Navigation
- Navigation programmatique avec `useRouter`
- Liens optimisés avec `next/link`
- Prefetching automatique
- États de navigation (loading, error)

## État et Data Fetching

### Server Components (par défaut)
```typescript
// Fetch côté serveur
export default async function ProductsPage() {
  const products = await getProducts()
  return <ProductGrid products={products} />
}
```

### Client Components (quand nécessaire)
```typescript
'use client'

// État local pour interactivité
export function AddToCartButton({ productId }: Props) {
  const [loading, setLoading] = useState(false)
  
  async function handleAddToCart() {
    setLoading(true)
    await addToCart(productId)
    setLoading(false)
  }
  
  return (
    <Button onClick={handleAddToCart} disabled={loading}>
      {loading ? 'Ajout...' : 'Ajouter au panier'}
    </Button>
  )
}
```

### Context pour État Global
```typescript
// Panier context pour compteur global
const CartContext = createContext<CartContextType>()

export function CartProvider({ children }) {
  const [itemCount, setItemCount] = useState(0)
  // ...
  return (
    <CartContext.Provider value={{ itemCount, setItemCount }}>
      {children}
    </CartContext.Provider>
  )
}
```

## Styling Architecture

### Tailwind CSS
- Utility-first approach
- Design system cohérent
- Responsive par défaut
- Dark mode supporté

### CSS Modules (spécifique)
```css
/* styles/components/product.module.css */
.card {
  @apply bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow;
}

.badge {
  @apply px-2 py-1 text-xs font-semibold rounded-full;
}
```

### Variables CSS (thèmes)
```css
:root {
  --brand-primary: #0570de;
  --brand-secondary: #8b5cf6;
  --brand-accent: #f59e0b;
  --price-color: #1f2937;
  --sale-color: #ef4444;
}
```

## Patterns et Bonnes Pratiques

### Composition over Configuration
```typescript
// Composable et réutilisable
<Button variant="primary" size="lg" disabled={loading}>
  <Icon name="cart" />
  Ajouter au panier
</Button>
```

### Error Boundaries
```typescript
// Gestion d'erreurs UI
export function ErrorBoundary({ children }) {
  return (
    <Suspense fallback={<Loading />}>
      <ErrorBoundaryInner>
        {children}
      </ErrorBoundaryInner>
    </Suspense>
  )
}
```

### Loading States
```typescript
// États de chargement visuels
{loading && <Skeleton className="h-4 w-32" />}
{error && <ErrorMessage error={error} />}
{data && <ProductList products={data} />}
```

## Performance

### Optimisations Next.js
- **Code splitting** automatique
- **Image optimization** avec `next/image`
- **Font optimization** avec `next/font`
- **Bundle analysis** avec `@next/bundle-analyzer`

### Client-Side
- **Lazy loading** pour composants lourds
- **Debouncing** pour recherche
- **Memoization** avec `useMemo`/`useCallback`
- **Virtual scrolling** pour grandes listes

### Metrics
- Core Web Vitals optimisés
- Time to Interactive < 3s
- Cumulative Layout Shift < 0.1
- First Contentful Paint < 2s

## Accessibilité

### Standards WCAG
- **Semantic HTML** par défaut
- **Keyboard navigation** supportée
- **Screen readers** compatibles
- **Color contrast** respecté

### Implémentation
```typescript
// Boutons accessibles
<button
  aria-label="Ajouter iPhone au panier"
  aria-describedby="product-price"
  disabled={!inStock}
>
  Ajouter au panier
</button>
```

## Responsive Design

### Mobile-First
- Breakpoints Tailwind standards
- Touch-friendly interfaces
- Optimisé pour mobiles e-commerce

### Viewports
- Mobile : 375px - 768px
- Tablet : 768px - 1024px  
- Desktop : 1024px+

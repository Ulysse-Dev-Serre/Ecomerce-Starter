# Exemples de Personnalisation

## Boutique Mode/Fashion

### Configuration Thème
```css
/* styles/themes/fashion.css */
:root {
  /* Palette élégante */
  --brand-primary: #ec4899;      /* Rose signature */
  --brand-secondary: #8b5cf6;    /* Violet luxe */
  --brand-accent: #f59e0b;       /* Or accent */
  
  /* E-commerce fashion */
  --price-color: #1f2937;        /* Prix classique */
  --sale-color: #ef4444;         /* Soldes rouge */
  --new-collection-color: #ec4899; /* Nouvelle collection */
  
  /* Typographie raffinée */
  --font-heading: 'Playfair Display', serif;
  --font-body: 'Inter', sans-serif;
  --font-price: 'Crimson Text', serif;
}
```

### Composants Spécialisés
```typescript
// components/fashion/CollectionCard.tsx
export function CollectionCard({ collection }: Props) {
  return (
    <div className="group relative overflow-hidden rounded-lg">
      <Image
        src={collection.image}
        alt={collection.name}
        className="group-hover:scale-110 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-4 left-4 text-white">
        <h3 className="font-playfair text-2xl font-bold">
          {collection.name}
        </h3>
        <p className="text-sm opacity-90">
          {collection.itemCount} pièces
        </p>
      </div>
    </div>
  )
}
```

### Pages Personnalisées
```typescript
// app/collections/page.tsx
export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-rose-50">
      <Hero 
        title="Nouvelles Collections"
        subtitle="Découvrez les dernières tendances"
        backgroundImage="/fashion-hero.jpg"
      />
      
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map(collection => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
```

## Boutique Tech/Gaming

### Configuration Thème
```css
/* styles/themes/tech.css */
:root {
  /* Palette cyber */
  --brand-primary: #06b6d4;      /* Cyan tech */
  --brand-secondary: #8b5cf6;    /* Violet gaming */
  --brand-accent: #10b981;       /* Vert terminal */
  
  /* Tech spécialisé */
  --price-color: #06b6d4;        /* Prix en cyan */
  --sale-color: #f59e0b;         /* Promo orange */
  --specs-color: #6b7280;        /* Spécifications */
  --performance-color: #10b981;  /* Indicateurs perf */
  
  /* Typographie moderne */
  --font-heading: 'JetBrains Mono', monospace;
  --font-body: 'Inter', sans-serif;
  --font-code: 'Fira Code', monospace;
  
  /* Effets tech */
  --glow-cyan: 0 0 20px rgba(6, 182, 212, 0.3);
  --glow-violet: 0 0 20px rgba(139, 92, 246, 0.3);
}
```

### Composants Gaming
```typescript
// components/tech/ProductSpecs.tsx
export function ProductSpecs({ specs }: Props) {
  return (
    <div className="bg-gray-900 rounded-lg p-6 font-mono text-green-400">
      <h3 className="text-cyan-400 text-lg mb-4">// SPECIFICATIONS</h3>
      <div className="space-y-2">
        {Object.entries(specs).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="text-gray-400">{key}:</span>
            <span className="text-green-400 font-semibold">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// components/tech/PerformanceBar.tsx
export function PerformanceBar({ label, score }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="text-cyan-400 font-mono">{score}/100</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-400"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}
```

### Page Produit Tech
```typescript
// app/products/[slug]/page.tsx (Tech version)
export default function TechProductPage({ params }: Props) {
  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <div className="container py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images produit avec effet glow */}
          <div className="space-y-4">
            <div className="relative">
              <Image 
                src={product.image}
                alt={product.name}
                className="rounded-lg shadow-2xl"
                style={{ boxShadow: 'var(--glow-cyan)' }}
              />
              <div className="absolute top-4 right-4">
                <Badge variant="tech" className="bg-green-500">
                  IN STOCK
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Détails produit */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-mono font-bold text-cyan-400">
                {product.name}
              </h1>
              <p className="text-gray-400 mt-2">
                SKU: <span className="text-green-400">{product.sku}</span>
              </p>
            </div>
            
            <ProductSpecs specs={product.specifications} />
            
            <div className="space-y-4">
              <h3 className="text-xl text-cyan-400">Performance Scores</h3>
              <PerformanceBar label="Gaming Performance" score={95} />
              <PerformanceBar label="Productivity" score={88} />
              <PerformanceBar label="Value for Money" score={92} />
            </div>
            
            <div className="pt-6">
              <div className="text-3xl font-bold text-green-400 mb-4">
                ${product.price} CAD
              </div>
              <Button 
                size="lg" 
                className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600"
              >
                ADD TO CART
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## Boutique Beauté/Cosmétiques

### Configuration Thème
```css
/* styles/themes/beauty.css */
:root {
  /* Palette beauté */
  --brand-primary: #f472b6;      /* Rose beauté */
  --brand-secondary: #c084fc;    /* Violet doux */
  --brand-accent: #fbbf24;       /* Doré glamour */
  
  /* Beauté spécialisé */
  --price-color: #be185d;        /* Prix rose foncé */
  --sale-color: #dc2626;         /* Soldes rouge */
  --new-arrival-color: #f472b6;  /* Nouveautés */
  --skin-tone-1: #fef7ed;        /* Teinte claire */
  --skin-tone-2: #fed7aa;        /* Teinte medium */
  --skin-tone-3: #fdba74;        /* Teinte foncée */
  
  /* Typographie élégante */
  --font-heading: 'Cormorant Garamond', serif;
  --font-body: 'Inter', sans-serif;
  --font-script: 'Dancing Script', cursive;
  
  /* Dégradés beauté */
  --gradient-rose: linear-gradient(135deg, #f472b6, #c084fc);
  --gradient-gold: linear-gradient(135deg, #fbbf24, #f59e0b);
}
```

### Composants Beauté
```typescript
// components/beauty/ColorPalette.tsx
export function ColorPalette({ colors, selectedColor, onColorChange }: Props) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">Shade</h4>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color.id}
            onClick={() => onColorChange(color)}
            className={cn(
              "w-8 h-8 rounded-full border-2 transition-all",
              selectedColor?.id === color.id 
                ? "border-pink-500 scale-110" 
                : "border-gray-200 hover:border-pink-300"
            )}
            style={{ backgroundColor: color.hex }}
            title={color.name}
          >
            <span className="sr-only">{color.name}</span>
          </button>
        ))}
      </div>
      {selectedColor && (
        <p className="text-sm text-gray-600 font-script">
          {selectedColor.name}
        </p>
      )}
    </div>
  )
}

// components/beauty/IngredientsList.tsx
export function IngredientsList({ ingredients }: Props) {
  return (
    <div className="bg-rose-50 rounded-lg p-4">
      <h4 className="font-cormorant text-lg font-bold text-pink-800 mb-3">
        Key Ingredients
      </h4>
      <div className="space-y-2">
        {ingredients.map((ingredient, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0" />
            <div>
              <span className="font-medium text-pink-800">
                {ingredient.name}
              </span>
              <p className="text-sm text-pink-600">
                {ingredient.benefit}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Filtres Spécialisés
```typescript
// components/beauty/BeautyFilters.tsx
export function BeautyFilters({ onFiltersChange }: Props) {
  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div>
        <h3 className="font-cormorant text-xl font-bold mb-4">
          Find Your Perfect Match
        </h3>
      </div>
      
      {/* Filtre par type de peau */}
      <FilterSection title="Skin Type">
        <div className="grid grid-cols-2 gap-2">
          {['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'].map(type => (
            <FilterButton key={type} value={type}>
              {type}
            </FilterButton>
          ))}
        </div>
      </FilterSection>
      
      {/* Filtre par teinte */}
      <FilterSection title="Skin Tone">
        <div className="flex gap-2">
          {skinTones.map(tone => (
            <button
              key={tone.id}
              className="w-6 h-6 rounded-full border border-gray-300"
              style={{ backgroundColor: tone.hex }}
              title={tone.name}
            />
          ))}
        </div>
      </FilterSection>
      
      {/* Filtre par préoccupations */}
      <FilterSection title="Skin Concerns">
        <div className="space-y-2">
          {['Anti-aging', 'Acne', 'Dark spots', 'Hydration', 'Sensitivity'].map(concern => (
            <label key={concern} className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-pink-300 text-pink-500" />
              <span className="text-sm">{concern}</span>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  )
}
```

## Marketplace Multi-Vendeurs

### Structure Étendue
```typescript
// types/marketplace.ts
interface Vendor {
  id: string
  name: string
  description: string
  logo: string
  rating: number
  totalSales: number
  verified: boolean
  categories: Category[]
}

interface Product extends BaseProduct {
  vendor: Vendor
  vendorId: string
}
```

### Composants Marketplace
```typescript
// components/marketplace/VendorCard.tsx
export function VendorCard({ vendor }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-4 mb-4">
        <Image
          src={vendor.logo}
          alt={vendor.name}
          width={60}
          height={60}
          className="rounded-full"
        />
        <div>
          <h3 className="font-semibold text-lg">{vendor.name}</h3>
          <div className="flex items-center gap-2">
            <StarRating rating={vendor.rating} size="sm" />
            <span className="text-sm text-gray-600">
              ({vendor.totalSales} ventes)
            </span>
            {vendor.verified && (
              <Badge variant="success" size="sm">
                Vérifié
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-4">
        {vendor.description}
      </p>
      
      <div className="flex flex-wrap gap-2">
        {vendor.categories.slice(0, 3).map(category => (
          <Badge key={category.id} variant="outline" size="sm">
            {category.name}
          </Badge>
        ))}
      </div>
    </div>
  )
}

// components/marketplace/VendorSelector.tsx
export function VendorSelector({ productId, vendors, onVendorSelect }: Props) {
  return (
    <div className="space-y-3">
      <h4 className="font-medium">Vendu par:</h4>
      <div className="space-y-2">
        {vendors.map(vendor => (
          <div 
            key={vendor.id} 
            className="border rounded-lg p-3 cursor-pointer hover:border-blue-300"
            onClick={() => onVendorSelect(vendor)}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-medium">{vendor.name}</span>
                {vendor.verified && (
                  <BadgeCheck className="w-4 h-4 text-green-500" />
                )}
              </div>
              <div className="text-right">
                <div className="font-bold">{vendor.price} CAD</div>
                <div className="text-xs text-gray-500">
                  + {vendor.shipping} shipping
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span>⭐ {vendor.rating}</span>
              <span>📦 {vendor.shippingTime}</span>
              <span>🏪 {vendor.stockCount} en stock</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Abonnements et Recurring

### Configuration Produits Abonnement
```typescript
// types/subscription.ts
interface SubscriptionPlan {
  id: string
  name: string
  interval: 'monthly' | 'quarterly' | 'yearly'
  intervalCount: number
  price: number
  discountPercentage?: number
  features: string[]
}

interface SubscriptionProduct extends Product {
  subscriptionPlans: SubscriptionPlan[]
  isSubscriptionOnly: boolean
  trialDays?: number
}
```

### Composants Abonnement
```typescript
// components/subscription/PlanSelector.tsx
export function PlanSelector({ plans, selectedPlan, onPlanChange }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Choose your plan</h3>
      <div className="grid gap-3">
        {plans.map(plan => (
          <div
            key={plan.id}
            className={cn(
              "border rounded-lg p-4 cursor-pointer transition-colors",
              selectedPlan?.id === plan.id 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-200 hover:border-gray-300"
            )}
            onClick={() => onPlanChange(plan)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">{plan.name}</h4>
                <p className="text-sm text-gray-600">
                  Delivered every {plan.intervalCount} {plan.interval}
                </p>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">
                  ${plan.price} CAD
                </div>
                {plan.discountPercentage && (
                  <div className="text-sm text-green-600">
                    Save {plan.discountPercentage}%
                  </div>
                )}
              </div>
            </div>
            
            {plan.features.length > 0 && (
              <ul className="mt-3 space-y-1">
                {plan.features.map((feature, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                    <Check className="w-3 h-3 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

Ces exemples montrent comment adapter l'e-commerce starter à différents secteurs en personnalisant les thèmes, composants et fonctionnalités spécialisées.

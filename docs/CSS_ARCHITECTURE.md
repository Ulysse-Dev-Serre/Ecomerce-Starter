# 🎨 Architecture CSS E-commerce Starter

## 📁 Structure des fichiers

```
src/
├── app/
│   └── globals.css              # Point d'entrée principal
└── styles/
    ├── globals.css              # Base e-commerce (ne pas modifier)
    ├── .css              #  isolé (ne pas modifier)
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

## 🎯 Personnalisation par niche

### 1. Créer un nouveau thème
```bash
# Copier le thème par défaut
cp src/styles/themes/default.css src/styles/themes/ma-niche.css
```

### 2. Modifier les variables dans votre thème
```css
:root {
  /* Mode/Fashion */
  --brand-primary: #ec4899;      /* Rose élégant */
  --brand-secondary: #8b5cf6;    /* Violet luxe */
  --brand-accent: #f59e0b;       /* Or accent */
  
  /* Tech/Gaming */
  --brand-primary: #06b6d4;      /* Cyan tech */
  --brand-secondary: #8b5cf6;    /* Violet gaming */
  --brand-accent: #10b981;       /* Vert success */
}
```

### 3. Importer votre thème
```css
/* Dans src/app/globals.css */
@import "../styles/themes/ma-niche.css";
```

## 🔧 Variables disponibles

### Couleurs principales
- `--brand-primary` : Couleur principale (boutons, liens)
- `--brand-secondary` : Couleur secondaire (accents)
- `--brand-accent` : Couleur d'accent (promotions)

### Couleurs e-commerce spécialisées
- `--price-color` : Couleur des prix
- `--sale-color` : Couleur des promotions
- `--new-product-color` : Badge "nouveau"
- `--out-of-stock-color` : Produits épuisés

### Layout
- `--container-max-width` : Largeur max du contenu
- `--product-grid-gap` : Espacement grille produits
- `--cart-sidebar-width` : Largeur panier latéral

## 🎨 Classes utilitaires

### Boutons e-commerce
- `.btn-add-to-cart` : Bouton ajouter au panier
- `.btn-buy-now` : Bouton achat immédiat
- `.btn-wishlist` : Bouton liste de souhaits

### Cartes produits
- `.product-card` : Carte produit de base
- `.product-grid` : Grille responsive
- `.price` : Affichage prix

### Badges de statut
- `.badge-new` : Nouveau produit
- `.badge-sale` : En promotion
- `.badge-out-of-stock` : Stock épuisé

## 🚀 Exemples de niches

### Mode/Fashion
```css
:root {
  --brand-primary: #ec4899;
  --brand-secondary: #8b5cf6;
  --brand-accent: #f59e0b;
  --price-color: #1f2937;
  --sale-color: #ef4444;
}
```

### Tech/Gaming
```css
:root {
  --brand-primary: #06b6d4;
  --brand-secondary: #8b5cf6;
  --brand-accent: #10b981;
  --price-color: #06b6d4;
  --sale-color: #f59e0b;
}
```

### Beauté/Cosmétiques
```css
:root {
  --brand-primary: #f472b6;
  --brand-secondary: #c084fc;
  --brand-accent: #fbbf24;
  --price-color: #be185d;
  --sale-color: #dc2626;
}
```

## 🛡️ Bonnes pratiques

1. **Ne jamais modifier** `globals.css` et `.css`
2. **Toujours créer** un nouveau fichier thème
3. **Utiliser les variables CSS** au lieu de valeurs fixes
4. **Tester la responsivité** sur mobile
5. **Garder la cohérence** entre les couleurs

## 📱 Responsive

Le système est **mobile-first** avec des breakpoints automatiques :
- **Desktop** : > 768px
- **Mobile** : ≤ 768px

Les variables CSS s'adaptent automatiquement !

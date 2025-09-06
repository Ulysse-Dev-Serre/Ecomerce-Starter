# Exemples de Personnalisation

## 🛍️ Boutique Mode/Fashion

### Setup rapide
```bash
# 1. Couleurs dans tailwind.config.js
colors: {
  brand: {
    primary: '#ec4899',    # Rose signature
    secondary: '#8b5cf6',  # Violet luxe
    accent: '#f59e0b'      # Or accent
  }
}

# 2. Polices personnalisées
fonts: {
  heading: ['Playfair Display', 'serif'],
  body: ['Inter', 'sans-serif'],
  price: ['Crimson Text', 'serif']
}
```

### Composants clés
- **CollectionCard** - Cartes collections avec hover effects
- **ProductGrid** - Grille responsive avec filtres
- **LookbookGallery** - Galerie style magazine
- **TrendingSection** - Section tendances

### Configuration spécifique
```bash
# src/lib/config.ts
export const FASHION_CONFIG = {
  categories: ['Femme', 'Homme', 'Enfant', 'Accessoires'],
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  colors: ['Noir', 'Blanc', 'Rouge', 'Bleu', 'Rose'],
  filters: ['Prix', 'Taille', 'Couleur', 'Marque', 'Collection']
}
```

## 📱 Boutique Électronique/Tech

### Setup rapide
```bash
# 1. Couleurs tech
colors: {
  brand: {
    primary: '#3b82f6',    # Bleu tech
    secondary: '#1e40af',  # Bleu foncé
    accent: '#10b981'      # Vert success
  }
}

# 2. Composants tech
- SpecsTable (tableau caractéristiques)
- ComparisonTool (comparateur produits)
- TechBadges (badges tech/certifications)
- ReviewStars (notation produits)
```

### Configuration spécifique
```bash
# src/lib/config.ts
export const TECH_CONFIG = {
  categories: ['Smartphones', 'PC', 'Audio', 'Gaming'],
  specs: ['CPU', 'RAM', 'Storage', 'Display', 'Battery'],
  warranties: ['1 an', '2 ans', '3 ans'],
  filters: ['Marque', 'Prix', 'Écran', 'Stockage', 'Note']
}
```

## 🏠 Boutique Maison/Déco

### Setup rapide
```bash
# 1. Couleurs naturelles
colors: {
  brand: {
    primary: '#059669',    # Vert nature
    secondary: '#dc2626',  # Rouge terracotta
    accent: '#d97706'      # Orange chaleureux
  }
}

# 2. Composants déco
- RoomViewer (visualiseur pièce)
- ColorPalette (palette couleurs)
- MaterialSamples (échantillons matériaux)
- StyleGuide (guide de style)
```

## 🎮 Boutique Gaming

### Setup rapide
```bash
# 1. Couleurs gaming
colors: {
  brand: {
    primary: '#8b5cf6',    # Violet gaming
    secondary: '#ef4444',  # Rouge gaming
    accent: '#10b981'      # Vert néon
  }
}

# 2. Effets spéciaux
- GlowEffects (effets lumineux)
- AnimatedCards (cartes animées)
- ProgressBars (barres de progression)
- GamingBadges (badges gaming)
```

## 🚀 Démarrage Rapide Personnalisation

### Étape 1: Choisir le thème
```bash
# Copier le thème de base
cp -r src/styles/themes/default src/styles/themes/fashion
```

### Étape 2: Modifier les couleurs
```bash
# Éditer tailwind.config.js
# Remplacer les couleurs par votre palette
```

### Étape 3: Personnaliser les composants
```bash
# Créer vos composants dans components/[theme]/
# Exemple: components/fashion/, components/tech/
```

### Étape 4: Configurer les données
```bash
# Modifier src/lib/config.ts
# Ajuster categories, filtres, etc.
```

### Étape 5: Images et assets
```bash
# Remplacer dans public/images/
# Logo: public/images/branding/
# Produits: public/images/products/
```

## 🛠️ Outils de Personnalisation

### Commandes utiles
```bash
# Générer des variations de couleurs
npm run theme:generate-colors

# Optimiser les images
npm run images:optimize

# Build pour production
npm run build:theme-fashion
```

### Fichiers à modifier
```
src/styles/themes/[theme]/     → Styles CSS
components/[theme]/            → Composants spécialisés  
src/lib/config.ts             → Configuration
public/images/branding/       → Logo et identité
tailwind.config.js            → Couleurs et fonts
```

## 📊 Métriques par Secteur

### Mode/Fashion
- Temps sur page produit : 2-3 min
- Taux conversion : 2-4%
- Panier moyen : 80-150€

### Tech/Électronique  
- Temps sur page produit : 4-6 min
- Taux conversion : 3-5%
- Panier moyen : 200-500€

### Maison/Déco
- Temps sur page produit : 3-5 min
- Taux conversion : 1-3%
- Panier moyen : 100-300€

Cette approche modulaire permet d'adapter rapidement l'e-commerce à n'importe quel secteur avec des composants réutilisables et une configuration simple.

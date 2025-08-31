# 🎨 Guide de personnalisation E-commerce Starter

## 🚀 Démarrage rapide pour nouvelle boutique

### 1. **Copier le projet**
```bash
cp -r ecommerce-starter ma-nouvelle-boutique
cd ma-nouvelle-boutique
```

### 2. **Personnaliser les informations de base**
Modifiez ces fichiers principaux :

#### `src/app/layout.tsx`
```typescript
export const metadata: Metadata = {
  title: "Ma Boutique Mode",           // ← Changez ici
  description: "Vêtements tendance",   // ← Changez ici
};
```

#### Variables dans les composants
```typescript
// src/components/layout/Navbar.tsx
siteName = "Ma Boutique Mode"          // ← Changez ici

// src/components/layout/Footer.tsx  
companyInfo = {
  name: "Mode & Style Inc.",           // ← Changez ici
  address: "456 Rue Fashion, Québec",  // ← Changez ici
  phone: "(418) 555-0123",            // ← Changez ici
  email: "contact@maboutique.com"      // ← Changez ici
}
```

### 3. **Personnaliser les couleurs (thème)**
Créez votre thème dans `src/styles/themes/ma-niche.css` :

```css
:root {
  /* EXEMPLE: Boutique Mode/Fashion */
  --brand-primary: #ec4899;      /* Rose élégant */
  --brand-secondary: #8b5cf6;    /* Violet luxe */
  --brand-accent: #f59e0b;       /* Or accent */
  
  /* EXEMPLE: Boutique Tech/Gaming */
  --brand-primary: #06b6d4;      /* Cyan tech */
  --brand-secondary: #8b5cf6;    /* Violet gaming */
  --brand-accent: #10b981;       /* Vert success */
  
  /* EXEMPLE: Boutique Beauté */
  --brand-primary: #f472b6;      /* Rose doux */
  --brand-secondary: #c084fc;    /* Lavande */
  --brand-accent: #fbbf24;       /* Doré */
}
```

Puis importez dans `src/app/globals.css` :
```css
@import "../styles/themes/ma-niche.css";
```

## 🔧 Personnalisations avancées

### **Logo personnalisé**
```typescript
// Dans Navbar.tsx
<Navbar 
  siteName="Ma Boutique" 
  logo="/mon-logo.png"     // ← Ajoutez votre logo
/>
```

### **Langue par défaut**
```typescript
// src/app/layout.tsx
<html lang="fr">            // ← fr, en, es, de, it

// src/lib/products.ts
language: Language = Language.FR  // ← Changez la langue par défaut
```

### **Devise par défaut**
```prisma
// prisma/schema.prisma
currency String @default("EUR") @db.Char(3)  // ← EUR, USD, CAD
```

### **Auth providers**
Ajoutez vos clés dans `.env` :
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
APPLE_ID=your_apple_id
APPLE_SECRET=your_apple_secret
```

## 📱 Contenu personnalisable

### **Page d'accueil**
Modifiez `src/app/page.tsx` :
```typescript
<h1>Bienvenue chez [VOTRE MARQUE]</h1>
<p>Votre slogan unique</p>
```

### **Page à propos**
Modifiez `src/app/about/page.tsx` :
- Histoire de votre entreprise
- Valeurs et mission
- Informations de contact

### **Navigation**
Ajoutez/supprimez des liens dans `Navbar.tsx` :
```typescript
<Link href="/collections">Collections</Link>
<Link href="/sale">Promotions</Link>
<Link href="/blog">Blog</Link>
```

## 🎯 Exemples de niches

### 🛍️ **Mode féminine**
```css
:root {
  --brand-primary: #ec4899;    /* Rose mode */
  --brand-secondary: #8b5cf6;  /* Violet luxe */
}
```
- Contenu: Vêtements, accessoires, beauté
- Nav: Collections, Nouveautés, Lookbook
- Hero: "Exprimez votre style unique"

### 🎮 **Gaming/Tech**
```css
:root {
  --brand-primary: #06b6d4;    /* Cyan tech */
  --brand-secondary: #8b5cf6;  /* Violet gaming */
}
```
- Contenu: Hardware, périphériques, jeux
- Nav: PC Gaming, Consoles, Accessoires  
- Hero: "Level up your gaming"

### 🏠 **Décoration/Maison**
```css
:root {
  --brand-primary: #059669;    /* Vert nature */
  --brand-secondary: #d97706;  /* Orange chaleureux */
}
```
- Contenu: Meubles, déco, ustensiles
- Nav: Salon, Cuisine, Chambre
- Hero: "Transformez votre maison"

### 💄 **Beauté/Cosmétiques**
```css
:root {
  --brand-primary: #f472b6;    /* Rose beauté */
  --brand-secondary: #c084fc;  /* Lavande */
}
```
- Contenu: Maquillage, soins, parfums
- Nav: Visage, Corps, Parfums
- Hero: "Révélez votre beauté"

## 📋 Checklist pour nouvelle boutique

- [ ] Changer nom boutique dans `layout.tsx`
- [ ] Créer thème CSS personnalisé  
- [ ] Modifier informations contact Footer
- [ ] Personnaliser page d'accueil
- [ ] Adapter navigation selon niche
- [ ] Configurer Auth providers
- [ ] Adapter devise si nécessaire
- [ ] Ajouter logo personnalisé
- [ ] Tester workflow complet

## 🔄 Workflow de déploiement

1. **Développement local** : `npm run dev`
2. **Tester API** : REST Client + 
3. **Build** : `npm run build`  
4. **Déployer** : Vercel/Netlify avec DB Neon

---

**🎯 Objectif :** 1 base → ∞ boutiques personnalisées !

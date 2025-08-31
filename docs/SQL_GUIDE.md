# Guide SQL Simple pour E-commerce

## Comprendre les bases

### 1. Tables = Feuilles Excel
- Chaque `model` devient une **table** (comme une feuille Excel)
- Chaque champ devient une **colonne**
- Chaque enregistrement devient une **ligne**

### 2. Relations = Liens entre tables
```sql
-- Relation simple : Un User a plusieurs Address
User (id) ←→ Address (userId)

-- Relation N-N : Product ←→ Category via ProductCategory
Product ←→ ProductCategory ←→ Category
```

## Opérations courantes simplifiées

### Ajouter un produit
```typescript
// Au lieu d'écrire du SQL complexe :
await db.product.create({
  data: {
    slug: "iphone-15",
    status: "ACTIVE",
    translations: {
      create: [
        { language: "FR", name: "iPhone 15", description: "..." },
        { language: "EN", name: "iPhone 15", description: "..." }
      ]
    }
  }
})
```

### Chercher des produits
```typescript
// Cherche tous les produits actifs avec traduction française
await db.product.findMany({
  where: { 
    status: "ACTIVE",
    deletedAt: null  // Pas supprimé
  },
  include: {
    translations: { where: { language: "FR" } }
  }
})
```

### Gestion panier → commande
```typescript
// Transaction = tout ou rien
await db.$transaction(async (tx) => {
  // 1. Récupère le panier
  const cart = await tx.cart.findFirst(...)
  
  // 2. Crée la commande
  const order = await tx.order.create(...)
  
  // 3. Marque le panier comme converti
  await tx.cart.update({ data: { status: "CONVERTED" } })
})
```

## Règles importantes

### Soft Delete
- `deletedAt: null` = actif
- `deletedAt: DateTime` = supprimé (mais garde les données)

### Contraintes métier
- **Un seul panier ACTIVE** par user → géré par index SQL
- **Une seule image principale** par variante → géré par index SQL
- **Validation rating 1-5** → à faire côté TypeScript

### JSON vs Relations
- **Adresses dans Order** = JSON (snapshot historique)
- **Adresses dans User** = Relations (modifiables)

## Conseils pratiques

1. **Utilise les helpers TypeScript** au lieu d'écrire du SQL
2. **Toujours wrap en try/catch** avec `safeDbOperation`
3. **Utilise les `include`** pour récupérer les relations en une requête
4. **Pense "transaction"** pour les opérations multi-tables

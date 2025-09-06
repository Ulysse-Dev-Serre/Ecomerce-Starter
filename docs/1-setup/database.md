# Configuration Base de Données

## Structure et Concepts

### Tables et Relations
- Chaque `model` devient une **table** (comme une feuille Excel)
- Chaque champ devient une **colonne**
- Chaque enregistrement devient une **ligne**

```sql
-- Relations courantes
User (id) ←→ Address (userId)
Product ←→ ProductCategory ←→ Category
```

## Opérations Courantes

### Ajouter un produit
```typescript
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

### Rechercher des produits
```typescript
await db.product.findMany({
  where: { 
    status: "ACTIVE",
    deletedAt: null
  },
  include: {
    translations: { where: { language: "FR" } }
  }
})
```

### Gestion panier → commande
```typescript
await db.$transaction(async (tx) => {
  const cart = await tx.cart.findFirst(...)
  const order = await tx.order.create(...)
  await tx.cart.update({ data: { status: "CONVERTED" } })
})
```

## Règles Importantes

### Soft Delete
- `deletedAt: null` = actif
- `deletedAt: DateTime` = supprimé (garde les données)

### Contraintes
- **Un seul panier ACTIVE** par user → géré par index SQL
- **Une seule image principale** par variante → géré par index SQL
- **Validation rating 1-5** → côté TypeScript

### JSON vs Relations
- **Adresses dans Order** = JSON (snapshot historique)
- **Adresses dans User** = Relations (modifiables)

## Bonnes Pratiques

1. Utilise les helpers TypeScript au lieu d'écrire du SQL
2. Toujours wrap en try/catch avec `safeDbOperation`
3. Utilise les `include` pour récupérer les relations
4. Pense "transaction" pour les opérations multi-tables

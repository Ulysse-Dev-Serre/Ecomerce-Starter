# API Panier

## Endpoints Disponibles

### `GET /api/cart`
Récupère le panier de l'utilisateur authentifié.

**Authentification requise** 🔒

**Réponse:**
```json
{
  "success": true,
  "data": {
    "id": "clm...",
    "status": "ACTIVE",
    "items": [
      {
        "id": "clm...",
        "quantity": 2,
        "variant": {
          "id": "clm...",
          "product": {
            "slug": "iphone-15",
            "translations": [
              {
                "name": "iPhone 15",
                "price": 999.00
              }
            ]
          }
        }
      }
    ],
    "totalItems": 2,
    "totalPrice": 1998.00
  }
}
```

### `POST /api/cart`
Ajoute un produit au panier ou met à jour la quantité.

**Authentification requise** 🔒

**Body:**
```json
{
  "variantId": "clm...",
  "quantity": 1
}
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "id": "clm...",
    "quantity": 3,
    "message": "Produit ajouté au panier"
  }
}
```

### `PUT /api/cart/[itemId]`
Met à jour la quantité d'un item spécifique.

**Authentification requise** 🔒

**Body:**
```json
{
  "quantity": 5
}
```

### `DELETE /api/cart/[itemId]`
Supprime un item du panier.

**Authentification requise** 🔒

**Réponse:**
```json
{
  "success": true,
  "message": "Produit retiré du panier"
}
```

### `DELETE /api/cart`
Vide complètement le panier.

**Authentification requise** 🔒

## Logique Métier

### Gestion Automatique
- **Un seul panier actif** par utilisateur
- **Création automatique** si pas de panier existant
- **Merge intelligent** des quantités (upsert)
- **Nettoyage automatique** des items à quantité 0

### Contraintes
- Quantité minimale : 1
- Quantité maximale : 99
- Stock disponible vérifié
- Produits actifs uniquement

### Transactions
```typescript
// Operation atomique pour éviter race conditions
await db.$transaction(async (tx) => {
  const cartItem = await tx.cartItem.upsert({
    where: { cartId_variantId: { cartId, variantId } },
    update: { quantity: { increment: quantity } },
    create: { cartId, variantId, quantity }
  })
})
```

## Calculs

### Prix Total Item
```
itemTotal = variant.price * quantity
```

### Prix Total Panier
```
cartTotal = sum(itemTotal for each item)
```

### Compteur Items
```
totalItems = sum(quantity for each item)
```

## États du Panier

| État | Description |
|------|-------------|
| `ACTIVE` | Panier en cours d'utilisation |
| `CONVERTED` | Transformé en commande |
| `ABANDONED` | Abandonné (nettoyage automatique) |

## Gestion d'Erreurs

### Produit non disponible
```json
{
  "success": false,
  "error": "Product variant not available",
  "code": "VARIANT_UNAVAILABLE"
}
```

### Stock insuffisant
```json
{
  "success": false,
  "error": "Insufficient stock",
  "code": "INSUFFICIENT_STOCK",
  "data": {
    "available": 3,
    "requested": 5
  }
}
```

### Quantité invalide
```json
{
  "success": false,
  "error": "Quantity must be between 1 and 99",
  "code": "INVALID_QUANTITY"
}
```

## Optimisations Performance

### Cache
- Cache panier utilisateur (2 minutes)
- Invalidation sur modification
- Cache séparé pour compteur items

### Base de Données
- Index composite sur `cartId_variantId`
- Index sur `userId` et `status`
- Soft delete sur les paniers

### Rate Limiting
- 60 requêtes/minute par utilisateur
- Protection contre spam d'ajout

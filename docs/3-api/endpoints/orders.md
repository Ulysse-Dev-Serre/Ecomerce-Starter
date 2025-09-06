# API Commandes

## Endpoints Disponibles

### `GET /api/orders`
Liste les commandes de l'utilisateur authentifié.

**Authentification requise** 🔒

**Query parameters:**
- `page` : Numéro de page (défaut: 1)
- `limit` : Éléments par page (défaut: 10)
- `status` : Filtrer par statut

**Réponse:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clm...",
      "orderNumber": "ORD-20240301-001",
      "status": "CONFIRMED",
      "totalAmount": 1998.00,
      "createdAt": "2024-03-01T10:00:00Z",
      "items": [
        {
          "quantity": 2,
          "unitPrice": 999.00,
          "variant": {
            "product": {
              "translations": [{ "name": "iPhone 15" }]
            }
          }
        }
      ],
      "shippingAddress": { ... },
      "billingAddress": { ... }
    }
  ],
  "metadata": {
    "total": 25,
    "page": 1,
    "totalPages": 3
  }
}
```

### `GET /api/orders/[id]`
Récupère une commande spécifique.

**Authentification requise** 🔒

**Réponse:** Détails complets de la commande avec items, adresses, paiements.

### `POST /api/orders`
Crée une nouvelle commande depuis le panier actif.

**Authentification requise** 🔒

**Body:**
```json
{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Montreal",
    "zipCode": "H1A 1A1",
    "country": "CA"
  },
  "billingAddress": { ... },
  "paymentIntentId": "pi_...",
  "notes": "Livraison après 18h"
}
```

**Process:**
1. Vérifie le panier actif
2. Calcule les totaux
3. Crée la commande avec items
4. Marque le panier comme CONVERTED
5. Génère un numéro de commande unique

### `PATCH /api/orders/[id]/status`
Met à jour le statut d'une commande (admin uniquement).

**Authentification admin requise** 🔒

**Body:**
```json
{
  "status": "SHIPPED",
  "trackingNumber": "TR123456789"
}
```

## Statuts des Commandes

| Statut | Description |
|--------|-------------|
| `PENDING` | En attente de paiement |
| `CONFIRMED` | Paiement confirmé |
| `PROCESSING` | En cours de préparation |
| `SHIPPED` | Expédiée |
| `DELIVERED` | Livrée |
| `CANCELLED` | Annulée |
| `REFUNDED` | Remboursée |

## Workflow Commande

### 1. Création
```typescript
// Transaction atomique
await db.$transaction(async (tx) => {
  // Récupère le panier
  const cart = await tx.cart.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: { items: { include: { variant: true } } }
  })
  
  // Crée la commande
  const order = await tx.order.create({
    data: {
      userId,
      orderNumber: generateOrderNumber(),
      status: 'PENDING',
      totalAmount: calculateTotal(cart.items),
      items: {
        create: cart.items.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.variant.price
        }))
      }
    }
  })
  
  // Marque le panier comme converti
  await tx.cart.update({
    where: { id: cart.id },
    data: { status: 'CONVERTED' }
  })
  
  return order
})
```

### 2. Paiement
- Intégration avec Stripe Payment Intent
- Confirmation asynchrone via webhook
- Mise à jour automatique du statut

### 3. Fulfillment
- Notification email au client
- Mise à jour du stock
- Génération des documents

## Numérotation

### Format
```
ORD-YYYYMMDD-NNN
```

Exemples :
- `ORD-20240301-001`
- `ORD-20240301-002`

### Génération
```typescript
function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const counter = getNextOrderCounter(date)
  return `ORD-${date}-${counter.toString().padStart(3, '0')}`
}
```

## Adresses

### Structure
```json
{
  "street": "123 Main St",
  "city": "Montreal", 
  "state": "QC",
  "zipCode": "H1A 1A1",
  "country": "CA",
  "phone": "+1-555-0123"
}
```

### Gestion
- Snapshot dans la commande (immutable)
- Copie des adresses utilisateur au moment de création
- Validation côté serveur

## Gestion d'Erreurs

### Panier vide
```json
{
  "success": false,
  "error": "Cart is empty",
  "code": "EMPTY_CART"
}
```

### Stock insuffisant
```json
{
  "success": false,
  "error": "Insufficient stock for some items",
  "code": "INSUFFICIENT_STOCK",
  "data": {
    "unavailableItems": [
      {
        "variantId": "clm...",
        "requested": 3,
        "available": 1
      }
    ]
  }
}
```

### Commande non trouvée
```json
{
  "success": false,
  "error": "Order not found or access denied",
  "code": "ORDER_NOT_FOUND"
}
```

## Sécurité

### Autorisation
- Utilisateurs voient uniquement leurs commandes
- Admins ont accès à toutes les commandes
- Validation des permissions sur chaque endpoint

### Audit Trail
- Log de tous les changements de statut
- Traçabilité des modifications
- Horodatage précis

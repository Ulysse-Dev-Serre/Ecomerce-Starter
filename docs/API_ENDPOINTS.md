# API E-commerce - Documentation des Endpoints

## 🛍️ Products (Produits)
- `GET /api/products` - Liste des produits
  - Query params: `language` (EN|FR|ES|DE|IT), `search` (texte)
- `GET /api/products/[slug]` - Détail d'un produit
  - Query params: `language`

## 📂 Categories (Catégories)
- `GET /api/categories` - Liste des catégories
  - Query params: `language`
- `GET /api/categories/[slug]` - Catégorie avec ses produits
  - Query params: `language`

## 🛒 Cart (Panier)
- `GET /api/cart/[userId]` - Récupérer le panier
- `POST /api/cart/[userId]` - Ajouter au panier
  - Body: `{ variantId: string, quantity?: number }`

## 👤 Users (Utilisateurs)
- `POST /api/users` - Créer un utilisateur
  - Body: `{ email: string, name?: string, role?: UserRole }`
- `GET /api/users/[id]` - Récupérer un utilisateur
- `PUT /api/users/[id]` - Modifier un utilisateur
  - Body: `{ name?: string, email?: string }`

### Addresses (Adresses)
- `POST /api/users/[id]/addresses` - Ajouter une adresse
  - Body: `{ street, city, state?, zipCode, country, type?, isDefault? }`

### User Orders (Commandes utilisateur)
- `GET /api/users/[id]/orders` - Commandes d'un utilisateur
  - Query params: `limit`, `offset`

## 📦 Orders (Commandes)
- `POST /api/orders` - Créer une commande depuis le panier
  - Body: `{ userId, shippingAddress, billingAddress }`
- `GET /api/orders/[id]` - Récupérer une commande
- `PATCH /api/orders/[id]` - Modifier le statut
  - Body: `{ status: OrderStatus }`

## 🔄 Format des réponses
```json
{
  "data": { ... },
  "count": 10,
  "error": null
}
```

## 🌍 Langues supportées
- EN (English)
- FR (Français)
- ES (Español)
- DE (Deutsch)
- IT (Italiano)

## 💰 Devise par défaut
CAD (Dollar canadien)

## ✅ Codes de retour
- `200` - Succès
- `201` - Créé
- `400` - Erreur client
- `404` - Non trouvé
- `500` - Erreur serveur

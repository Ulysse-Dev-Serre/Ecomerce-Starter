# API Produits

## Endpoints Disponibles

### `GET /api/products`
Liste tous les produits actifs avec pagination.

**Query parameters:**
- `page` : Numéro de page (défaut: 1)
- `limit` : Nombre d'éléments par page (défaut: 20)
- `search` : Terme de recherche dans nom/description
- `category` : Filtrer par slug de catégorie

**Réponse:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clm...",
      "slug": "iphone-15",
      "status": "ACTIVE",
      "translations": [
        {
          "language": "FR",
          "name": "iPhone 15",
          "description": "Le nouvel iPhone...",
          "price": 999.00
        }
      ],
      "images": [...],
      "categories": [...]
    }
  ],
  "metadata": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

### `GET /api/products/[slug]`
Récupère un produit par son slug.

**Paramètres:**
- `slug` : Identifiant unique du produit

**Réponse:**
```json
{
  "success": true,
  "data": {
    "id": "clm...",
    "slug": "iphone-15",
    "translations": [...],
    "images": [...],
    "variants": [...],
    "categories": [...],
    "reviews": [...]
  }
}
```

### `POST /api/products` 🔒
Crée un nouveau produit (admin uniquement).

**Body:**
```json
{
  "slug": "nouveau-produit",
  "status": "ACTIVE",
  "translations": [
    {
      "language": "FR",
      "name": "Nouveau Produit",
      "description": "Description du produit",
      "price": 49.99
    }
  ]
}
```

### `PUT /api/products/[id]` 🔒
Met à jour un produit existant (admin uniquement).

### `DELETE /api/products/[id]` 🔒
Supprime un produit (soft delete, admin uniquement).

## Filtrage et Recherche

### Par catégorie
```
GET /api/products?category=smartphones
```

### Par nom/description
```
GET /api/products?search=iPhone
```

### Combinaison
```
GET /api/products?category=smartphones&search=Apple&page=2
```

## Gestion d'Erreurs

### Produit non trouvé
```json
{
  "success": false,
  "error": "Product not found",
  "code": "PRODUCT_NOT_FOUND"
}
```

### Paramètres invalides
```json
{
  "success": false,
  "error": "Invalid page parameter",
  "code": "INVALID_PARAMETERS"
}
```

## Optimisations

### Cache
- Cache des listes de produits (5 minutes)
- Cache des détails produit (15 minutes)
- Invalidation sur modification

### Performance
- Pagination obligatoire sur les listes
- Index sur slug, status, deletedAt
- Relations chargées avec `include`

### Sécurité
- Rate limiting : 100 requêtes/minute par IP
- Validation des paramètres d'entrée
- Sanitization des données de sortie

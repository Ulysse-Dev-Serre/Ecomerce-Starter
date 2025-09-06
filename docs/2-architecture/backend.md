# Architecture Backend

## Vue d'Ensemble

Architecture **serverless** basée sur Next.js API Routes avec Prisma ORM et PostgreSQL.

## Stack Technique

### Core
- **Next.js 14** : Framework full-stack
- **Prisma** : ORM type-safe
- **PostgreSQL** : Base de données relationnelle
- **TypeScript** : Typage statique

### Services
- **NextAuth.js** : Authentification
- **Stripe** : Paiements
- **Vercel** : Hébergement serverless

## API Routes Structure

```
app/api/
├── auth/                   # NextAuth endpoints
│   └── [...nextauth]/
├── cart/                   # Gestion panier
│   ├── route.ts           # GET, POST, PUT, DELETE
│   └── [id]/
├── products/              # Gestion produits
│   ├── route.ts
│   └── [slug]/
├── orders/                # Gestion commandes
└── webhooks/              # Webhooks externes
    └── stripe/
```

## Modèles de Données

### Entités Principales
```typescript
// User : Utilisateur
// Product : Produit avec traductions
// Cart : Panier actif
// Order : Commande finalisée
// Address : Adresses utilisateur
// Payment : Données de paiement
```

### Relations
- User → Cart (1:1 actif)
- User → Orders (1:n)
- User → Addresses (1:n)
- Order → OrderItems (1:n)
- Product → ProductTranslations (1:n)

## Patterns de Sécurité

### Authentification
```typescript
// Middleware de protection
export async function requireAuth(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Unauthorized')
  return session
}
```

### Validation
```typescript
// Validation côté serveur avec Zod
const createProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  status: z.enum(['ACTIVE', 'INACTIVE'])
})
```

### Rate Limiting
- Limite par IP et par endpoint
- Protection contre les attaques DDoS
- Configuration par route

## Base de Données

### Soft Delete
```sql
-- Tous les modèles ont deletedAt
deletedAt: DateTime?  -- null = actif, date = supprimé
```

### Transactions
```typescript
// Operations atomiques
await db.$transaction(async (tx) => {
  await tx.cart.update(...)
  await tx.order.create(...)
})
```

### Indexes Optimisés
- Performance sur les requêtes fréquentes
- Contraintes d'unicité métier
- Index composites pour les relations

## API Design

### RESTful Conventions
```
GET    /api/products      # Liste
POST   /api/products      # Création
GET    /api/products/[id] # Détail
PUT    /api/products/[id] # Mise à jour
DELETE /api/products/[id] # Suppression
```

### Réponses Standardisées
```typescript
// Format de réponse uniforme
{
  success: boolean
  data?: any
  error?: string
  metadata?: {
    total: number
    page: number
  }
}
```

### Codes de Statut HTTP
- `200` : Succès
- `201` : Créé
- `400` : Erreur client
- `401` : Non authentifié
- `403` : Non autorisé
- `404` : Non trouvé
- `500` : Erreur serveur

## Gestion d'Erreurs

### Try/Catch Global
```typescript
export async function safeDbOperation<T>(
  operation: () => Promise<T>
): Promise<{ data?: T; error?: string }> {
  try {
    const data = await operation()
    return { data }
  } catch (error) {
    return { error: error.message }
  }
}
```

### Logs Structurés
- Erreurs loggées avec contexte
- Pas de données sensibles
- Traçabilité des requêtes

## Performance

### Cache Strategy
- Cache des requêtes fréquentes
- Invalidation intelligente
- Cache différencié par utilisateur

### Optimisations Base
- Requêtes optimisées avec `include`
- Pagination sur les listes
- Index sur les champs recherchés

### Monitoring
- Métriques de performance
- Alertes sur erreurs fréquentes
- Monitoring des requêtes lentes

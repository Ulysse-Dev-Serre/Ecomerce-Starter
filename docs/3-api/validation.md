# Validation des Données

## Vue d'Ensemble

Validation côté serveur avec **Zod** pour tous les endpoints API, garantissant la sécurité et la cohérence des données.

## Schémas de Validation

### Produits
```typescript
const createProductSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']),
  translations: z.array(z.object({
    language: z.enum(['FR', 'EN', 'ES', 'DE', 'IT']),
    name: z.string().min(1).max(200),
    description: z.string().max(2000),
    price: z.number().positive().max(999999)
  })).min(1)
})
```

### Utilisateurs
```typescript
const createUserSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(2).max(100).trim(),
  password: z.string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
})
```

### Adresses
```typescript
const addressSchema = z.object({
  street: z.string().min(5).max(200),
  city: z.string().min(2).max(100),
  state: z.string().optional(),
  zipCode: z.string().min(3).max(10),
  country: z.enum(['CA', 'US', 'FR', 'DE', 'IT', 'ES']),
  type: z.enum(['SHIPPING', 'BILLING', 'BOTH']).default('SHIPPING'),
  isDefault: z.boolean().default(false)
})
```

### Panier
```typescript
const addToCartSchema = z.object({
  variantId: z.string().cuid(),
  quantity: z.number().int().min(1).max(99)
})
```

## Middleware de Validation

### Wrapper générique
```typescript
export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return (handler: (req: NextRequest, validatedData: T) => Promise<Response>) => {
    return async (req: NextRequest) => {
      try {
        const body = await req.json()
        const validatedData = schema.parse(body)
        return await handler(req, validatedData)
      } catch (error) {
        if (error instanceof z.ZodError) {
          return Response.json({
            success: false,
            error: 'Validation failed',
            details: error.errors
          }, { status: 400 })
        }
        throw error
      }
    }
  }
}
```

### Usage
```typescript
// app/api/products/route.ts
export const POST = validateRequest(createProductSchema)(
  async (req, validatedData) => {
    // validatedData est typé et validé
    const product = await db.product.create({
      data: validatedData
    })
    return Response.json({ success: true, data: product })
  }
)
```

## Types de Validation

### Strings
- **Longueur** : min/max caractères
- **Format** : email, URL, regex
- **Contenu** : trim automatique, échappement HTML

### Nombres
- **Range** : min/max valeurs
- **Type** : entier, décimal, positif
- **Précision** : décimales limitées

### Tableaux
- **Taille** : min/max éléments
- **Contenu** : validation de chaque élément
- **Unicité** : pas de doublons

### Objets
- **Champs requis** : validation stricte
- **Champs optionnels** : avec défauts
- **Validation conditionnelle** : selon contexte

## Règles Métier

### Produits
- Slug unique et SEO-friendly
- Prix positifs avec 2 décimales max
- Au moins une traduction requise
- Status cohérent avec visibilité

### Utilisateurs
- Email unique en base
- Mot de passe fort requis (si credentials)
- Nom sans caractères dangereux
- Rôle par défaut USER

### Commandes
- Adresses complètes et valides
- Quantités dans limites raisonnables
- Stock disponible vérifié
- Prix calculés côté serveur

## Sécurité

### Sanitization
```typescript
const sanitizeString = z.string().transform((val) => {
  return val
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
})
```

### Protection XSS
- Échappement HTML automatique
- Validation regex stricte
- Blacklist de caractères dangereux

### Protection Injection
- Paramètres préparés uniquement
- Validation des IDs (CUID)
- Pas de SQL brut accepté

## Messages d'Erreur

### Format standardisé
```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter"
    }
  ]
}
```

### Messages localisés
```typescript
const errorMessages = {
  fr: {
    'string.email': 'Format email invalide',
    'string.min': 'Minimum {limit} caractères requis',
    'number.positive': 'La valeur doit être positive'
  },
  en: {
    'string.email': 'Invalid email format',
    'string.min': 'Minimum {limit} characters required',
    'number.positive': 'Value must be positive'
  }
}
```

## Performance

### Optimisations
- Validation lazy pour champs optionnels
- Cache des schémas compilés
- Early return sur première erreur

### Métriques
- Temps de validation < 1ms
- Mémoire limitée par schéma
- Pas d'impact sur débit API

## Tests

### Cas de test
```typescript
describe('Product validation', () => {
  it('accepts valid product data', () => {
    const validData = {
      slug: 'test-product',
      status: 'ACTIVE',
      translations: [{
        language: 'FR',
        name: 'Produit Test',
        description: 'Description...',
        price: 29.99
      }]
    }
    expect(() => createProductSchema.parse(validData)).not.toThrow()
  })
  
  it('rejects invalid slug format', () => {
    const invalidData = {
      slug: 'Test Product!',  // Espaces et caractères spéciaux
      // ...
    }
    expect(() => createProductSchema.parse(invalidData)).toThrow()
  })
})
```

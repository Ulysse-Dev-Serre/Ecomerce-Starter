# Validation des Entrées Utilisateur - Documentation

## Vue d'ensemble

Le système de validation protège l'application contre les injections, mass assignment, et autres attaques par validation stricte de toutes les entrées utilisateur avec des schémas Zod.

## Architecture de validation

### Middleware de validation
```typescript
// Utilisation dans un endpoint
import { createValidationMiddleware } from '@/lib/validation'

export async function POST(request: NextRequest) {
  const validateContact = createValidationMiddleware('contactForm', { 
    logErrors: true 
  })
  
  const { data: validatedData, error: validationError } = await validateContact(request)
  
  if (validationError) return validationError
  // Données garanties valides et sécurisées
}
```

### Schémas de validation stricts
```typescript
// Tous les schémas utilisent .strict() pour rejeter champs inattendus
const contactForm = z.object({
  name: BaseValidationSchemas.name,
  email: BaseValidationSchemas.email,
  subject: BaseValidationSchemas.shortText,
  message: BaseValidationSchemas.longText
}).strict() // ✅ Rejette tous les champs non définis
```

## Limites de sécurité appliquées

### Texte et chaînes
```typescript
SHORT_TEXT_MAX: 100      // Titres, labels
MEDIUM_TEXT_MAX: 500     // Descriptions courtes
LONG_TEXT_MAX: 5000      // Messages, descriptions longues
NAME_MAX: 255            // Noms, titres
EMAIL_MAX: 320           // RFC 5321 standard
URL_MAX: 2048            // URLs
```

### Données numériques
```typescript
PRICE_MAX: 999999.99     // Prix maximum
QUANTITY_MIN: 1          // Quantité minimum
QUANTITY_MAX: 10000      // Quantité maximum
PAGE_MAX: 10000          // Pagination
LIMIT_MAX: 100           // Limite par page
```

### Collections
```typescript
ARRAY_MAX_ITEMS: 100     // Éléments maximum dans arrays
TAGS_MAX: 20             // Tags/catégories maximum
FILE_MAX_SIZE: 10MB      // Taille fichier maximum
IMAGE_MAX_SIZE: 5MB      // Images maximum
```

## Endpoints validés

### 📧 Contact Form (`/api/contact`)
**Schéma**: `contactForm`
```typescript
{
  name: string (1-255 chars),
  email: string (format email, max 320),
  subject: string (max 100 chars),
  message: string (max 5000 chars),
  phone?: string (regex validation),
  company?: string (max 100 chars)
}
```

**Protections**:
- ✅ Champs extra rejetés (`isAdmin`, `role`, etc.)
- ✅ Sanitization HTML (`<script>` → `&lt;script&gt;`)
- ✅ Rate limiting anti-spam
- ✅ Validation email stricte

### 🛒 Panier (`/api/cart/[userId]`)
**Schéma**: `addToCart`
```typescript
{
  variantId: string (ID format, max 50 chars),
  quantity: number (1-10000, entier)
}
```

**Protections**:
- ✅ Champs malveillants rejetés (`price`, `discount`, `isAdmin`)
- ✅ Quantité dans limites raisonnables
- ✅ ID format validé (alphanumeric + tirets)
- ✅ Vérification propriété ressource (userId)

### 📦 Produits (`/api/admin/products`)
**Schéma**: `createProduct`
```typescript
{
  slug: string (format slug),
  status: enum ['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'],
  translations: Array<{
    language: enum ['FR', 'EN', 'ES', 'DE', 'IT'],
    name: string (1-255 chars),
    description: string (max 5000 chars)
  }> (min 1, max 5),
  variants: Array<{
    sku: string (required),
    price: number (positive, 2 decimales max),
    stock: number (entier >= 0)
  }> (min 1, max 50)
}
```

**Protections**:
- ✅ Mass assignment bloqué (`cost`, `adminNotes`, `internalId`)
- ✅ Limites strictes sur arrays (max 5 traductions, 50 variantes)
- ✅ Validation business logic (au moins 1 traduction complète)
- ✅ Prix avec 2 décimales maximum

## Types de validation

### 1. Validation de type
```typescript
// Avant
const { quantity } = body // any type

// Après  
const quantity: number = validatedData.quantity // garanti entier 1-10000
```

### 2. Validation de format
```typescript
// Email
email: z.string().email().max(320).transform(s => s.toLowerCase().trim())

// Slug
slug: z.string().regex(/^[a-z0-9-]+$/, 'Format slug invalide')

// Phone
phone: z.string().regex(/^[\+]?[1-9][\d\s\-\(\)]{8,15}$/)
```

### 3. Validation de longueur
```typescript
// Automatique avec schemas de base
name: BaseValidationSchemas.name // 1-255 chars, trimmed
longText: BaseValidationSchemas.longText // max 5000 chars
```

### 4. Validation business
```typescript
variants: z.array(variantSchema)
  .min(1, 'Au moins une variante requise')
  .max(50, 'Maximum 50 variantes')
  .refine(
    variants => variants.some(v => v.sku.trim() && v.price > 0),
    'Au moins une variante complète requise'
  )
```

## Protection contre attaques

### Mass Assignment
```typescript
// ❌ Dangereux - accepte tout
const userData = await request.json()
await updateUser(userId, userData) // isAdmin: true injecté!

// ✅ Sécurisé - champs stricts
const validatedData = updateUserSchema.parse(body) // Seulement name, email
```

### Injection XSS
```typescript
// Sanitization automatique
const sanitizedData = {
  name: sanitize.html(validatedData.name), // <script> → &lt;script&gt;
  message: sanitize.html(validatedData.message)
}
```

### Injection SQL
```typescript
// Pas d'injection possible - données typées + Prisma ORM
const user = await db.user.create({
  data: {
    name: validatedData.name, // garanti string safe
    email: validatedData.email // garanti email format
  }
})
```

### Prototype Pollution
```typescript
// ❌ Dangereux
const data = JSON.parse(body)
data.__proto__ = { isAdmin: true } // Pollution!

// ✅ Sécurisé - Zod ignore propriétés système
const data = schema.parse(body) // __proto__ automatiquement ignoré
```

### Path Traversal
```typescript
// Validation ID strict
id: z.string()
  .regex(/^[a-zA-Z0-9_-]+$/, 'ID contient caractères invalides')
  
// ../../../etc/passwd → REJETÉ
```

## Gestion des erreurs de validation

### Format de réponse standardisé
```json
{
  "error": "Données invalides",
  "code": "VALIDATION_ERROR", 
  "details": [
    {
      "field": "email",
      "message": "Email invalide",
      "received": "not-an-email"
    },
    {
      "field": "quantity", 
      "message": "Quantité doit être entre 1 et 10000",
      "received": -5
    }
  ]
}
```

### Types d'erreurs
- `VALIDATION_ERROR`: Données invalides selon schéma
- `INVALID_JSON`: JSON malformé
- `MISSING_DATA`: Corps de requête vide
- `INVALID_QUERY_PARAMS`: Paramètres URL invalides

## Tests et validation

### Tests automatisés
```bash
# Test complet validation
npm run test:validation

# Test avec payloads malformés  
node tests/test-validation.js
```

### Tests manuels (REST Client)
```bash
# Tests payloads malformés
code tests/validation-malformed.http
```

### Cas de test critiques
1. **Champs extra malveillants** → 400
2. **Données trop longues** → 400  
3. **Types incorrects** → 400
4. **Injection XSS/SQL** → 400 ou sanitized
5. **JSON malformé** → 400
6. **Mass assignment** → 400

## Monitoring et logs

### Logs de sécurité
```typescript
// Automatique en cas d'erreur validation
console.warn('Validation error:', {
  schema: 'contactForm',
  error: zodError.issues,
  timestamp: new Date().toISOString(),
  ip: getClientIP(request) // Rate limiting
})
```

### Métriques recommandées
- Nombre d'erreurs de validation par endpoint
- Types d'attaques tentées (XSS, injection, etc.)
- IPs avec le plus d'erreurs de validation
- Champs le plus souvent malformés

## Configuration avancée

### Personnaliser limites
```typescript
// src/lib/validation.ts
export const VALIDATION_LIMITS = {
  LONG_TEXT_MAX: 10000, // Augmenter pour descriptions produit
  QUANTITY_MAX: 50000,  // E-commerce B2B
  ARRAY_MAX_ITEMS: 200  // Plus de variants
}
```

### Ajouter nouveau schéma
```typescript
// Dans ValidationSchemas
newsletter: z.object({
  email: BaseValidationSchemas.email,
  preferences: z.array(z.enum(['PROMOTIONS', 'NEWS', 'UPDATES']))
    .max(10, 'Maximum 10 préférences')
}).strict(),
```

### Nouveau endpoint
```typescript
export async function POST(request: NextRequest) {
  const validateNewsletter = createValidationMiddleware('newsletter')
  const { data, error } = await validateNewsletter(request)
  
  if (error) return error
  // data.email et data.preferences garantis valides
}
```

## Sanitization supplémentaire

### Fonctions utilitaires
```typescript
import { sanitize } from '@/lib/validation'

// HTML entities
const safe = sanitize.html('<script>alert("xss")</script>')
// → '&lt;script&gt;alert("xss")&lt;/script&gt;'

// Alphanumeric seulement
const clean = sanitize.alphanumeric('user@#$%123')
// → 'user123'

// Nom de fichier sécurisé
const filename = sanitize.filename('../../../bad-file.txt')
// → '______bad-file.txt'
```

## Conformité et standards

### OWASP Top 10
- ✅ **A03 - Injection**: Validation + sanitization + ORM
- ✅ **A04 - Insecure Design**: Validation par défaut obligatoire  
- ✅ **A05 - Security Misconfiguration**: Champs stricts par défaut

### Bonnes pratiques
1. **Fail Secure**: Rejet par défaut, autorisation explicite
2. **Defense in Depth**: Validation + sanitization + ORM + CSP
3. **Least Privilege**: Champs minimum nécessaires
4. **Input Validation**: Server-side obligatoire
5. **Error Handling**: Messages d'erreur sécurisés

## Cas d'utilisation avancés

### Upload de fichiers
```typescript
// Validation fichier
const fileValidation = validateFileUpload(file, {
  maxSize: VALIDATION_LIMITS.IMAGE_MAX_SIZE,
  allowedTypes: ['image/jpeg', 'image/png'],
  allowedExtensions: ['jpg', 'jpeg', 'png']
})

if (!fileValidation.valid) {
  return NextResponse.json({ 
    error: 'Fichier invalide',
    details: fileValidation.errors 
  }, { status: 400 })
}
```

### Query parameters
```typescript
const { data: params, error } = validateQueryParams(
  request, 
  ValidationSchemas.paginationQuery
)

if (error) return error
// params.page, params.limit garantis valides
```

### Validation conditionnelle
```typescript
const schema = z.object({
  type: z.enum(['INDIVIDUAL', 'COMPANY']),
  companyName: z.string().optional()
}).refine(
  data => data.type !== 'COMPANY' || data.companyName,
  'Nom de société requis pour type COMPANY'
)
```

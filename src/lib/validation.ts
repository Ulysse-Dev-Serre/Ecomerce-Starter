import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

// Limites de sécurité globales
export const VALIDATION_LIMITS = {
  // Texte général
  SHORT_TEXT_MAX: 100,
  MEDIUM_TEXT_MAX: 500,
  LONG_TEXT_MAX: 5000,
  
  // Identifiants
  ID_MIN: 1,
  ID_MAX: 50,
  
  // Noms et titres
  NAME_MIN: 1,
  NAME_MAX: 255,
  
  // Emails
  EMAIL_MAX: 320, // RFC 5321 standard
  
  // URLs
  URL_MAX: 2048,
  
  // Arrays
  ARRAY_MAX_ITEMS: 100,
  TAGS_MAX: 20,
  
  // Fichiers
  FILE_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  IMAGE_MAX_SIZE: 5 * 1024 * 1024,  // 5MB
  
  // Numérique
  PRICE_MIN: 0,
  PRICE_MAX: 999999.99,
  QUANTITY_MIN: 1,
  QUANTITY_MAX: 10000,
  
  // Pagination
  PAGE_MIN: 1,
  PAGE_MAX: 10000,
  LIMIT_MIN: 1,
  LIMIT_MAX: 100,
} as const

// Types de base réutilisables avec validation stricte
export const BaseValidationSchemas = {
  // Identifiants
  id: z.string()
    .min(VALIDATION_LIMITS.ID_MIN, 'ID trop court')
    .max(VALIDATION_LIMITS.ID_MAX, 'ID trop long')
    .regex(/^[a-zA-Z0-9_-]+$/, 'ID contient des caractères invalides'),
  
  uuid: z.string()
    .uuid('UUID invalide'),
  
  slug: z.string()
    .min(1, 'Slug obligatoire')
    .max(VALIDATION_LIMITS.NAME_MAX, 'Slug trop long')
    .regex(/^[a-z0-9-]+$/, 'Slug ne peut contenir que lettres minuscules, chiffres et tirets'),
  
  // Texte
  shortText: z.string()
    .max(VALIDATION_LIMITS.SHORT_TEXT_MAX, `Texte trop long (max ${VALIDATION_LIMITS.SHORT_TEXT_MAX} caractères)`)
    .transform(s => s.trim()),
  
  mediumText: z.string()
    .max(VALIDATION_LIMITS.MEDIUM_TEXT_MAX, `Texte trop long (max ${VALIDATION_LIMITS.MEDIUM_TEXT_MAX} caractères)`)
    .transform(s => s.trim()),
  
  longText: z.string()
    .max(VALIDATION_LIMITS.LONG_TEXT_MAX, `Texte trop long (max ${VALIDATION_LIMITS.LONG_TEXT_MAX} caractères)`)
    .transform(s => s.trim()),
  
  // Nom/titre obligatoire
  name: z.string()
    .min(VALIDATION_LIMITS.NAME_MIN, 'Nom obligatoire')
    .max(VALIDATION_LIMITS.NAME_MAX, `Nom trop long (max ${VALIDATION_LIMITS.NAME_MAX} caractères)`)
    .transform(s => s.trim()),
  
  // Email
  email: z.string()
    .email('Email invalide')
    .max(VALIDATION_LIMITS.EMAIL_MAX, 'Email trop long')
    .transform(s => s.toLowerCase().trim()),
  
  // URL
  url: z.string()
    .url('URL invalide')
    .max(VALIDATION_LIMITS.URL_MAX, 'URL trop longue'),
  
  // Numérique
  price: z.number()
    .positive('Prix doit être positif')
    .max(VALIDATION_LIMITS.PRICE_MAX, `Prix trop élevé (max ${VALIDATION_LIMITS.PRICE_MAX})`)
    .refine(n => Number(n.toFixed(2)) === n, 'Prix ne peut avoir plus de 2 décimales'),
  
  quantity: z.number()
    .int('Quantité doit être un entier')
    .min(VALIDATION_LIMITS.QUANTITY_MIN, `Quantité minimum ${VALIDATION_LIMITS.QUANTITY_MIN}`)
    .max(VALIDATION_LIMITS.QUANTITY_MAX, `Quantité maximum ${VALIDATION_LIMITS.QUANTITY_MAX}`),
  
  // Pagination
  page: z.number()
    .int('Numéro de page invalide')
    .min(VALIDATION_LIMITS.PAGE_MIN, 'Page minimum 1')
    .max(VALIDATION_LIMITS.PAGE_MAX, `Page maximum ${VALIDATION_LIMITS.PAGE_MAX}`),
  
  limit: z.number()
    .int('Limite invalide')
    .min(VALIDATION_LIMITS.LIMIT_MIN, 'Limite minimum 1')
    .max(VALIDATION_LIMITS.LIMIT_MAX, `Limite maximum ${VALIDATION_LIMITS.LIMIT_MAX}`),
  
  // Énumérations communes
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED']),
  language: z.enum(['FR', 'EN', 'ES', 'DE', 'IT']),
  currency: z.enum(['CAD', 'USD', 'EUR', 'GBP']),
  mediaType: z.enum(['IMAGE', 'VIDEO', 'DOCUMENT']),
  
} as const

// Schémas de validation pour les endpoints critiques
export const ValidationSchemas = {
  // Payment Intent schema
  createPaymentIntent: z.object({
    cartId: z.string().cuid('Invalid cart ID'),
    email: z.string().email('Email invalide'),
    billingAddress: z.object({
      line1: z.string().min(1, 'Adresse requise'),
      line2: z.string().optional(),
      city: z.string().min(1, 'Ville requise'),
      state: z.string().optional(),
      postal_code: z.string().min(1, 'Code postal requis'),
      country: z.string().length(2, 'Code pays invalide'),
    }).optional(), // Optional since we'll update it later with real data
    saveAddress: z.boolean().default(false),
  }),


  // Produits
  createProduct: z.object({
    slug: BaseValidationSchemas.slug,
    status: BaseValidationSchemas.status.default('DRAFT'),
    translations: z.array(z.object({
      language: BaseValidationSchemas.language,
      name: BaseValidationSchemas.name,
      description: BaseValidationSchemas.longText,
    }))
    .min(1, 'Au moins une traduction requise')
    .max(5, 'Maximum 5 traductions'),
    
    categories: z.array(BaseValidationSchemas.id)
      .max(VALIDATION_LIMITS.TAGS_MAX, `Maximum ${VALIDATION_LIMITS.TAGS_MAX} catégories`)
      .optional(),
    
    variants: z.array(z.object({
      sku: BaseValidationSchemas.name,
      price: BaseValidationSchemas.price,
      currency: BaseValidationSchemas.currency.default('CAD'),
      stock: z.number().int().min(0).default(0),
      attributes: z.array(z.object({
        attributeName: BaseValidationSchemas.shortText,
        value: BaseValidationSchemas.mediumText
      }))
      .max(20, 'Maximum 20 attributs par variante')
      .optional(),
      media: z.array(z.object({
        url: BaseValidationSchemas.url,
        type: BaseValidationSchemas.mediaType.default('IMAGE'),
        alt: BaseValidationSchemas.mediumText.optional(),
        isPrimary: z.boolean().default(false)
      }))
      .max(10, 'Maximum 10 médias par variante')
      .optional()
    }))
    .min(1, 'Au moins une variante requise')
    .max(50, 'Maximum 50 variantes')
  }).strict(), // Rejette tous les champs non définis

  // Mise à jour produit
  updateProduct: z.object({
    slug: BaseValidationSchemas.slug.optional(),
    status: BaseValidationSchemas.status.optional(),
    translations: z.array(z.object({
      language: BaseValidationSchemas.language,
      name: BaseValidationSchemas.name,
      description: BaseValidationSchemas.longText,
    }))
    .max(5, 'Maximum 5 traductions')
    .optional(),
    categories: z.array(BaseValidationSchemas.id)
      .max(VALIDATION_LIMITS.TAGS_MAX)
      .optional()
  }).strict(),

  // Panier
  addToCart: z.object({
    variantId: BaseValidationSchemas.id,
    quantity: BaseValidationSchemas.quantity.default(1)
  }).strict(),

  updateCartItem: z.object({
    quantity: BaseValidationSchemas.quantity
  }).strict(),

  // Contact
  contactForm: z.object({
    name: BaseValidationSchemas.name,
    email: BaseValidationSchemas.email,
    subject: BaseValidationSchemas.shortText,
    message: BaseValidationSchemas.longText,
    phone: z.string()
      .regex(/^[\+]?[1-9][\d\s\-\(\)]{8,15}$/, 'Numéro de téléphone invalide')
      .optional(),
    company: BaseValidationSchemas.shortText.optional()
  }).strict(),

  // Utilisateur
  updateUser: z.object({
    name: BaseValidationSchemas.name.optional(),
    email: BaseValidationSchemas.email.optional(),
    phone: z.string()
      .regex(/^[\+]?[1-9][\d\s\-\(\)]{8,15}$/, 'Numéro de téléphone invalide')
      .optional()
  }).strict(),

  // Adresse
  address: z.object({
    type: z.enum(['BILLING', 'SHIPPING']),
    firstName: BaseValidationSchemas.name,
    lastName: BaseValidationSchemas.name,
    company: BaseValidationSchemas.shortText.optional(),
    street: BaseValidationSchemas.mediumText,
    city: BaseValidationSchemas.shortText,
    postalCode: z.string()
      .regex(/^[A-Z0-9\s\-]{3,10}$/, 'Code postal invalide')
      .transform(s => s.toUpperCase().replace(/\s/g, '')),
    country: z.string().length(2, 'Code pays invalide (2 lettres)').toUpperCase(),
    phone: z.string()
      .regex(/^[\+]?[1-9][\d\s\-\(\)]{8,15}$/, 'Numéro de téléphone invalide')
      .optional()
  }).strict(),

  // Stock
  updateStock: z.object({
    stock: z.number().int().min(0, 'Stock ne peut être négatif')
  }).strict(),

  // Média
  mediaUpdate: z.object({
    alt: BaseValidationSchemas.mediumText.optional(),
    isPrimary: z.boolean().optional()
  }).strict(),

  // Pagination query params
  paginationQuery: z.object({
    page: z.string().transform(s => parseInt(s) || 1).pipe(BaseValidationSchemas.page),
    limit: z.string().transform(s => parseInt(s) || 10).pipe(BaseValidationSchemas.limit),
    search: BaseValidationSchemas.shortText.optional(),
    status: BaseValidationSchemas.status.optional(),
    category: BaseValidationSchemas.id.optional()
  })
} as const

// Type helper pour extraire les types des schémas
export type ValidatedData<T extends keyof typeof ValidationSchemas> = z.infer<typeof ValidationSchemas[T]>

// Middleware de validation avec gestion d'erreurs
export function createValidationMiddleware<T extends keyof typeof ValidationSchemas>(
  schemaKey: T,
  options: {
    skipOnError?: boolean
    logErrors?: boolean
  } = {}
) {
  return async (request: NextRequest): Promise<{
    data: ValidatedData<T> | null
    error: NextResponse | null
  }> => {
    try {
      const body = await request.json()
      const schema = ValidationSchemas[schemaKey]
      const validatedData = schema.parse(body) as ValidatedData<T>
      
      return {
        data: validatedData,
        error: null
      }
    } catch (error) {
      if (options.logErrors) {
        console.warn('Validation error:', {
          schema: schemaKey,
          error: error instanceof z.ZodError ? error.issues : error,
          timestamp: new Date().toISOString()
        })
      }
      
      if (error instanceof z.ZodError) {
        return {
          data: null,
          error: NextResponse.json({
            error: 'Données invalides',
            code: 'VALIDATION_ERROR',
            details: error.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message,
              received: 'received' in issue ? issue.received : undefined
            }))
          }, { status: 400 })
        }
      }
      
      if (error instanceof SyntaxError) {
        return {
          data: null,
          error: NextResponse.json({
            error: 'JSON invalide',
            code: 'INVALID_JSON'
          }, { status: 400 })
        }
      }
      
      return {
        data: null,
        error: NextResponse.json({
          error: 'Erreur de validation',
          code: 'VALIDATION_FAILED'
        }, { status: 400 })
      }
    }
  }
}

// Helper pour valider les query parameters
export function validateQueryParams<T extends z.ZodSchema>(
  request: NextRequest,
  schema: T
): { data: z.infer<T> | null; error: NextResponse | null } {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    const validatedParams = schema.parse(params)
    
    return { data: validatedParams, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        data: null,
        error: NextResponse.json({
          error: 'Paramètres de requête invalides',
          code: 'INVALID_QUERY_PARAMS',
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        }, { status: 400 })
      }
    }
    
    return {
      data: null,
      error: NextResponse.json({
        error: 'Erreur de validation des paramètres',
        code: 'QUERY_VALIDATION_FAILED'
      }, { status: 400 })
    }
  }
}

// Validation de fichiers
export function validateFileUpload(
  file: File,
  options: {
    maxSize?: number
    allowedTypes?: string[]
    allowedExtensions?: string[]
  } = {}
): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Taille
  const maxSize = options.maxSize || VALIDATION_LIMITS.FILE_MAX_SIZE
  if (file.size > maxSize) {
    errors.push(`Fichier trop volumineux (max ${Math.round(maxSize / 1024 / 1024)}MB)`)
  }
  
  // Type MIME
  if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
    errors.push(`Type de fichier non autorisé: ${file.type}`)
  }
  
  // Extension
  if (options.allowedExtensions) {
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension || !options.allowedExtensions.includes(extension)) {
      errors.push(`Extension non autorisée: .${extension}`)
    }
  }
  
  // Nom de fichier
  if (file.name.length > 255) {
    errors.push('Nom de fichier trop long (max 255 caractères)')
  }
  
  // Caractères dangereux dans le nom
  if (!/^[a-zA-Z0-9._\-\s]+$/.test(file.name)) {
    errors.push('Nom de fichier contient des caractères non autorisés')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Sanitization helpers
export const sanitize = {
  html: (input: string): string => {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  },
  
  sql: (input: string): string => {
    return input.replace(/['";\\]/g, '')
  },
  
  alphanumeric: (input: string): string => {
    return input.replace(/[^a-zA-Z0-9]/g, '')
  },
  
  filename: (input: string): string => {
    return input.replace(/[^a-zA-Z0-9._\-]/g, '_')
  }
}

// Export types pour TypeScript
export type ValidationError = {
  field: string
  message: string
  received?: unknown
}

export type ValidationResult<T> = {
  data: T | null
  error: NextResponse | null
}

import { db, safeDbOperation } from './db'
import { ProductStatus, Language } from '../generated/prisma'

// Get products with translations (simplified query)
export async function getProducts(language: Language = Language.EN) {
  return safeDbOperation(async () => {
    return db.product.findMany({
      where: { 
        status: ProductStatus.ACTIVE,
        deletedAt: null 
      },
      include: {
        translations: {
          where: { language }
        },
        variants: {
          where: { deletedAt: null },
          include: {
            media: {
              where: { isPrimary: true }
            }
          }
        }
      }
    })
  })
}

// Get single product with all details
export async function getProductBySlug(slug: string, language: Language = Language.EN) {
  return safeDbOperation(async () => {
    return db.product.findUnique({
      where: { slug },
      include: {
        translations: { where: { language } },
        categories: {
          include: {
            category: {
              include: {
                translations: { where: { language } }
              }
            }
          }
        },
        variants: {
          where: { deletedAt: null },
          include: {
            media: true,
            attributeValues: {
              include: {
                attributeValue: {
                  include: { attribute: true }
                }
              }
            }
          }
        },
        reviews: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    })
  })
}

// Search products by name (simplified)
export async function searchProducts(query: string, language: Language = Language.EN) {
  return safeDbOperation(async () => {
    return db.product.findMany({
      where: {
        status: ProductStatus.ACTIVE,
        deletedAt: null,
        translations: {
          some: {
            language,
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } }
            ]
          }
        }
      },
      include: {
        translations: { where: { language } },
        variants: {
          where: { deletedAt: null },
          take: 1,
          include: {
            media: { where: { isPrimary: true } }
          }
        }
      }
    })
  })
}

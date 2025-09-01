import { db, safeDbOperation } from './db'
import { ProductStatus, Language } from '../generated/prisma'
import { productSummary, productDetail } from './prisma/selectors'
import { SITE_CONFIG } from './config'

// Get products with translations (simplified query)
export async function getProducts(language: Language = SITE_CONFIG.DEFAULT_LANGUAGE) {
  return safeDbOperation(async () => {
    return db.product.findMany(productSummary(language))
  })
}

// Get single product with all details
export async function getProductBySlug(slug: string, language: Language = Language.EN) {
  return safeDbOperation(async () => {
    return db.product.findUnique({
      where: { slug },
      ...productDetail(language)
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

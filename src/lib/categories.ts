import { db, safeDbOperation } from './db'
import { Language } from '../generated/prisma'

// Get all categories with translations
export async function getCategories(language: Language = Language.EN) {
  return safeDbOperation(async () => {
    return db.category.findMany({
      where: { deletedAt: null },
      include: {
        translations: {
          where: { language }
        },
        products: {
          include: {
            product: {
              include: {
                variants: {
                  where: { deletedAt: null },
                  take: 1
                }
              }
            }
          },
          where: {
            product: {
              status: 'ACTIVE',
              deletedAt: null
            }
          }
        }
      }
    })
  })
}

// Get category by slug with products
export async function getCategoryBySlug(slug: string, language: Language = Language.EN) {
  return safeDbOperation(async () => {
    return db.category.findUnique({
      where: { slug },
      include: {
        translations: { where: { language } },
        products: {
          include: {
            product: {
              include: {
                translations: { where: { language } },
                variants: {
                  where: { deletedAt: null },
                  include: {
                    media: { where: { isPrimary: true } }
                  }
                }
              }
            }
          },
          where: {
            product: {
              status: 'ACTIVE',
              deletedAt: null
            }
          }
        }
      }
    })
  })
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { db, safeDbOperation } from '../../../lib/db'
import { ProductStatus, Language, MediaType } from '../../../generated/prisma'

// POST /api/test-data - Create test data
export async function POST() {
  const result = await safeDbOperation(async () => {
    // Vérifier si des données existent déjà
    const existingProduct = await db.product.findFirst({
      where: { slug: 'iphone-15' }
    })
    
    if (existingProduct) {
      return { message: 'Données de test déjà créées !' }
    }

    // Créer des catégories
    const category = await db.category.create({
      data: {
        slug: 'electronics',
        translations: {
          create: [
            { language: Language.FR, name: 'Électronique', description: 'Produits électroniques' },
            { language: Language.EN, name: 'Electronics', description: 'Electronic products' },
            { language: Language.ES, name: 'Electrónicos', description: 'Productos electrónicos' }
          ]
        }
      }
    })

    // Créer un produit avec variantes
    const product = await db.product.create({
      data: {
        slug: 'iphone-15',
        status: ProductStatus.ACTIVE,
        translations: {
          create: [
            { language: Language.FR, name: 'iPhone 15', description: 'Le nouveau iPhone 15 avec puce A17 Pro' },
            { language: Language.EN, name: 'iPhone 15', description: 'The new iPhone 15 with A17 Pro chip' },
            { language: Language.ES, name: 'iPhone 15', description: 'El nuevo iPhone 15 con chip A17 Pro' }
          ]
        },
        categories: {
          create: { categoryId: category.id }
        },
        variants: {
          create: [
            {
              sku: 'IPHONE15-128-BLACK',
              price: 1199.99,
              currency: 'CAD',
              stock: 50,
              media: {
                create: {
                  url: '/images/iphone15-black.jpg',
                  type: MediaType.IMAGE,
                  alt: 'iPhone 15 Noir',
                  isPrimary: true
                }
              }
            },
            {
              sku: 'IPHONE15-256-WHITE',
              price: 1399.99,
              currency: 'CAD',
              stock: 30,
              media: {
                create: {
                  url: '/images/iphone15-white.jpg',
                  type: MediaType.IMAGE,
                  alt: 'iPhone 15 Blanc',
                  isPrimary: true
                }
              }
            }
          ]
        }
      }
    })

    // Créer un utilisateur test
    const user = await db.user.create({
      data: {
        email: 'demo@ecommerce.com',
        name: 'Utilisateur Demo',
        addresses: {
          create: {
            street: '123 Rue Saint-Denis',
            city: 'Montréal',
            state: 'QC',
            zipCode: 'H3B 1A1',
            country: 'CA',
            type: 'BOTH',
            isDefault: true
          }
        }
      }
    })

    return { 
      category: category.id,
      product: product.id,
      user: user.id,
      message: 'Données de test créées avec succès !',
      instructions: {
        testEndpoints: [
          'GET /api/products?language=FR',
          'GET /api/categories/electronics?language=EN',
          `GET /api/cart/${user.id}`,
          `POST /api/cart/${user.id} avec { "variantId": "..." }`
        ]
      }
    }
  })

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({ data: result.data })
}

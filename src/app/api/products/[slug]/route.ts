export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getProductBySlug } from '../../../../lib/products'
import { Language } from '../../../../generated/prisma'
import { db } from '@/lib/db'

// GET /api/products/[slug] - Produit par slug ou ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const { searchParams } = new URL(request.url)
  const language = (searchParams.get('language') as Language) || Language.FR

  try {
    // Check if slug is actually a CUID (ID format)
    const isId = slug.match(/^c[a-z0-9]{24}$/)
    
    if (isId) {
      // Handle ID lookup
      const product = await db.product.findUnique({
        where: { 
          id: slug,
          status: 'ACTIVE',
          deletedAt: null 
        },
        include: {
          translations: {
            where: { language },
            select: {
              language: true,
              name: true,
              description: true
            }
          },
          variants: {
            include: {
              media: {
                orderBy: [
                  { isPrimary: 'desc' },
                  { id: 'asc' }
                ],
                select: {
                  id: true,
                  url: true,
                  alt: true,
                  isPrimary: true
                }
              },
              attributeValues: {
                include: {
                  attributeValue: {
                    include: {
                      attribute: {
                        select: {
                          name: true
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          categories: {
            include: {
              category: {
                include: {
                  translations: {
                    where: { language },
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      if (!product) {
        return NextResponse.json({ 
          error: 'Produit non trouvé' 
        }, { status: 404 })
      }

      // If no translation found for the requested language, try to get any translation
      if (product.translations.length === 0) {
        const anyTranslation = await db.productTranslation.findFirst({
          where: { productId: slug },
          select: {
            language: true,
            name: true,
            description: true
          }
        })
        
        if (anyTranslation) {
          product.translations = [anyTranslation]
        }
      }

      // Format the response
      const formattedProduct = {
        id: product.id,
        slug: product.slug,
        status: product.status,
        createdAt: product.createdAt,
        translations: product.translations,
        variants: product.variants.map(variant => ({
          id: variant.id,
          sku: variant.sku,
          price: variant.price,
          currency: variant.currency,
          stock: variant.stock,
          media: variant.media,
          attributes: variant.attributeValues.map(av => ({
            name: av.attributeValue.attribute.name,
            value: av.attributeValue.value
          }))
        })),
        categories: product.categories.map(pc => ({
          id: pc.category.id,
          name: pc.category.translations[0]?.name || 'Catégorie'
        }))
      }

      return NextResponse.json({ 
        data: formattedProduct 
      })
    } else {
      // Handle slug lookup (original logic)
      const result = await getProductBySlug(slug, language)
      
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 500 })
      }

      if (!result.data) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }

      return NextResponse.json({ data: result.data })
    }
  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

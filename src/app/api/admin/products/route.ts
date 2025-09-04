import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { isUserAdmin } from "@/lib/auth-admin"
import { z } from "zod"

const CreateProductSchema = z.object({
  slug: z.string().min(1),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"]).default("DRAFT"),
  translations: z.array(z.object({
    language: z.enum(["FR", "EN", "ES", "DE", "IT"]),
    name: z.string().min(1),
    description: z.string().optional(),
  })),
  categories: z.array(z.string()).optional(),
  variants: z.array(z.object({
    sku: z.string().min(1),
    price: z.number().positive(),
    currency: z.string().default("CAD"),
    stock: z.number().int().min(0).default(0),
    attributes: z.array(z.object({
      attributeName: z.string(),
      value: z.string()
    })).optional(),
    media: z.array(z.object({
      url: z.string(),
      type: z.enum(["IMAGE", "VIDEO", "DOCUMENT"]).default("IMAGE"),
      alt: z.string().optional(),
      isPrimary: z.boolean().default(false)
    })).optional()
  }))
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const isAdmin = await isUserAdmin(session.user.email)
    if (!isAdmin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = CreateProductSchema.parse(body)

    // Create product with transaction
    const product = await db.$transaction(async (tx) => {
      // Create product
      const newProduct = await tx.product.create({
        data: {
          slug: validatedData.slug,
          status: validatedData.status,
        }
      })

      // Create translations
      if (validatedData.translations.length > 0) {
        await tx.productTranslation.createMany({
          data: validatedData.translations.map(t => ({
            productId: newProduct.id,
            language: t.language,
            name: t.name,
            description: t.description,
          }))
        })
      }

      // Link categories
      if (validatedData.categories && validatedData.categories.length > 0) {
        await tx.productCategory.createMany({
          data: validatedData.categories.map(categoryId => ({
            productId: newProduct.id,
            categoryId,
          }))
        })
      }

      // Create variants
      for (const variant of validatedData.variants) {
        const newVariant = await tx.productVariant.create({
          data: {
            productId: newProduct.id,
            sku: variant.sku,
            price: variant.price,
            currency: variant.currency,
            stock: variant.stock,
          }
        })

        // Create variant attributes
        if (variant.attributes && variant.attributes.length > 0) {
          for (const attr of variant.attributes) {
            // Find or create attribute
            let attribute = await tx.productAttribute.findUnique({
              where: { name: attr.attributeName }
            })
            
            if (!attribute) {
              attribute = await tx.productAttribute.create({
                data: { name: attr.attributeName }
              })
            }

            // Find or create attribute value
            let attributeValue = await tx.productAttributeValue.findUnique({
              where: {
                attributeId_value: {
                  attributeId: attribute.id,
                  value: attr.value
                }
              }
            })

            if (!attributeValue) {
              attributeValue = await tx.productAttributeValue.create({
                data: {
                  attributeId: attribute.id,
                  value: attr.value
                }
              })
            }

            // Link to variant
            await tx.productVariantAttributeValue.create({
              data: {
                variantId: newVariant.id,
                attributeValueId: attributeValue.id
              }
            })
          }
        }

        // Create media
        if (variant.media && variant.media.length > 0) {
          await tx.productMedia.createMany({
            data: variant.media.map(m => ({
              variantId: newVariant.id,
              url: m.url,
              type: m.type,
              alt: m.alt,
              isPrimary: m.isPrimary,
            }))
          })
        }
      }

      return newProduct
    })

    return NextResponse.json({ 
      message: "Produit créé avec succès",
      productId: product.id 
    })

  } catch (error) {
    console.error('Create product error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Données invalides",
        details: error.issues 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: "Erreur lors de la création du produit" 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const isAdmin = await isUserAdmin(session.user.email)
    if (!isAdmin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    
    const skip = (page - 1) * limit

    const where = {
      deletedAt: null,
      ...(status && { status: status as any })
    }

    const products = await db.product.findMany({
      where,
      include: {
        translations: true,
        variants: {
          include: {
            media: {
              where: { isPrimary: true }
            }
          }
        },
        categories: {
          include: {
            category: {
              include: {
                translations: true
              }
            }
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    })

    const total = await db.product.count({ where })

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json({ 
      error: "Erreur lors de la récupération des produits" 
    }, { status: 500 })
  }
}

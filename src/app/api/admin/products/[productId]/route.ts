import { NextRequest, NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth-session"
import { db } from "@/lib/db"
import { isUserAdmin } from "@/lib/auth-admin"
import { z } from "zod"

const UpdateProductSchema = z.object({
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
  slug: z.string().min(1).optional(),
})

const FullUpdateProductSchema = z.object({
  slug: z.string().min(1, "Le slug est obligatoire"),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"]),
  translations: z.array(z.object({
    language: z.enum(["FR", "EN", "ES", "DE", "IT"]),
    name: z.string(),
    description: z.string(),
  })).min(1, "Au moins une traduction est requise")
    .refine(
      (translations) => {
        // Check each translation: if name OR description is filled, both must be filled
        const incompleteTranslations = translations.filter(t => {
          const hasName = t.name.trim().length > 0
          const hasDescription = t.description.trim().length > 0
          return (hasName && !hasDescription) || (!hasName && hasDescription)
        })
        return incompleteTranslations.length === 0
      },
      "Chaque traduction commencée doit être complète (nom + description)"
    )
    .refine(
      (translations) => translations.some(t => t.name.trim() && t.description.trim()),
      "Au moins une traduction complète (nom + description) est requise"
    ),
  variants: z.array(z.object({
    id: z.string(),
    sku: z.string().min(1, "Le SKU est obligatoire"),
    price: z.number().positive("Le prix doit être supérieur à 0"),
    currency: z.string().default("CAD"),
    stock: z.number().int().min(0).default(0),
  })).min(1, "Au moins une variante est requise")
    .refine(
      (variants) => variants.some(v => v.sku.trim() && v.price > 0),
      "Au moins une variante complète (SKU + prix > 0) est requise"
    )
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params
  
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const isAdmin = await isUserAdmin(session.user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = UpdateProductSchema.parse(body)

    const product = await db.product.update({
      where: { id: productId },
      data: validatedData,
      select: { 
        id: true, 
        slug: true, 
        status: true,
        translations: true
      }
    })

    return NextResponse.json({ 
      message: "Produit mis à jour avec succès",
      product 
    })

  } catch (error) {
    console.error('Update product error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Données invalides",
        details: error.issues 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: "Erreur lors de la mise à jour du produit" 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params
  
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const isAdmin = await isUserAdmin(session.user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    // Use soft delete by setting deletedAt timestamp
    const product = await db.product.update({
      where: { id: productId },
      data: { deletedAt: new Date() },
      select: { id: true, slug: true }
    })

    return NextResponse.json({ 
      message: "Produit supprimé avec succès",
      productId: product.id
    })

  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json({ 
      error: "Erreur lors de la suppression du produit" 
    }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params
  
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const isAdmin = await isUserAdmin(session.user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const product = await db.product.findUnique({
      where: { 
        id: productId,
        deletedAt: null 
      },
      include: {
        translations: true,
        variants: {
          include: {
            media: true,
            attributeValues: {
              include: {
                attributeValue: {
                  include: {
                    attribute: true
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
                translations: true
              }
            }
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 })
    }

    return NextResponse.json({ product })

  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json({ 
      error: "Erreur lors de la récupération du produit" 
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params
  
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const isAdmin = await isUserAdmin(session.user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = FullUpdateProductSchema.parse(body)

    // Update product with transaction
    const product = await db.$transaction(async (tx) => {
      // Update basic product info
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          slug: validatedData.slug,
          status: validatedData.status,
        }
      })

      // Delete existing translations and recreate them
      await tx.productTranslation.deleteMany({
        where: { productId }
      })

      // Create new translations (only complete ones)
      const completeTranslations = validatedData.translations.filter(t => 
        t.name.trim() && t.description.trim()
      )
      
      if (completeTranslations.length > 0) {
        await tx.productTranslation.createMany({
          data: completeTranslations.map(t => ({
            productId,
            language: t.language,
            name: t.name,
            description: t.description,
          }))
        })
      }

      // Update variants
      for (const variant of validatedData.variants) {
        await tx.productVariant.update({
          where: { id: variant.id },
          data: {
            sku: variant.sku,
            price: variant.price,
            currency: variant.currency,
            stock: variant.stock,
          }
        })
      }

      return updatedProduct
    })

    return NextResponse.json({ 
      message: "Produit mis à jour avec succès",
      productId: product.id 
    })

  } catch (error) {
    console.error('Full update product error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Données invalides",
        details: error.issues 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: "Erreur lors de la mise à jour complète du produit" 
    }, { status: 500 })
  }
}

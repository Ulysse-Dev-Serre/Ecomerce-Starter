import { NextRequest, NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth-session"
import { db } from "@/lib/db"
import { isUserAdmin } from "@/lib/auth-admin"
import { z } from "zod"

const UpdateStockSchema = z.object({
  stock: z.number().int().min(0, "Le stock doit être positif ou zéro")
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ variantId: string }> }
) {
  const { variantId } = await params
  
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
    const { stock } = UpdateStockSchema.parse(body)

    const variant = await db.productVariant.update({
      where: { id: variantId },
      data: { stock },
      select: { id: true, sku: true, stock: true }
    })

    return NextResponse.json({ 
      message: "Stock mis à jour avec succès",
      variant 
    })

  } catch (error) {
    console.error('Update stock error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Données invalides",
        details: error.issues 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: "Erreur lors de la mise à jour du stock" 
    }, { status: 500 })
  }
}

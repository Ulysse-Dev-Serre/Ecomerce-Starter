import { NextRequest, NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth-session"
import { db } from "@/lib/db"
import { isUserAdmin } from "@/lib/auth-admin"
import { z } from "zod"
import { unlink } from 'fs/promises'
import path from 'path'

const AddMediaSchema = z.object({
  url: z.string().min(1, "L'URL est obligatoire"),
  alt: z.string().optional(),
  isPrimary: z.boolean().default(false)
})

const UpdateMediaSchema = z.object({
  alt: z.string().optional(),
  isPrimary: z.boolean().optional()
})

// POST - Add media to variant
export async function POST(
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
    const { url, alt, isPrimary } = AddMediaSchema.parse(body)

    // If setting as primary, unset other primary images for this variant
    if (isPrimary) {
      await db.productMedia.updateMany({
        where: { 
          variantId,
          isPrimary: true 
        },
        data: { isPrimary: false }
      })
    }

    const media = await db.productMedia.create({
      data: {
        variantId,
        url,
        type: "IMAGE",
        alt: alt || "",
        isPrimary
      }
    })

    return NextResponse.json({ 
      message: "Média ajouté avec succès",
      media 
    })

  } catch (error) {
    console.error('Add media error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Données invalides",
        details: error.issues 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: "Erreur lors de l'ajout du média" 
    }, { status: 500 })
  }
}

// GET - Get all media for variant
export async function GET(
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

    const media = await db.productMedia.findMany({
      where: { variantId },
      orderBy: [
        { isPrimary: 'desc' },
        { id: 'asc' }
      ]
    })

    return NextResponse.json({ media })

  } catch (error) {
    console.error('Get media error:', error)
    return NextResponse.json({ 
      error: "Erreur lors de la récupération des médias" 
    }, { status: 500 })
  }
}

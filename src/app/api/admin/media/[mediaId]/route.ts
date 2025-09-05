import { NextRequest, NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth-session"
import { db } from "@/lib/db"
import { isUserAdmin } from "@/lib/auth-admin"
import { z } from "zod"
import { unlink } from 'fs/promises'
import path from 'path'

const UpdateMediaSchema = z.object({
  alt: z.string().optional(),
  isPrimary: z.boolean().optional()
})

// PATCH - Update media
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  const { mediaId } = await params
  
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
    const { alt, isPrimary } = UpdateMediaSchema.parse(body)

    // Get current media to check variant
    const currentMedia = await db.productMedia.findUnique({
      where: { id: mediaId },
      select: { variantId: true }
    })

    if (!currentMedia) {
      return NextResponse.json({ error: "Média non trouvé" }, { status: 404 })
    }

    // If setting as primary, unset other primary images for this variant
    if (isPrimary === true) {
      await db.productMedia.updateMany({
        where: { 
          variantId: currentMedia.variantId,
          isPrimary: true,
          id: { not: mediaId }
        },
        data: { isPrimary: false }
      })
    }

    const media = await db.productMedia.update({
      where: { id: mediaId },
      data: {
        ...(alt !== undefined && { alt }),
        ...(isPrimary !== undefined && { isPrimary })
      }
    })

    return NextResponse.json({ 
      message: "Média mis à jour avec succès",
      media 
    })

  } catch (error) {
    console.error('Update media error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Données invalides",
        details: error.issues 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: "Erreur lors de la mise à jour du média" 
    }, { status: 500 })
  }
}

// DELETE - Delete media
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  const { mediaId } = await params
  
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const isAdmin = await isUserAdmin(session.user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    // Get media info before deletion
    const media = await db.productMedia.findUnique({
      where: { id: mediaId },
      select: { url: true, variantId: true, isPrimary: true }
    })

    if (!media) {
      return NextResponse.json({ error: "Média non trouvé" }, { status: 404 })
    }

    // Delete from database
    await db.productMedia.delete({
      where: { id: mediaId }
    })

    // Try to delete physical file (ignore errors if file doesn't exist)
    try {
      if (media.url.startsWith('/uploads/')) {
        const filepath = path.join(process.cwd(), 'public', media.url)
        await unlink(filepath)
      }
    } catch (fileError) {
      console.warn('Could not delete physical file:', fileError)
      // Don't fail the request if file deletion fails
    }

    // If deleted media was primary, set first remaining image as primary
    if (media.isPrimary) {
      const remainingMedia = await db.productMedia.findFirst({
        where: { variantId: media.variantId },
        orderBy: { id: 'asc' }
      })

      if (remainingMedia) {
        await db.productMedia.update({
          where: { id: remainingMedia.id },
          data: { isPrimary: true }
        })
      }
    }

    return NextResponse.json({ 
      message: "Média supprimé avec succès"
    })

  } catch (error) {
    console.error('Delete media error:', error)
    return NextResponse.json({ 
      error: "Erreur lors de la suppression du média" 
    }, { status: 500 })
  }
}

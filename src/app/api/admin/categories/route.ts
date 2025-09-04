import { NextRequest, NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth-session"
import { db } from "@/lib/db"
import { isUserAdmin } from "@/lib/auth-admin"

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const isAdmin = await isUserAdmin(session.user.email)
    if (!isAdmin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const categories = await db.category.findMany({
      where: {
        deletedAt: null
      },
      include: {
        translations: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ categories })

  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json({ 
      error: "Erreur lors de la récupération des catégories" 
    }, { status: 500 })
  }
}

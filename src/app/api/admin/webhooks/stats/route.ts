import { NextRequest, NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth-session"
import { isUserAdmin } from "@/lib/auth-admin"
import { getWebhookStats, cleanupOldWebhookEvents } from "@/lib/webhook-security"

// GET /api/admin/webhooks/stats - Statistiques des événements webhook
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const isAdmin = await isUserAdmin(session.user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const stats = await getWebhookStats()

    return NextResponse.json({
      stats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Get webhook stats error:', error)
    return NextResponse.json({ 
      error: "Erreur lors de la récupération des statistiques" 
    }, { status: 500 })
  }
}

// DELETE /api/admin/webhooks/stats - Nettoyer les anciens événements
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const isAdmin = await isUserAdmin(session.user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    if (days < 1 || days > 365) {
      return NextResponse.json({ 
        error: "Paramètre 'days' invalide (1-365)" 
      }, { status: 400 })
    }

    const deletedCount = await cleanupOldWebhookEvents(days)

    return NextResponse.json({
      message: "Nettoyage effectué avec succès",
      deletedEvents: deletedCount,
      olderThanDays: days
    })

  } catch (error) {
    console.error('Webhook cleanup error:', error)
    return NextResponse.json({ 
      error: "Erreur lors du nettoyage" 
    }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { getAuthSession } from '../../../../lib/auth-session'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  // Security check: Verify user is authenticated
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  try {
    // Find order and verify ownership
    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: true,
        payments: true,
        shipments: true
      }
    })
    
    if (!order) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 })
    }
    
    // Security check: Verify user owns this order
    if (order.userId !== session.user.id) {
      console.warn('Access denied: User attempted to access unauthorized order', { timestamp: new Date().toISOString() })
      return NextResponse.json({ error: 'Accès refusé - vous ne pouvez accéder qu\'à vos propres commandes' }, { status: 403 })
    }
    
    return NextResponse.json({ data: order })
  } catch (error) {
    console.error('Get order error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

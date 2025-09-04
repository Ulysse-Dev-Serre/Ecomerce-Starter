export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '../../../../../lib/auth-session'
import { getUserOrders } from '../../../../../lib/orders'

// GET /api/users/[id]/orders - Récupérer les commandes d'un utilisateur
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  // Security check: Verify user is authenticated and accessing their own orders
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  if (session.user.id !== id) {
    return NextResponse.json({ error: 'Accès refusé - vous ne pouvez accéder qu\'à vos propres commandes' }, { status: 403 })
  }
  
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    const result = await getUserOrders(id, limit, offset)
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ 
      data: result.data,
      count: result.data?.length || 0,
      pagination: { limit, offset }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

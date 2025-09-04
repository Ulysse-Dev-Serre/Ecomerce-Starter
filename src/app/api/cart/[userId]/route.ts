export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '../../../../lib/auth-session'
import { getOrCreateActiveCart, addToCart } from '../../../../lib/cart'

// GET /api/cart/[userId] - Get user cart
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  
  // Security check: Verify user is authenticated and accessing their own cart
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  if (session.user.id !== userId) {
    console.warn('Access denied: User attempted to access unauthorized cart', { timestamp: new Date().toISOString() })
    return NextResponse.json({ error: 'Accès refusé - vous ne pouvez accéder qu\'à votre propre panier' }, { status: 403 })
  }
  
  try {
    const result = await getOrCreateActiveCart(userId)
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ data: result.data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/cart/[userId] - Add item to cart
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  
  // Security check: Verify user is authenticated and accessing their own cart
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  if (session.user.id !== userId) {
    console.warn('Access denied: User attempted to modify unauthorized cart', { timestamp: new Date().toISOString() })
    return NextResponse.json({ error: 'Accès refusé - vous ne pouvez ajouter des articles qu\'à votre propre panier' }, { status: 403 })
  }
  
  try {
    const body = await request.json()
    const { variantId, quantity = 1 } = body

    if (!variantId) {
      return NextResponse.json({ error: 'variantId is required' }, { status: 400 })
    }

    if (quantity <= 0) {
      return NextResponse.json({ error: 'quantity must be positive' }, { status: 400 })
    }

    const result = await addToCart(userId, variantId, quantity)
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ data: result.data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

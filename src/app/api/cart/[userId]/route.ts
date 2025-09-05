export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '../../../../lib/auth-session'
import { getOrCreateActiveCart, addToCart } from '../../../../lib/cart'
import { withRateLimit } from '../../../../lib/rate-limit-middleware'
import { createValidationMiddleware, ValidationSchemas } from '../../../../lib/validation'

// GET /api/cart/[userId] - Get user cart
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  // Appliquer rate limiting pour les opérations cart
  const rateLimitResponse = await withRateLimit(request, { type: 'cart' })
  if (rateLimitResponse) return rateLimitResponse
  
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
  // Appliquer rate limiting pour les opérations cart
  const rateLimitResponse = await withRateLimit(request, { type: 'cart' })
  if (rateLimitResponse) return rateLimitResponse
  
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
    // Validation stricte des données d'entrée
    const validateCart = createValidationMiddleware('addToCart', { logErrors: true })
    const { data: validatedData, error: validationError } = await validateCart(request)
    
    if (validationError) {
      return validationError
    }
    
    if (!validatedData) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const result = await addToCart(userId, validatedData.variantId, validatedData.quantity)
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ data: result.data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

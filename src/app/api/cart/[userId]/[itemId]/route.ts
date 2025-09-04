export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '../../../../../lib/auth-session'
import { db, safeDbOperation } from '../../../../../lib/db'

// DELETE /api/cart/[userId]/[itemId] - Supprimer un item du panier
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; itemId: string }> }
) {
  const { userId, itemId } = await params
  
  // Security check: Verify user is authenticated and accessing their own cart
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  if (session.user.id !== userId) {
    console.warn('Access denied: User attempted to delete unauthorized cart item', { timestamp: new Date().toISOString() })
    return NextResponse.json({ error: 'Accès refusé - vous ne pouvez supprimer que vos propres articles' }, { status: 403 })
  }
  
  try {
    const result = await safeDbOperation(async () => {
      // Vérifier que l'item appartient bien au panier de l'utilisateur
      const cartItem = await db.cartItem.findFirst({
        where: {
          id: itemId,
          cart: {
            userId,
            status: 'ACTIVE'
          }
        }
      })

      if (!cartItem) {
        throw new Error('Item not found in user cart')
      }

      // Supprimer l'item
      return db.cartItem.delete({
        where: { id: itemId }
      })
    })
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ message: 'Item removed from cart' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/cart/[userId]/[itemId] - Modifier la quantité d'un item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; itemId: string }> }
) {
  const { userId, itemId } = await params
  
  // Security check: Verify user is authenticated and accessing their own cart
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  if (session.user.id !== userId) {
    console.warn('Access denied: User attempted to modify unauthorized cart item', { timestamp: new Date().toISOString() })
    return NextResponse.json({ error: 'Accès refusé - vous ne pouvez modifier que vos propres articles' }, { status: 403 })
  }
  
  try {
    const body = await request.json()
    const { quantity } = body

    if (!quantity || quantity <= 0) {
      return NextResponse.json({ error: 'Quantity must be positive' }, { status: 400 })
    }

    const result = await safeDbOperation(async () => {
      // Vérifier que l'item appartient bien au panier de l'utilisateur
      const cartItem = await db.cartItem.findFirst({
        where: {
          id: itemId,
          cart: {
            userId,
            status: 'ACTIVE'
          }
        }
      })

      if (!cartItem) {
        throw new Error('Item not found in user cart')
      }

      // Mettre à jour la quantité
      return db.cartItem.update({
        where: { id: itemId },
        data: { quantity }
      })
    })
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ data: result.data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

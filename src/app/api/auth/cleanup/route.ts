export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { db, safeDbOperation } from '../../../../lib/db'

// POST /api/auth/cleanup - Nettoyer les comptes de test (development only)
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const result = await safeDbOperation(async () => {
      // Find user by email
      const user = await db.user.findUnique({
        where: { email },
        include: {
          accounts: true,
          sessions: true,
          carts: { include: { items: true } },
          orders: true
        }
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Delete related data in correct order
      await db.cartItem.deleteMany({
        where: { cart: { userId: user.id } }
      })
      
      await db.cart.deleteMany({
        where: { userId: user.id }
      })

      await db.session.deleteMany({
        where: { userId: user.id }
      })

      await db.account.deleteMany({
        where: { userId: user.id }
      })

      await db.user.delete({
        where: { id: user.id }
      })

      return { message: `User ${email} and all related data deleted` }
    })

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ data: result.data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

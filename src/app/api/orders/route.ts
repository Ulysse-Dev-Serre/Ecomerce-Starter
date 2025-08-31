import { NextRequest, NextResponse } from 'next/server'
import { createOrderFromCart } from '../../../lib/orders'

// POST /api/orders - Créer une commande depuis le panier
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, shippingAddress, billingAddress } = body

    if (!userId || !shippingAddress || !billingAddress) {
      return NextResponse.json(
        { error: 'userId, shippingAddress, and billingAddress are required' },
        { status: 400 }
      )
    }

    const result = await createOrderFromCart(userId, shippingAddress, billingAddress)
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ data: result.data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

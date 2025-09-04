export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '../../../../../lib/auth-session'
import { addUserAddress } from '../../../../../lib/users'

// POST /api/users/[id]/addresses - Ajouter une adresse
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  // Security check: Verify user is authenticated and adding address to their own account
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  if (session.user.id !== id) {
    return NextResponse.json({ error: 'Accès refusé - vous ne pouvez ajouter des adresses qu\'à votre propre compte' }, { status: 403 })
  }
  
  try {
    const body = await request.json()
    const { street, city, state, zipCode, country, type, isDefault } = body

    if (!street || !city || !zipCode || !country) {
      return NextResponse.json(
        { error: 'street, city, zipCode, and country are required' },
        { status: 400 }
      )
    }

    const result = await addUserAddress(id, {
      street,
      city,
      state,
      zipCode,
      country,
      type,
      isDefault
    })
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ data: result.data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

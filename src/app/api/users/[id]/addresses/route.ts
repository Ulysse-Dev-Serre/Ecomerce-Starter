import { NextRequest, NextResponse } from 'next/server'
import { addUserAddress } from '../../../../../lib/users'

// POST /api/users/[id]/addresses - Ajouter une adresse
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

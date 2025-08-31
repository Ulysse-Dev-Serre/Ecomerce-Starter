export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '../../../lib/users'

// POST /api/users - Créer un utilisateur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, role } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const result = await createUser({ email, name, role })
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ data: result.data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

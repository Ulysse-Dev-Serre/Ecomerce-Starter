export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '../../../../lib/auth-session'
import { getUserById, updateUser } from '../../../../lib/users'

// GET /api/users/[id] - Récupérer un utilisateur
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  // Security check: Verify user is authenticated and accessing their own data
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  if (session.user.id !== id) {
    console.warn('Access denied: User attempted to access unauthorized profile', { timestamp: new Date().toISOString() })
    return NextResponse.json({ error: 'Accès refusé - vous ne pouvez accéder qu\'à votre propre profil' }, { status: 403 })
  }
  
  try {
    const result = await getUserById(id)
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    if (!result.data) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ data: result.data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/users/[id] - Modifier un utilisateur
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  // Security check: Verify user is authenticated and modifying their own data
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  if (session.user.id !== id) {
    console.warn('Access denied: User attempted to modify unauthorized profile', { timestamp: new Date().toISOString() })
    return NextResponse.json({ error: 'Accès refusé - vous ne pouvez modifier que votre propre profil' }, { status: 403 })
  }
  
  try {
    const body = await request.json()
    const { name, email } = body

    const result = await updateUser(id, { name, email })
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ data: result.data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

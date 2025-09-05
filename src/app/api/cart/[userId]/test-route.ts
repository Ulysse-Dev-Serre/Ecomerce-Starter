/**
 * Version de test de l'endpoint cart avec support authentification de test
 * Utilisé uniquement pour les tests E2E en développement
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '../../../../lib/auth-session'
import { getOrCreateActiveCart } from '../../../../lib/cart'
import { 
  getTestAuthFromHeaders, 
  getAuthSessionWithTestSupport,
  logSecurityEvent 
} from '../../../../lib/test-auth-middleware'

// Cette route n'existe qu'en développement pour les tests
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  // Sécurité: seulement en développement
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 })
  }
  
  const { userId } = await params
  
  try {
    // Utiliser l'authentification avec support test
    const session = await getAuthSessionWithTestSupport(request, getAuthSession)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    
    // Vérification ownership (même logique que la vraie route)
    if (session.user.id !== userId) {
      // Log sécurisé de la violation
      logSecurityEvent('ownership_violation', {
        userId: session.user.id,
        requestedResource: `/api/cart/${userId}`,
        timestamp: new Date().toISOString()
      })
      
      return NextResponse.json({ 
        error: 'Accès refusé - vous ne pouvez accéder qu\'à votre propre panier' 
      }, { status: 403 })
    }
    
    // Si tout est OK, simuler la récupération du panier
    const mockCart = {
      id: `cart-${userId}`,
      userId: userId,
      status: 'ACTIVE',
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    return NextResponse.json({ data: mockCart })
    
  } catch (error) {
    console.error('Test cart error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST pour tester l'ajout au panier
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 })
  }
  
  const { userId } = await params
  
  try {
    const session = await getAuthSessionWithTestSupport(request, getAuthSession)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    
    if (session.user.id !== userId) {
      logSecurityEvent('ownership_violation', {
        userId: session.user.id,
        requestedResource: `/api/cart/${userId}`,
        timestamp: new Date().toISOString()
      })
      
      return NextResponse.json({ 
        error: 'Accès refusé - vous ne pouvez ajouter des articles qu\'à votre propre panier' 
      }, { status: 403 })
    }
    
    // Simuler ajout réussi
    const body = await request.json().catch(() => ({}))
    
    return NextResponse.json({ 
      message: 'Article ajouté au panier (test)',
      cartId: `cart-${userId}`,
      item: body
    })
    
  } catch (error) {
    console.error('Test cart POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

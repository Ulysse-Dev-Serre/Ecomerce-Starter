export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '../../../../lib/auth-session'
import { authLimiter, cartLimiter, generalLimiter } from '../../../../lib/rate-limit'

// GET /api/admin/rate-limit-stats - Obtenir les statistiques de rate limiting
export async function GET(request: NextRequest) {
  // Vérifier les permissions admin
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // Vérifier l'accès admin - utiliser l'email ou une autre logique
  // Pour cette démo, on utilise juste la connexion (en dev seulement)
  // En production, implémenter une vraie vérification d'admin

  // En développement seulement
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Non disponible en production' }, { status: 403 })
  }

  try {
    const url = new URL(request.url)
    const identifier = url.searchParams.get('identifier')
    
    if (identifier) {
      // Statistiques pour un identifiant spécifique
      const authStats = authLimiter.getStats(identifier)
      const cartStats = cartLimiter.getStats(identifier)
      const generalStats = generalLimiter.getStats(identifier)
      
      return NextResponse.json({
        identifier,
        stats: {
          auth: authStats,
          cart: cartStats,
          general: generalStats
        }
      })
    }
    
    // Statistiques globales (limitées pour éviter d'exposer trop de données)
    return NextResponse.json({
      message: 'Rate limiting actif',
      config: {
        auth: {
          windowMs: 15 * 60 * 1000,
          max: 5,
          blockDuration: 30 * 60 * 1000
        },
        cart: {
          windowMs: 60 * 1000,
          max: 30,
          blockDuration: 5 * 60 * 1000
        },
        general: {
          windowMs: 60 * 1000,
          max: 100,
          blockDuration: 60 * 1000
        }
      },
      note: 'Utilisez ?identifier=IP:EMAIL pour voir les stats d\'un client spécifique'
    })
    
  } catch (error) {
    console.error('Erreur lors de la récupération des stats rate limiting:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

// DELETE /api/admin/rate-limit-stats - Reset les compteurs (dev seulement)
export async function DELETE(request: NextRequest) {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 })
  }

  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Non disponible en production' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { identifier, type } = body
    
    if (!identifier) {
      return NextResponse.json({ error: 'Identifiant requis' }, { status: 400 })
    }
    
    // Reset selon le type spécifié
    switch (type) {
      case 'auth':
        authLimiter.reset(identifier)
        break
      case 'cart':
        cartLimiter.reset(identifier)
        break
      case 'general':
        generalLimiter.reset(identifier)
        break
      case 'all':
        authLimiter.reset(identifier)
        cartLimiter.reset(identifier)
        generalLimiter.reset(identifier)
        break
      default:
        return NextResponse.json({ error: 'Type invalide (auth|cart|general|all)' }, { status: 400 })
    }
    
    return NextResponse.json({ 
      message: `Rate limiting reseté pour ${identifier} (type: ${type})` 
    })
    
  } catch (error) {
    console.error('Erreur lors du reset rate limiting:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

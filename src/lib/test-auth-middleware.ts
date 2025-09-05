/**
 * Middleware d'authentification pour les tests E2E
 * 
 * AVERTISSEMENT: Ce middleware N'EST ACTIF QU'EN DÉVELOPPEMENT
 * Il permet de simuler l'authentification via des headers HTTP pour les tests automatisés
 */

import { NextRequest } from 'next/server'

// Interface pour les données utilisateur de test
export interface TestUser {
  id: string
  email: string
  name: string
  role: 'USER' | 'ADMIN'
}

/**
 * Extrait les données d'authentification de test depuis les headers HTTP
 * Utilisé uniquement pour les tests E2E en développement
 */
export function getTestAuthFromHeaders(request: NextRequest): TestUser | null {
  // SÉCURITÉ: Seulement en développement
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  // Vérifier si les headers de test sont présents
  const testUserId = request.headers.get('X-Test-User-Id')
  const testUserEmail = request.headers.get('X-Test-User-Email') 
  const testUserRole = request.headers.get('X-Test-User-Role')

  if (!testUserId || !testUserEmail || !testUserRole) {
    return null
  }

  // Validation basique des données de test
  if (!testUserId.startsWith('test-user-') || 
      !testUserEmail.includes('@testauth.local') ||
      !['USER', 'ADMIN'].includes(testUserRole)) {
    console.warn('Invalid test auth headers:', { testUserId, testUserEmail, testUserRole })
    return null
  }

  return {
    id: testUserId,
    email: testUserEmail,
    name: testUserEmail.split('@')[0],
    role: testUserRole as 'USER' | 'ADMIN'
  }
}

/**
 * Middleware pour simuler getAuthSession en mode test
 * Remplace temporairement l'authentification NextAuth pour les tests
 */
export function createTestAuthSession(testUser: TestUser) {
  return {
    user: {
      id: testUser.id,
      email: testUser.email,
      name: testUser.name,
      // Note: Dans la vraie session NextAuth, il n'y a pas de 'role'
      // Mais pour les tests, on peut l'ajouter
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h
  }
}

/**
 * Wrapper pour les fonctions d'authentification qui supporte les tests
 * Utilise les headers de test en développement, sinon NextAuth normal
 */
export async function getAuthSessionWithTestSupport(request: NextRequest, originalGetSession: () => Promise<any>) {
  // En développement, vérifier d'abord les headers de test
  if (process.env.NODE_ENV === 'development') {
    const testUser = getTestAuthFromHeaders(request)
    if (testUser) {
      console.log(`🧪 Test auth: ${testUser.name} (${testUser.role})`)
      return createTestAuthSession(testUser)
    }
  }

  // Sinon, utiliser l'authentification normale
  return await originalGetSession()
}

/**
 * Wrapper pour isUserAdmin qui supporte les tests  
 */
export async function isUserAdminWithTestSupport(
  request: NextRequest, 
  userId: string,
  originalIsAdmin: (userId: string) => Promise<boolean>
): Promise<boolean> {
  // En développement, vérifier si c'est un test avec header admin
  if (process.env.NODE_ENV === 'development') {
    const testUser = getTestAuthFromHeaders(request)
    if (testUser && testUser.id === userId) {
      return testUser.role === 'ADMIN'
    }
  }

  // Sinon, utiliser la vérification normale
  return await originalIsAdmin(userId)
}

/**
 * Utilitaire pour les tests: créer des utilisateurs de test standards
 */
export const TestUsers = {
  regularUser: {
    id: 'test-user-regular-001',
    email: 'user.regular@testauth.local',
    name: 'Regular User',
    role: 'USER' as const
  },
  
  otherUser: {
    id: 'test-user-other-002',
    email: 'user.other@testauth.local', 
    name: 'Other User',
    role: 'USER' as const
  },
  
  adminUser: {
    id: 'test-user-admin-003',
    email: 'admin@testauth.local',
    name: 'Admin User', 
    role: 'ADMIN' as const
  }
}

/**
 * Log sécurisé pour les tests d'accès
 * Ne logue que les informations nécessaires sans exposer de données sensibles
 */
export function logSecurityEvent(
  event: 'ownership_violation' | 'unauthorized_access' | 'admin_access_denied',
  details: {
    userId?: string
    requestedResource?: string
    userAgent?: string
    timestamp?: string
  }
) {
  // En développement, log pour debugging
  if (process.env.NODE_ENV === 'development') {
    console.warn(`🚨 Security Event: ${event}`, {
      timestamp: details.timestamp || new Date().toISOString(),
      userId: details.userId ? 'user-***' + details.userId.slice(-3) : 'anonymous',
      resource: details.requestedResource,
      // Note: userAgent volontairement omis pour éviter fingerprinting
    })
  }
  
  // En production, utiliser un vrai système de logging sécurisé
  if (process.env.NODE_ENV === 'production') {
    // TODO: Intégrer avec système de logging (Winston, etc.)
    // logger.warn('security_event', { event, userId: hashUserId(details.userId) })
  }
}

/**
 * Helper pour les tests: vérifier qu'une réponse d'erreur est appropriée
 */
export function validateSecurityResponse(response: Response, expectedStatus: number) {
  const validationResults = {
    statusCorrect: response.status === expectedStatus,
    headersSecure: true,
    noDataLeak: true
  }

  // Vérifier que les headers ne leakent pas d'info
  const serverHeader = response.headers.get('Server')
  const poweredBy = response.headers.get('X-Powered-By')
  
  if (serverHeader || (poweredBy && poweredBy.trim())) {
    validationResults.headersSecure = false
  }

  // TODO: Vérifier le body de la réponse pour data leaks
  
  return validationResults
}

export default {
  getTestAuthFromHeaders,
  createTestAuthSession,
  getAuthSessionWithTestSupport,
  isUserAdminWithTestSupport,
  TestUsers,
  logSecurityEvent,
  validateSecurityResponse
}

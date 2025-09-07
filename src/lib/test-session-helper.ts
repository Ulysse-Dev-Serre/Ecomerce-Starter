/**
 * Helper pour simuler l'authentification dans les tests
 * Permet de tester les vraies logiques 401/403 sans NextAuth complexe
 */

import { getAuthSession as originalGetAuthSession } from './auth-session'

interface TestSession {
  user: {
    id: string
    email: string
    name: string
    role?: string
  }
}

/**
 * Version de getAuthSession qui supporte les variables d'environnement de test
 * Utilisée uniquement en mode développement pour les tests automatisés
 */
export async function getAuthSession(): Promise<TestSession | null> {
  // Mode TEST: Support variables d'environnement
  if (process.env.NODE_ENV === 'development' && process.env.TEST_MODE === 'true') {
    const testUserId = process.env.TEST_USER_ID
    const testUserEmail = process.env.TEST_USER_EMAIL
    const testUserRole = process.env.TEST_USER_ROLE
    
    if (testUserId && testUserEmail) {
      console.log(`[TEST MODE] Session simulée pour: ${testUserEmail} (${testUserRole})`)
      return {
        user: {
          id: testUserId,
          email: testUserEmail,
          name: testUserEmail.split('@')[0],
          role: testUserRole || 'CLIENT'
        }
      }
    }
    
    // Pas de variables test → pas de session (401)
    return null
  }
  
  // Mode normal : utiliser NextAuth
  return await originalGetAuthSession()
}

/**
 * Helper pour simuler différents utilisateurs dans les tests
 */
export function setTestUser(userId: string, email: string, role: string = 'CLIENT') {
  if (process.env.NODE_ENV === 'development') {
    process.env.TEST_MODE = 'true'
    process.env.TEST_USER_ID = userId
    process.env.TEST_USER_EMAIL = email
    process.env.TEST_USER_ROLE = role
    console.log(`[TEST] User simulé: ${email} (${role})`)
  }
}

/**
 * Helper pour simuler l'absence d'utilisateur (test 401)
 */
export function clearTestUser() {
  if (process.env.NODE_ENV === 'development') {
    delete process.env.TEST_MODE
    delete process.env.TEST_USER_ID
    delete process.env.TEST_USER_EMAIL
    delete process.env.TEST_USER_ROLE
    console.log('[TEST] Session clearée (401 attendu)')
  }
}

/**
 * Helper pour vérifier l'état de la session test
 */
export function getTestUserInfo() {
  if (process.env.NODE_ENV === 'development' && process.env.TEST_MODE === 'true') {
    return {
      id: process.env.TEST_USER_ID,
      email: process.env.TEST_USER_EMAIL,
      role: process.env.TEST_USER_ROLE
    }
  }
  return null
}

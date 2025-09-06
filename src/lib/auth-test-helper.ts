import { getAuthSession as originalGetAuthSession } from './auth-session'

/**
 * Helper pour l'authentification en mode test
 * Supporte les headers X-Test-User-* en développement
 */
export async function getAuthSession(request?: Request) {
  // MODE TEST: Support pour headers de test en développement
  if (process.env.NODE_ENV === 'development' && request) {
    const testUserId = request.headers.get('X-Test-User-Id')
    const testUserEmail = request.headers.get('X-Test-User-Email')
    const testUserRole = request.headers.get('X-Test-User-Role')
    
    if (testUserId && testUserEmail) {
      console.log(`[TEST MODE] Simulating session for: ${testUserEmail} (${testUserRole})`)
      return {
        user: {
          id: testUserId,
          email: testUserEmail,
          name: testUserEmail.split('@')[0],
          role: testUserRole || 'CLIENT'
        }
      }
    }
  }
  
  // Mode normal : utiliser NextAuth
  return await originalGetAuthSession()
}

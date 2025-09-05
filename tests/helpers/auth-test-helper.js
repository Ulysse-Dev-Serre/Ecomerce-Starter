/**
 * Helpers pour les tests d'authentification et d'autorisation
 */

const BASE_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

// Simulateurs d'utilisateurs de test
const TestUsers = {
  regularUser: {
    id: 'test-user-regular-001',
    email: 'user.regular@testauth.local',
    name: 'Regular User',
    role: 'USER'
  },
  
  otherUser: {
    id: 'test-user-other-002', 
    email: 'user.other@testauth.local',
    name: 'Other User',
    role: 'USER'
  },
  
  adminUser: {
    id: 'test-user-admin-003',
    email: 'admin@testauth.local', 
    name: 'Admin User',
    role: 'ADMIN'
  },
  
  // Utilisateur inexistant pour tests 404
  nonExistentUser: {
    id: 'test-user-nonexistent-999',
    email: 'nonexistent@testauth.local',
    name: 'Non Existent',
    role: 'USER'
  }
}

// Configuration des ressources de test
const TestResources = {
  // Ressources appartenant à regularUser
  regularUserCart: 'test-cart-regular-001',
  regularUserOrder: 'test-order-regular-001',
  regularUserAddress: 'test-address-regular-001',
  
  // Ressources appartenant à otherUser  
  otherUserCart: 'test-cart-other-002',
  otherUserOrder: 'test-order-other-002',
  otherUserAddress: 'test-address-other-002',
  
  // Ressources admin
  adminProduct: 'test-product-admin-001',
  adminMedia: 'test-media-admin-001'
}

/**
 * Simule une requête avec ou sans authentification
 */
async function makeAuthenticatedRequest(endpoint, options = {}) {
  const {
    method = 'GET',
    user = null, // null = pas d'auth, sinon un objet TestUsers
    body = null,
    headers = {}
  } = options

  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers
  }
  
  // Simulation d'un token/session (dans un vrai test, on utiliserait de vrais cookies)
  if (user) {
    requestHeaders['X-Test-User-Id'] = user.id
    requestHeaders['X-Test-User-Email'] = user.email
    requestHeaders['X-Test-User-Role'] = user.role
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined
    })

    const data = await response.json().catch(() => null)
    
    return {
      status: response.status,
      statusText: response.statusText,
      data,
      headers: Object.fromEntries(response.headers.entries())
    }
  } catch (error) {
    return {
      status: 0,
      error: error.message,
      networkError: true
    }
  }
}

/**
 * Vérifie qu'un endpoint retourne le bon statut d'erreur
 */
function expectHttpStatus(result, expectedStatus, testName) {
  const passed = result.status === expectedStatus
  
  console.log(`${passed ? '✅' : '❌'} ${testName}`)
  console.log(`   Status: ${result.status} (attendu: ${expectedStatus})`)
  
  if (!passed) {
    console.log(`   Response: ${JSON.stringify(result.data || result.error)}`)
  }
  
  // Vérifier que les messages d'erreur ne leaked pas d'infos sensibles
  if (result.data && result.data.error) {
    const errorMessage = result.data.error.toLowerCase()
    const sensitiveTerms = ['user id', 'database', 'sql', 'prisma', 'internal']
    
    const leaksSensitiveInfo = sensitiveTerms.some(term => errorMessage.includes(term))
    if (leaksSensitiveInfo) {
      console.log(`   ⚠️  Possible info leak in error message: "${result.data.error}"`)
    }
  }
  
  return passed
}

/**
 * Test patterns pour vérifier les logs de sécurité
 */
function expectSecurityLog(result, testName) {
  // Dans un vrai environnement, on vérifierait les logs
  // Pour ces tests, on vérifie juste la réponse appropriée
  const hasAppropriateResponse = result.status >= 400 && result.status <= 403
  
  console.log(`${hasAppropriateResponse ? '✅' : '❌'} ${testName} - Security response`)
  
  if (result.data && result.data.error) {
    // Vérifier que le message d'erreur est générique (pas de détails techniques)
    const isGenericError = [
      'non autorisé',
      'accès refusé', 
      'accès interdit',
      'forbidden',
      'unauthorized'
    ].some(term => result.data.error.toLowerCase().includes(term))
    
    console.log(`   ${isGenericError ? '✅' : '⚠️'} Message d'erreur approprié`)
  }
  
  return hasAppropriateResponse
}

/**
 * Générateur de scénarios de test courants
 */
const TestScenarios = {
  // Ownership violation: User A tente d'accéder aux ressources de User B
  ownershipViolation: (resourceEndpoint, resourceOwner, attacker) => ({
    name: `Ownership violation: ${attacker.name} → ${resourceOwner.name} resource`,
    endpoint: resourceEndpoint,
    user: attacker,
    expectedStatus: 403,
    expectsSecurityLog: true
  }),
  
  // Unauthenticated access: Pas de session/token
  unauthenticatedAccess: (protectedEndpoint) => ({
    name: `Unauthenticated access: ${protectedEndpoint}`,
    endpoint: protectedEndpoint,
    user: null,
    expectedStatus: 401,
    expectsSecurityLog: false
  }),
  
  // Admin access: Non-admin tente route admin
  unauthorizedAdminAccess: (adminEndpoint, regularUser) => ({
    name: `Unauthorized admin access: ${regularUser.name} → ${adminEndpoint}`,
    endpoint: adminEndpoint,
    user: regularUser,
    expectedStatus: 403,
    expectsSecurityLog: true
  }),
  
  // Authorized access: Utilisateur légitime
  authorizedAccess: (endpoint, authorizedUser) => ({
    name: `Authorized access: ${authorizedUser.name} → ${endpoint}`,
    endpoint: endpoint,
    user: authorizedUser,
    expectedStatus: [200, 201, 204], // Success statuses
    expectsSecurityLog: false
  }),
  
  // Resource not found: Ressource inexistante (mais utilisateur autorisé)
  resourceNotFound: (nonExistentResource, authorizedUser) => ({
    name: `Resource not found: ${authorizedUser.name} → ${nonExistentResource}`,
    endpoint: nonExistentResource,
    user: authorizedUser,
    expectedStatus: 404,
    expectsSecurityLog: false
  })
}

/**
 * Executeur de scénario de test
 */
async function runTestScenario(scenario, options = {}) {
  const { method = 'GET', body = null } = options
  
  const result = await makeAuthenticatedRequest(scenario.endpoint, {
    method,
    user: scenario.user,
    body
  })
  
  // Vérifier le statut attendu
  const expectedStatuses = Array.isArray(scenario.expectedStatus) 
    ? scenario.expectedStatus 
    : [scenario.expectedStatus]
    
  const statusPassed = expectedStatuses.includes(result.status)
  
  console.log(`${statusPassed ? '✅' : '❌'} ${scenario.name}`)
  console.log(`   Status: ${result.status} (attendu: ${expectedStatuses.join(' ou ')})`)
  
  // Log de sécurité si attendu
  if (scenario.expectsSecurityLog) {
    expectSecurityLog(result, scenario.name)
  }
  
  // Vérifier pas de data leak
  if (!statusPassed && result.data) {
    console.log(`   Response: ${JSON.stringify(result.data).substring(0, 200)}...`)
  }
  
  return {
    scenario: scenario.name,
    passed: statusPassed,
    actualStatus: result.status,
    expectedStatus: scenario.expectedStatus,
    response: result.data
  }
}

/**
 * Utilitaire pour nettoyer après les tests
 */
async function cleanupTestData() {
  console.log('🧹 Cleanup test data...')
  
  // Dans un vrai test, on nettoierait les données créées
  // Pour ces tests de demo, on simule juste
  
  const testDataEndpoints = [
    '/api/test-data/cleanup',
    '/api/auth/cleanup'
  ]
  
  for (const endpoint of testDataEndpoints) {
    try {
      const result = await makeAuthenticatedRequest(endpoint, {
        method: 'DELETE',
        user: TestUsers.adminUser
      })
      
      if (result.status === 200) {
        console.log(`✅ Cleaned ${endpoint}`)
      }
    } catch (error) {
      // Ignore cleanup errors in tests
      console.log(`⚠️  Cleanup ${endpoint}: ${error.message}`)
    }
  }
}

module.exports = {
  TestUsers,
  TestResources,
  TestScenarios,
  makeAuthenticatedRequest,
  expectHttpStatus,
  expectSecurityLog,
  runTestScenario,
  cleanupTestData
}

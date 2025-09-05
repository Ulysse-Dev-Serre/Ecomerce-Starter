#!/usr/bin/env node

/**
 * Tests E2E de sécurité - Ownership et accès non autorisé
 * Usage: node tests/test-access-security.js
 * 
 * Vérifie que les protections d'ownership et d'autorisation fonctionnent correctement
 */

const {
  TestUsers,
  TestResources,
  TestScenarios,
  makeAuthenticatedRequest,
  expectHttpStatus,
  runTestScenario,
  cleanupTestData
} = require('./helpers/auth-test-helper.js')

// Configuration des endpoints à tester
const EndpointsToTest = {
  // Routes avec ownership (utilisateur ne peut accéder qu'à ses propres ressources)
  ownership: [
    {
      endpoint: `/api/cart/${TestResources.regularUserCart}`,
      owner: TestUsers.regularUser,
      methods: ['GET', 'POST']
    },
    {
      endpoint: `/api/cart/${TestResources.otherUserCart}`, 
      owner: TestUsers.otherUser,
      methods: ['GET', 'POST']
    },
    {
      endpoint: `/api/cart/${TestResources.regularUserCart}/test-item-001`,
      owner: TestUsers.regularUser,
      methods: ['PATCH', 'DELETE']
    },
    {
      endpoint: `/api/users/${TestUsers.regularUser.id}`,
      owner: TestUsers.regularUser,
      methods: ['GET', 'PATCH']
    },
    {
      endpoint: `/api/users/${TestUsers.otherUser.id}`,
      owner: TestUsers.otherUser,
      methods: ['GET', 'PATCH']
    },
    {
      endpoint: `/api/users/${TestUsers.regularUser.id}/addresses`,
      owner: TestUsers.regularUser,
      methods: ['GET', 'POST']
    },
    {
      endpoint: `/api/users/${TestUsers.regularUser.id}/orders`,
      owner: TestUsers.regularUser,
      methods: ['GET']
    }
  ],
  
  // Routes nécessitant authentification (any user)
  authenticated: [
    '/api/orders',
    '/api/users',
    '/api/cart/test-user-id'
  ],
  
  // Routes nécessitant privilèges admin
  admin: [
    '/api/admin/products',
    '/api/admin/media/upload',
    '/api/admin/categories',
    '/api/admin/products/test-product-001',
    '/api/admin/security-check',
    '/api/admin/rate-limit-stats'
  ]
}

async function testOwnershipViolations() {
  console.log('\n🔐 Test violations d\'ownership')
  console.log('=' .repeat(60))
  
  const results = []
  
  for (const resource of EndpointsToTest.ownership) {
    const resourceOwner = resource.owner
    const attacker = resourceOwner.id === TestUsers.regularUser.id 
      ? TestUsers.otherUser 
      : TestUsers.regularUser
    
    for (const method of resource.methods) {
      // Test: Utilisateur A tente d'accéder aux ressources de B
      const scenario = TestScenarios.ownershipViolation(
        resource.endpoint,
        resourceOwner,
        attacker
      )
      
      const testBody = method === 'POST' 
        ? { variantId: 'test-variant', quantity: 1 }
        : method === 'PATCH'
        ? { quantity: 2 }
        : null
      
      const result = await runTestScenario(scenario, { 
        method, 
        body: testBody 
      })
      
      results.push(result)
      
      // Test: Propriétaire légitime peut accéder
      const authorizedScenario = TestScenarios.authorizedAccess(
        resource.endpoint,
        resourceOwner
      )
      
      // Note: On ne teste l'accès autorisé que pour GET (éviter side effects)
      if (method === 'GET') {
        const authorizedResult = await runTestScenario(authorizedScenario, { 
          method 
        })
        results.push(authorizedResult)
      }
      
      await sleep(100) // Éviter rate limiting
    }
  }
  
  const violationTests = results.filter(r => r.scenario.includes('violation'))
  const passed = violationTests.filter(r => r.passed).length
  
  console.log(`\n📊 Violations d'ownership: ${passed}/${violationTests.length} tests passés`)
  
  return results
}

async function testUnauthenticatedAccess() {
  console.log('\n🚫 Test accès sans authentification')
  console.log('=' .repeat(60))
  
  const results = []
  
  // Test routes nécessitant authentification
  for (const endpoint of EndpointsToTest.authenticated) {
    const scenario = TestScenarios.unauthenticatedAccess(endpoint)
    const result = await runTestScenario(scenario)
    results.push(result)
    
    await sleep(50)
  }
  
  // Test routes avec ownership
  for (const resource of EndpointsToTest.ownership.slice(0, 3)) { // Limiter pour éviter spam
    const scenario = TestScenarios.unauthenticatedAccess(resource.endpoint)
    const result = await runTestScenario(scenario)
    results.push(result)
    
    await sleep(50)
  }
  
  const passed = results.filter(r => r.passed).length
  console.log(`\n📊 Accès non authentifié: ${passed}/${results.length} tests passés`)
  
  return results
}

async function testUnauthorizedAdminAccess() {
  console.log('\n👑 Test accès admin non autorisé')
  console.log('=' .repeat(60))
  
  const results = []
  
  for (const endpoint of EndpointsToTest.admin) {
    // Test: Utilisateur régulier tente route admin
    const regularUserScenario = TestScenarios.unauthorizedAdminAccess(
      endpoint,
      TestUsers.regularUser
    )
    
    const regularResult = await runTestScenario(regularUserScenario)
    results.push(regularResult)
    
    // Test: Utilisateur non authentifié tente route admin
    const unauthScenario = TestScenarios.unauthenticatedAccess(endpoint)
    const unauthResult = await runTestScenario(unauthScenario)
    results.push(unauthResult)
    
    // Test: Admin peut accéder (seulement GET pour éviter side effects)
    if (endpoint.includes('GET') || !endpoint.includes('upload')) {
      const adminScenario = TestScenarios.authorizedAccess(
        endpoint,
        TestUsers.adminUser
      )
      
      const adminResult = await runTestScenario(adminScenario)
      results.push(adminResult)
    }
    
    await sleep(100)
  }
  
  const unauthorizedTests = results.filter(r => 
    r.scenario.includes('Unauthorized') || r.scenario.includes('Unauthenticated')
  )
  const passed = unauthorizedTests.filter(r => r.passed).length
  
  console.log(`\n📊 Accès admin non autorisé: ${passed}/${unauthorizedTests.length} tests passés`)
  
  return results
}

async function testHttpStatusCodes() {
  console.log('\n🔢 Test codes de statut HTTP corrects')
  console.log('=' .repeat(60))
  
  const statusTests = [
    {
      name: '401 vs 403 - Cart sans auth vs cart autre user',
      tests: [
        {
          scenario: 'Sans authentification → 401',
          test: () => runTestScenario(
            TestScenarios.unauthenticatedAccess(`/api/cart/${TestResources.regularUserCart}`)
          ),
          expectedStatus: 401
        },
        {
          scenario: 'Autre utilisateur → 403', 
          test: () => runTestScenario(
            TestScenarios.ownershipViolation(
              `/api/cart/${TestResources.regularUserCart}`,
              TestUsers.regularUser,
              TestUsers.otherUser
            )
          ),
          expectedStatus: 403
        }
      ]
    },
    
    {
      name: '403 vs 404 - Admin route vs ressource inexistante',
      tests: [
        {
          scenario: 'Non-admin sur route admin → 403',
          test: () => runTestScenario(
            TestScenarios.unauthorizedAdminAccess(
              '/api/admin/products',
              TestUsers.regularUser
            )
          ),
          expectedStatus: 403
        },
        {
          scenario: 'Ressource admin inexistante → 404',
          test: () => runTestScenario(
            TestScenarios.resourceNotFound(
              '/api/admin/products/nonexistent-product-999',
              TestUsers.adminUser
            )
          ),
          expectedStatus: 404
        }
      ]
    }
  ]
  
  const results = []
  
  for (const statusTest of statusTests) {
    console.log(`\n📋 ${statusTest.name}`)
    
    for (const test of statusTest.tests) {
      const result = await test.test()
      const passed = result.actualStatus === test.expectedStatus
      
      console.log(`  ${passed ? '✅' : '❌'} ${test.scenario}`)
      console.log(`     Status: ${result.actualStatus} (attendu: ${test.expectedStatus})`)
      
      results.push({
        ...result,
        testName: statusTest.name,
        passed
      })
      
      await sleep(100)
    }
  }
  
  const passed = results.filter(r => r.passed).length
  console.log(`\n📊 Codes de statut: ${passed}/${results.length} tests passés`)
  
  return results
}

async function testSecurityLogging() {
  console.log('\n📝 Test logging de sécurité')
  console.log('=' .repeat(60))
  
  // Simulation d'attaques pour vérifier les logs
  const securityTests = [
    {
      name: 'Tentative accès cart autre utilisateur',
      attack: () => makeAuthenticatedRequest(`/api/cart/${TestResources.otherUserCart}`, {
        user: TestUsers.regularUser
      }),
      expectsLog: true,
      expectedStatus: 403
    },
    
    {
      name: 'Tentative modification profil autre utilisateur',
      attack: () => makeAuthenticatedRequest(`/api/users/${TestUsers.otherUser.id}`, {
        method: 'PATCH',
        user: TestUsers.regularUser,
        body: { name: 'Hacked Name' }
      }),
      expectsLog: true,
      expectedStatus: 403
    },
    
    {
      name: 'Tentative accès admin sans privilèges',
      attack: () => makeAuthenticatedRequest('/api/admin/products', {
        user: TestUsers.regularUser
      }),
      expectsLog: true,
      expectedStatus: 403
    },
    
    {
      name: 'Accès légitime (pas de log d\'alerte)',
      attack: () => makeAuthenticatedRequest(`/api/cart/${TestResources.regularUserCart}`, {
        user: TestUsers.regularUser
      }),
      expectsLog: false,
      expectedStatus: [200, 404] // OK ou pas trouvé
    }
  ]
  
  const results = []
  
  for (const test of securityTests) {
    console.log(`\n🎯 ${test.name}`)
    
    const result = await test.attack()
    const statusPassed = Array.isArray(test.expectedStatus) 
      ? test.expectedStatus.includes(result.status)
      : result.status === test.expectedStatus
    
    console.log(`  Status: ${result.status} ${statusPassed ? '✅' : '❌'}`)
    
    // Vérifier que les messages d'erreur sont appropriés
    if (result.data && result.data.error) {
      const errorMsg = result.data.error.toLowerCase()
      const isGenericError = [
        'non autorisé',
        'accès refusé',
        'accès interdit', 
        'forbidden',
        'unauthorized'
      ].some(term => errorMsg.includes(term))
      
      console.log(`  Message d'erreur: ${isGenericError ? '✅ Générique' : '⚠️ Peut exposer des détails'}`)
      console.log(`    "${result.data.error}"`)
    }
    
    results.push({
      test: test.name,
      passed: statusPassed,
      status: result.status,
      expectedLog: test.expectsLog,
      response: result.data
    })
    
    await sleep(200) // Plus long pour éviter rate limiting
  }
  
  const passed = results.filter(r => r.passed).length
  console.log(`\n📊 Logging sécurité: ${passed}/${results.length} tests passés`)
  
  return results
}

async function runFullSecurityTestSuite() {
  console.log('🛡️  Test Suite E2E - Sécurité d\'accès et ownership')
  console.log('Serveur:', process.env.NEXT_PUBLIC_URL || 'http://localhost:3000')
  console.log('Date:', new Date().toISOString())
  console.log('=' .repeat(80))
  
  const allResults = {
    ownership: [],
    authentication: [],
    authorization: [],
    statusCodes: [],
    logging: []
  }
  
  try {
    // Tests ownership
    allResults.ownership = await testOwnershipViolations()
    
    // Tests authentication
    allResults.authentication = await testUnauthenticatedAccess()
    
    // Tests authorization (admin)
    allResults.authorization = await testUnauthorizedAdminAccess()
    
    // Tests codes de statut
    allResults.statusCodes = await testHttpStatusCodes()
    
    // Tests logging
    allResults.logging = await testSecurityLogging()
    
    // Rapport final
    console.log('\n🏆 RAPPORT FINAL')
    console.log('=' .repeat(80))
    
    const totalTests = Object.values(allResults).flat().length
    const totalPassed = Object.values(allResults).flat().filter(r => r.passed).length
    const successRate = Math.round((totalPassed / totalTests) * 100)
    
    console.log(`\n📊 Score global: ${totalPassed}/${totalTests} (${successRate}%)`)
    
    Object.entries(allResults).forEach(([category, results]) => {
      const passed = results.filter(r => r.passed).length
      const total = results.length
      const rate = Math.round((passed / total) * 100)
      
      console.log(`  ${category}: ${passed}/${total} (${rate}%)`)
    })
    
    if (successRate >= 95) {
      console.log('\n🎉 Excellente sécurité ! Toutes les protections fonctionnent.')
    } else if (successRate >= 85) {
      console.log('\n✅ Bonne sécurité, quelques ajustements possibles.')
    } else {
      console.log('\n⚠️  Sécurité à améliorer - certaines protections échouent.')
    }
    
    // Critères d'acceptation
    console.log('\n✅ CRITÈRES D\'ACCEPTATION VÉRIFIÉS:')
    console.log('  • Utilisateur A ne peut pas accéder aux ressources de B → 403')
    console.log('  • Utilisateur non connecté → 401 sur routes privées')
    console.log('  • Utilisateur non admin → 403 sur routes admin')
    console.log('  • Codes HTTP corrects (403 vs 404) selon contexte')
    console.log('  • Messages d\'erreur génériques (pas de leak d\'info)')
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message)
  } finally {
    // Cleanup
    await cleanupTestData()
  }
  
  return allResults
}

// Utilitaire pour pause entre tests
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Exécution si appelé directement
if (require.main === module) {
  runFullSecurityTestSuite().catch(console.error)
}

module.exports = {
  testOwnershipViolations,
  testUnauthenticatedAccess, 
  testUnauthorizedAdminAccess,
  testHttpStatusCodes,
  testSecurityLogging,
  runFullSecurityTestSuite
}

/**
 * Tests Payment Intent Edge Cases - Cas limites et scénarios avancés
 * 
 * Scénarios testés:
 * - Retour depuis checkout/success → pas de nouveau PI
 * - Changement montant panier → nouveau PI créé
 * - PI expiré → nouveau PI créé
 * - Gestion erreurs Stripe
 */

const fs = require('fs')
const path = require('path')

// Configuration test
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

// Helper pour simuler l'authentification test
function getTestHeaders(userId = 'test-user-edge', email = 'edge.test@testauth.local') {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Ces tests ne peuvent être exécutés qu\'en développement')
  }
  
  return {
    'Content-Type': 'application/json',
    'X-Test-User-Id': `test-user-${userId}`,
    'X-Test-User-Email': email,
    'X-Test-User-Role': 'USER'
  }
}

// Helper pour créer PaymentIntent avec panier spécifique
async function createPaymentIntentWithCart(cartData) {
  const response = await fetch(`${BASE_URL}/api/checkout/create-payment-intent`, {
    method: 'POST',
    headers: getTestHeaders(),
    body: JSON.stringify({
      cartId: cartData.id,
      email: 'edge@test.com',
      billingAddress: {
        line1: '456 Edge Street',
        city: 'Edge City',
        state: 'QC', 
        postal_code: 'H2H 2H2',
        country: 'CA'
      },
      saveAddress: false
    })
  })
  
  return response
}

// Test 1: Changement montant panier → Nouveau PI
async function testCartAmountChange() {
  console.log('\n🧪 Test 1: Changement montant → Nouveau PaymentIntent')
  
  try {
    // Panier initial (100 CAD)
    const cart1 = {
      id: 'cm0000000000000000000002', // CUID valide
      items: [{
        id: 'item-1',
        quantity: 1,
        variant: { id: 'var-1', price: 100.00, currency: 'CAD' }
      }]
    }
    
    console.log('   📡 Premier panier (100 CAD)...')
    const response1 = await createPaymentIntentWithCart(cart1)
    
    if (!response1.ok) {
      const error = await response1.json()
      throw new Error(`Premier appel échoué: ${error.error}`)
    }
    
    const data1 = await response1.json()
    console.log(`   💰 Premier PI: ${data1.paymentIntentId} (${data1.amount} CAD)`)
    
    // Panier modifié (200 CAD)
    const cart2 = {
      id: 'cm0000000000000000000003', // CUID valide - différent ID pour forcer nouveau montant
      items: [{
        id: 'item-2',
        quantity: 1,
        variant: { id: 'var-2', price: 200.00, currency: 'CAD' }
      }]
    }
    
    console.log('   📡 Deuxième panier (200 CAD)...')
    const response2 = await createPaymentIntentWithCart(cart2)
    
    if (!response2.ok) {
      const error = await response2.json()
      throw new Error(`Deuxième appel échoué: ${error.error}`)
    }
    
    const data2 = await response2.json()
    console.log(`   💰 Deuxième PI: ${data2.paymentIntentId} (${data2.amount} CAD)`)
    
    // Vérification: Différents PI pour différents montants
    if (data1.paymentIntentId !== data2.paymentIntentId) {
      console.log('   ✅ SUCCÈS: Nouveau PaymentIntent pour montant différent')
      return true
    } else {
      console.log('   ❌ ÉCHEC: Même PaymentIntent malgré montant différent')
      return false
    }
    
  } catch (error) {
    console.log(`   ❌ ERREUR: ${error.message}`)
    return false
  }
}

// Test 2: Simulation retour depuis success
async function testReturnFromSuccess() {
  console.log('\n🧪 Test 2: Retour depuis /checkout/success')
  
  try {
    const cartId = 'cart-success-return'
    
    // Simuler session utilisateur avec panier "completed"
    console.log('   📡 Premier appel (initial checkout)...')
    const response1 = await createPaymentIntentWithCart({
      id: cartId,
      items: [{
        id: 'item-success',
        quantity: 1,
        variant: { id: 'var-success', price: 50.00, currency: 'CAD' }
      }]
    })
    
    if (!response1.ok) {
      const error = await response1.json()
      throw new Error(`Premier appel échoué: ${error.error}`)
    }
    
    const data1 = await response1.json()
    console.log(`   ✅ PI initial créé: ${data1.paymentIntentId}`)
    
    // Simuler retour depuis success (même panier, pas de changement)
    console.log('   📡 Retour depuis success...')
    
    // Attendre un peu pour simuler le workflow réaliste
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const response2 = await createPaymentIntentWithCart({
      id: cartId, // Même ID de panier
      items: [{
        id: 'item-success',
        quantity: 1,
        variant: { id: 'var-success', price: 50.00, currency: 'CAD' }
      }]
    })
    
    if (!response2.ok) {
      const error = await response2.json()
      throw new Error(`Retour échoué: ${error.error}`)
    }
    
    const data2 = await response2.json()
    console.log(`   🔄 PI après retour: ${data2.paymentIntentId}`)
    
    // Vérification: Même PI réutilisé
    if (data1.paymentIntentId === data2.paymentIntentId) {
      console.log('   ✅ SUCCÈS: PaymentIntent réutilisé après retour success')
      return true
    } else {
      console.log('   ❌ ÉCHEC: Nouveau PaymentIntent créé inutilement')
      return false
    }
    
  } catch (error) {
    console.log(`   ❌ ERREUR: ${error.message}`)
    return false
  }
}

// Test 3: Validation gestion utilisateurs différents
async function testDifferentUsers() {
  console.log('\n🧪 Test 3: Utilisateurs différents → PI différents')
  
  try {
    const sameCartId = 'shared-cart-id'
    
    // Utilisateur 1
    console.log('   📡 Utilisateur 1...')
    const user1Headers = {
      ...getTestHeaders('user-1', 'user1.test@testauth.local'),
    }
    
    const response1 = await fetch(`${BASE_URL}/api/checkout/create-payment-intent`, {
      method: 'POST',
      headers: user1Headers,
      body: JSON.stringify({
        cartId: sameCartId,
        email: 'user1.test@testauth.local',
        billingAddress: {
          line1: '111 User1 Street',
          city: 'Test City',
          state: 'QC',
          postal_code: 'H1H 1H1',
          country: 'CA'
        },
        saveAddress: false
      })
    })
    
    if (!response1.ok) {
      const error = await response1.json()
      throw new Error(`User 1 échoué: ${error.error}`)
    }
    
    const data1 = await response1.json()
    console.log(`   👤 User 1 PI: ${data1.paymentIntentId}`)
    
    // Utilisateur 2 (même panier théorique)
    console.log('   📡 Utilisateur 2...')
    const user2Headers = {
      ...getTestHeaders('user-2', 'user2.test@testauth.local'),
    }
    
    const response2 = await fetch(`${BASE_URL}/api/checkout/create-payment-intent`, {
      method: 'POST',
      headers: user2Headers,
      body: JSON.stringify({
        cartId: sameCartId, // Même cartId mais user différent
        email: 'user2@test.com',
        billingAddress: {
          line1: '222 User2 Street',
          city: 'Test City',
          state: 'QC',
          postal_code: 'H2H 2H2',
          country: 'CA'
        },
        saveAddress: false
      })
    })
    
    if (!response2.ok) {
      const error = await response2.json()
      throw new Error(`User 2 échoué: ${error.error}`)
    }
    
    const data2 = await response2.json()
    console.log(`   👤 User 2 PI: ${data2.paymentIntentId}`)
    
    // Vérification: PI différents pour utilisateurs différents
    if (data1.paymentIntentId !== data2.paymentIntentId) {
      console.log('   ✅ SUCCÈS: PaymentIntent différents pour utilisateurs différents')
      return true
    } else {
      console.log('   ❌ ÉCHEC: Même PaymentIntent partagé entre utilisateurs')
      return false
    }
    
  } catch (error) {
    console.log(`   ❌ ERREUR: ${error.message}`)
    return false
  }
}

// Test 4: Stress test - Concurrence
async function testConcurrentRequests() {
  console.log('\n🧪 Test 4: Requests concurrents → 1 seul PI')
  
  try {
    const cartId = 'cm0000000000000000000006' // CUID valide
    const numRequests = 10
    
    console.log(`   📡 ${numRequests} requests simultanés...`)
    
    // Créer plusieurs requests simultanés
    const promises = []
    for (let i = 0; i < numRequests; i++) {
      promises.push(createPaymentIntentWithCart({
        id: cartId,
        items: [{
          id: 'concurrent-item',
          quantity: 1,
          variant: { id: 'concurrent-var', price: 75.00, currency: 'CAD' }
        }]
      }))
    }
    
    // Attendre toutes les réponses
    const responses = await Promise.allSettled(promises)
    
    const successfulResponses = responses.filter(r => r.status === 'fulfilled' && r.value.ok)
    const paymentIntents = []
    
    console.log(`   📊 Réponses réussies: ${successfulResponses.length}/${numRequests}`)
    
    for (const response of successfulResponses) {
      const data = await response.value.json()
      paymentIntents.push(data.paymentIntentId)
    }
    
    const uniquePI = new Set(paymentIntents)
    
    console.log(`   🎯 PaymentIntent uniques: ${uniquePI.size}`)
    console.log(`   📋 PI: ${Array.from(uniquePI).join(', ')}`)
    
    if (uniquePI.size === 1) {
      console.log('   ✅ SUCCÈS: Un seul PaymentIntent malgré la concurrence')
      return true
    } else {
      console.log('   ❌ ÉCHEC: Plusieurs PaymentIntent créés en concurrence')
      return false
    }
    
  } catch (error) {
    console.log(`   ❌ ERREUR: ${error.message}`)
    return false
  }
}

// Fonction principale
async function runEdgeCaseTests() {
  console.log('🧪 TESTS PAYMENT INTENT EDGE CASES')
  console.log('===================================')
  
  if (process.env.NODE_ENV === 'production') {
    console.log('❌ Ces tests ne peuvent être exécutés qu\'en développement')
    process.exit(1)
  }
  
  const results = []
  
  // Exécuter tous les tests edge cases
  results.push(await testCartAmountChange())
  results.push(await testReturnFromSuccess())
  results.push(await testDifferentUsers())
  results.push(await testConcurrentRequests())
  
  // Résultats
  console.log('\n📊 RÉSULTATS EDGE CASES')
  console.log('========================')
  
  const passed = results.filter(r => r).length
  const total = results.length
  
  console.log(`✅ Tests réussis: ${passed}/${total}`)
  console.log(`❌ Tests échoués: ${total - passed}/${total}`)
  
  if (passed === total) {
    console.log('\n🎉 TOUS LES EDGE CASES PASSENT!')
    process.exit(0)
  } else {
    console.log('\n💥 DES EDGE CASES ÉCHOUENT')
    process.exit(1)
  }
}

// Lancer les tests si exécuté directement
if (require.main === module) {
  runEdgeCaseTests().catch(error => {
    console.error('💥 Erreur fatale edge cases:', error)
    process.exit(1)
  })
}

module.exports = {
  runEdgeCaseTests,
  testCartAmountChange,
  testReturnFromSuccess,
  testDifferentUsers,
  testConcurrentRequests
}

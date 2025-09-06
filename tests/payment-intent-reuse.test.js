/**
 * Tests Payment Intent Reuse - Vérifie qu'un seul PI est créé par panier
 * 
 * Scénarios testés:
 * - 2 appels consécutifs → même paymentIntentId
 * - Refresh/re-render → réutilisation PI existant
 * - Validation qu'aucun doublon n'est créé
 */

const fs = require('fs')
const path = require('path')

// Configuration test
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'
const TEST_USER_ID = 'test-user-payment-intent'
const TEST_CART_ID = 'test-cart-payment-intent'

// Helper pour simuler l'authentification test
function getTestHeaders(userId = TEST_USER_ID, email = 'test@payment.com') {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Ces tests ne peuvent être exécutés qu\'en développement')
  }
  
  return {
    'Content-Type': 'application/json',
    'X-Test-User-Id': userId,
    'X-Test-User-Email': email,
    'X-Test-User-Role': 'CLIENT'
  }
}

// Helper pour créer un panier de test
async function createTestCart() {
  console.log('🛒 Création panier de test...')
  
  // Simuler un panier avec des données cohérentes
  const cartData = {
    id: TEST_CART_ID,
    items: [
      {
        id: 'item-1',
        quantity: 2,
        variant: {
          id: 'variant-1',
          price: 99.99,
          currency: 'CAD'
        }
      },
      {
        id: 'item-2', 
        quantity: 1,
        variant: {
          id: 'variant-2',
          price: 149.99,
          currency: 'CAD'
        }
      }
    ]
  }
  
  return cartData
}

// Helper pour appeler create-payment-intent
async function callCreatePaymentIntent(cartId = TEST_CART_ID) {
  const response = await fetch(`${BASE_URL}/api/checkout/create-payment-intent`, {
    method: 'POST',
    headers: getTestHeaders(),
    body: JSON.stringify({
      cartId: cartId,
      email: 'test@payment.com',
      billingAddress: {
        line1: '123 Test Street',
        city: 'Test City',
        state: 'QC',
        postal_code: 'H1H 1H1',
        country: 'CA'
      },
      saveAddress: false
    })
  })
  
  return response
}

// Helper pour parser les logs (si disponibles)
function parseLogsForPaymentIntents() {
  // En production, on pourrait parser les logs depuis un fichier
  // Pour ce test, on utilise la réponse API
  return []
}

// Test 1: Appels consécutifs retournent même PI
async function testConsecutiveCalls() {
  console.log('\n🧪 Test 1: Appels consécutifs → même PaymentIntent')
  
  try {
    // Premier appel
    console.log('   📡 Premier appel...')
    const response1 = await callCreatePaymentIntent()
    
    if (!response1.ok) {
      const error = await response1.json()
      throw new Error(`Premier appel échoué: ${error.error}`)
    }
    
    const data1 = await response1.json()
    console.log(`   ✅ Premier PI créé: ${data1.paymentIntentId}`)
    
    // Deuxième appel (immédiat)
    console.log('   📡 Deuxième appel...')
    const response2 = await callCreatePaymentIntent()
    
    if (!response2.ok) {
      const error = await response2.json()
      throw new Error(`Deuxième appel échoué: ${error.error}`)
    }
    
    const data2 = await response2.json()
    console.log(`   ✅ Deuxième PI: ${data2.paymentIntentId}`)
    
    // Vérification
    if (data1.paymentIntentId === data2.paymentIntentId) {
      console.log('   ✅ SUCCÈS: Même PaymentIntent réutilisé')
      return true
    } else {
      console.log('   ❌ ÉCHEC: PaymentIntent différents créés')
      console.log(`      PI1: ${data1.paymentIntentId}`)
      console.log(`      PI2: ${data2.paymentIntentId}`)
      return false
    }
    
  } catch (error) {
    console.log(`   ❌ ERREUR: ${error.message}`)
    return false
  }
}

// Test 2: Validation des montants cohérents
async function testAmountConsistency() {
  console.log('\n🧪 Test 2: Cohérence montants')
  
  try {
    console.log('   📡 Appel avec montant spécifique...')
    const response = await callCreatePaymentIntent()
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Appel échoué: ${error.error}`)
    }
    
    const data = await response.json()
    
    // Calculer le montant attendu (même logique que le serveur)
    const subtotal = 99.99 * 2 + 149.99 * 1 // Items du panier test
    const taxes = subtotal * 0.15
    const expectedTotal = subtotal + taxes
    
    console.log(`   💰 Montant attendu: ${expectedTotal.toFixed(2)} CAD`)
    console.log(`   💰 Montant reçu: ${data.amount} CAD`)
    
    const amountMatch = Math.abs(data.amount - expectedTotal) < 0.01
    
    if (amountMatch) {
      console.log('   ✅ SUCCÈS: Montant cohérent')
      return true
    } else {
      console.log('   ❌ ÉCHEC: Montant incohérent')
      return false
    }
    
  } catch (error) {
    console.log(`   ❌ ERREUR: ${error.message}`)
    return false
  }
}

// Test 3: Simulation refresh rapide
async function testRapidRefresh() {
  console.log('\n🧪 Test 3: Refresh rapide → réutilisation')
  
  try {
    // Simuler plusieurs refreshs rapides
    console.log('   📡 Simulation 5 refreshs rapides...')
    
    const promises = []
    for (let i = 0; i < 5; i++) {
      promises.push(callCreatePaymentIntent())
    }
    
    const responses = await Promise.all(promises)
    const paymentIntents = []
    
    for (let i = 0; i < responses.length; i++) {
      if (!responses[i].ok) {
        console.log(`   ⚠️  Appel ${i + 1} échoué`)
        continue
      }
      
      const data = await responses[i].json()
      paymentIntents.push(data.paymentIntentId)
    }
    
    // Vérifier que tous les PI sont identiques
    const uniquePI = new Set(paymentIntents)
    
    console.log(`   📊 PaymentIntent uniques: ${uniquePI.size}`)
    console.log(`   📊 Total appels réussis: ${paymentIntents.length}`)
    
    if (uniquePI.size === 1) {
      console.log('   ✅ SUCCÈS: Un seul PaymentIntent pour tous les refreshs')
      return true
    } else {
      console.log('   ❌ ÉCHEC: Plusieurs PaymentIntent créés')
      console.log(`   📋 PI créés: ${Array.from(uniquePI)}`)
      return false
    }
    
  } catch (error) {
    console.log(`   ❌ ERREUR: ${error.message}`)
    return false
  }
}

// Test 4: Validation format PaymentIntent
async function testPaymentIntentFormat() {
  console.log('\n🧪 Test 4: Format PaymentIntent valide')
  
  try {
    console.log('   📡 Validation format...')
    const response = await callCreatePaymentIntent()
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Appel échoué: ${error.error}`)
    }
    
    const data = await response.json()
    
    // Vérifier format Stripe PaymentIntent (pi_...)
    const validFormat = /^pi_[a-zA-Z0-9]+$/.test(data.paymentIntentId)
    const hasClientSecret = data.clientSecret && data.clientSecret.includes(data.paymentIntentId)
    
    console.log(`   🔍 PaymentIntent ID: ${data.paymentIntentId}`)
    console.log(`   🔍 Format valide: ${validFormat ? '✅' : '❌'}`)
    console.log(`   🔍 Client Secret présent: ${hasClientSecret ? '✅' : '❌'}`)
    
    if (validFormat && hasClientSecret) {
      console.log('   ✅ SUCCÈS: Format PaymentIntent valide')
      return true
    } else {
      console.log('   ❌ ÉCHEC: Format PaymentIntent invalide')
      return false
    }
    
  } catch (error) {
    console.log(`   ❌ ERREUR: ${error.message}`)
    return false
  }
}

// Fonction principale de test
async function runPaymentIntentTests() {
  console.log('🧪 TESTS PAYMENT INTENT REUSE')
  console.log('================================')
  console.log(`Base URL: ${BASE_URL}`)
  console.log(`Test Cart ID: ${TEST_CART_ID}`)
  console.log(`Test User ID: ${TEST_USER_ID}`)
  
  // Vérifier l'environnement
  if (process.env.NODE_ENV === 'production') {
    console.log('❌ Ces tests ne peuvent être exécutés qu\'en développement')
    process.exit(1)
  }
  
  const results = []
  
  // Exécuter tous les tests
  results.push(await testConsecutiveCalls())
  results.push(await testAmountConsistency())  
  results.push(await testRapidRefresh())
  results.push(await testPaymentIntentFormat())
  
  // Résultats
  console.log('\n📊 RÉSULTATS')
  console.log('=============')
  
  const passed = results.filter(r => r).length
  const total = results.length
  
  console.log(`✅ Tests réussis: ${passed}/${total}`)
  console.log(`❌ Tests échoués: ${total - passed}/${total}`)
  
  if (passed === total) {
    console.log('\n🎉 TOUS LES TESTS PASSENT - Payment Intent réutilisation fonctionne!')
    process.exit(0)
  } else {
    console.log('\n💥 DES TESTS ÉCHOUENT - Vérifier la logique de réutilisation')
    process.exit(1)
  }
}

// Lancer les tests si le script est exécuté directement
if (require.main === module) {
  runPaymentIntentTests().catch(error => {
    console.error('💥 Erreur fatale des tests:', error)
    process.exit(1)
  })
}

module.exports = {
  runPaymentIntentTests,
  testConsecutiveCalls,
  testAmountConsistency,
  testRapidRefresh,
  testPaymentIntentFormat
}

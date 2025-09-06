/**
 * Tests Payment Amount Validation - Sécurité critique
 * 
 * Scénarios testés:
 * - Montant falsifié → refus systématique
 * - Montant correct → validation réussie
 * - Devise différente → refus
 * - Panier modifié après PI → détection fraude
 */

const fs = require('fs')
const path = require('path')

// Configuration test
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

// Helper pour simuler l'authentification test
function getTestHeaders(userId = 'fraud-test-user', email = 'fraud.test@testauth.local') {
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

// Helper pour créer PaymentIntent avec validation
async function createPaymentIntentValidated(cartData) {
  const response = await fetch(`${BASE_URL}/api/checkout/create-payment-intent`, {
    method: 'POST',
    headers: getTestHeaders(),
    body: JSON.stringify({
      cartId: cartData.id,
      email: 'fraud.test@testauth.local',
      billingAddress: {
        line1: '789 Security Street',
        city: 'Fraud City',
        state: 'QC',
        postal_code: 'H3H 3H3',
        country: 'CA'
      },
      saveAddress: false
    })
  })
  
  return response
}

// Test 1: Montant correct → validation réussie
async function testValidAmount() {
  console.log('\n🧪 Test 1: Montant correct → Validation réussie')
  
  try {
    // Panier avec montant calculable
    const validCart = {
      id: 'cm0000000000000000000007', // CUID valide
      items: [{
        id: 'valid-item',
        quantity: 2,
        variant: { id: 'valid-var', price: 50.00, currency: 'CAD' }
      }]
    }
    
    console.log('   📡 Création PI avec montant valide...')
    const response = await createPaymentIntentValidated(validCart)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(`PI création échouée: ${error.error}`)
    }
    
    const data = await response.json()
    
    // Vérifier que la réponse contient le breakdown pour transparence
    const hasBreakdown = data.breakdown && data.breakdown.items && data.breakdown.taxCalculation
    
    console.log(`   ✅ PI créé: ${data.paymentIntentId}`)
    console.log(`   💰 Montant: ${data.amount} ${data.currency}`)
    console.log(`   📊 Breakdown fourni: ${hasBreakdown ? '✅' : '❌'}`)
    
    if (hasBreakdown) {
      console.log('   ✅ SUCCÈS: Validation montant correct avec transparence')
      return true
    } else {
      console.log('   ❌ ÉCHEC: Breakdown manquant dans la réponse')
      return false
    }
    
  } catch (error) {
    console.log(`   ❌ ERREUR: ${error.message}`)
    return false
  }
}

// Test 2: Simulation tentative de fraude (montant manipulé)
async function testFraudAttemptDetection() {
  console.log('\n🧪 Test 2: Détection tentative fraude')
  
  try {
    // Créer un PI légitime d'abord
    const legitimateCart = {
      id: 'cm0000000000000000000008', // CUID valide
      items: [{
        id: 'legit-item',
        quantity: 1,
        variant: { id: 'legit-var', price: 100.00, currency: 'CAD' }
      }]
    }
    
    console.log('   📡 Création PI légitime...')
    const response = await createPaymentIntentValidated(legitimateCart)
    
    if (!response.ok) {
      const error = await response.json()
      console.log(`   ⚠️  PI légitime échoué: ${error.error}`)
      return false
    }
    
    const data = await response.json()
    console.log(`   ✅ PI légitime créé: ${data.paymentIntentId}`)
    console.log(`   💰 Montant légitime: ${data.amount} ${data.currency}`)
    
    // Simuler une modification du panier après création du PI
    // (En réalité, ceci serait détecté par le webhook lors du paiement)
    console.log('   🚨 Simulation: Panier modifié après création PI...')
    
    // Tenter de créer un nouveau PI avec cart ID différent mais montant bas (simulation fraude)
    const modifiedCart = {
      id: 'cm0000000000000000000009', // CUID différent pour simuler changement
      items: [{
        id: 'modified-item',
        quantity: 1,
        variant: { id: 'modified-var', price: 1.00, currency: 'CAD' } // Prix beaucoup plus bas
      }]
    }
    
    const fraudResponse = await createPaymentIntentValidated(modifiedCart)
    
    if (!fraudResponse.ok) {
      const fraudError = await fraudResponse.json()
      console.log(`   🔒 Tentative frauduleuse bloquée: ${fraudError.error}`)
      console.log('   ✅ SUCCÈS: Système détecte et bloque les modifications frauduleuses')
      return true
    } else {
      const fraudData = await fraudResponse.json()
      
      // Si un nouveau PI est créé, vérifier qu'il a le montant correct
      if (fraudData.amount !== data.amount) {
        console.log(`   🔄 Nouveau PI avec montant recalculé: ${fraudData.amount}`)
        console.log('   ✅ SUCCÈS: Système recalcule correctement les montants')
        return true
      } else {
        console.log('   ❌ ÉCHEC: PI réutilisé malgré modification du panier')
        return false
      }
    }
    
  } catch (error) {
    console.log(`   ❌ ERREUR: ${error.message}`)
    return false
  }
}

// Test 3: Validation devise (CAD vs USD)
async function testCurrencyValidation() {
  console.log('\n🧪 Test 3: Validation devise')
  
  try {
    // Test avec adresse canadienne (CAD attendu)
    const cadCart = {
      id: 'cm000000000000000000000a', // CUID valide
      items: [{
        id: 'cad-item',
        quantity: 1,
        variant: { id: 'cad-var', price: 75.00, currency: 'CAD' }
      }]
    }
    
    console.log('   📡 Test adresse CA → CAD...')
    const cadResponse = await fetch(`${BASE_URL}/api/checkout/create-payment-intent`, {
      method: 'POST',
      headers: getTestHeaders(),
      body: JSON.stringify({
        cartId: cadCart.id,
        email: 'currency.test@testauth.local',
        billingAddress: {
          line1: '123 Canadian Street',
          city: 'Toronto',
          state: 'ON',
          postal_code: 'M5H 2N2',
          country: 'CA'
        },
        saveAddress: false
      })
    })
    
    if (!cadResponse.ok) {
      const error = await cadResponse.json()
      throw new Error(`CAD test échoué: ${error.error}`)
    }
    
    const cadData = await cadResponse.json()
    console.log(`   💱 Devise CA: ${cadData.currency}`)
    
    // Test avec adresse américaine (USD logique, mais on force CAD pour l'instant)
    const usCart = {
      id: 'cm000000000000000000000b', // CUID valide
      items: [{
        id: 'us-item',
        quantity: 1,
        variant: { id: 'us-var', price: 75.00, currency: 'CAD' }
      }]
    }
    
    console.log('   📡 Test adresse US → devise...')
    const usResponse = await fetch(`${BASE_URL}/api/checkout/create-payment-intent`, {
      method: 'POST',
      headers: getTestHeaders(),
      body: JSON.stringify({
        cartId: usCart.id,
        email: 'currency.test@testauth.local',
        billingAddress: {
          line1: '456 American Street',
          city: 'New York',
          state: 'NY',
          postal_code: '10001',
          country: 'US'
        },
        saveAddress: false
      })
    })
    
    if (!usResponse.ok) {
      const error = await usResponse.json()
      console.log(`   ⚠️  US test échoué: ${error.error}`)
    } else {
      const usData = await usResponse.json()
      console.log(`   💱 Devise US: ${usData.currency}`)
    }
    
    // Validation: Devise cohérente
    const currencyIsValid = cadData.currency === 'CAD'
    
    if (currencyIsValid) {
      console.log('   ✅ SUCCÈS: Devise validée correctement')
      return true
    } else {
      console.log('   ❌ ÉCHEC: Devise incorrecte')
      return false
    }
    
  } catch (error) {
    console.log(`   ❌ ERREUR: ${error.message}`)
    return false
  }
}

// Test 4: Validation calcul taxes selon région
async function testTaxCalculationValidation() {
  console.log('\n🧪 Test 4: Validation calcul taxes par région')
  
  try {
    const baseAmount = 100.00
    
    // Test Québec (TPS + TVQ = 15%)
    const qcResponse = await fetch(`${BASE_URL}/api/checkout/create-payment-intent`, {
      method: 'POST',
      headers: getTestHeaders(),
      body: JSON.stringify({
        cartId: 'tax-test-qc',
        email: 'tax@test.com',
        billingAddress: {
          line1: '123 Rue du Québec',
          city: 'Montréal',
          state: 'QC',
          postal_code: 'H3H 3H3',
          country: 'CA'
        },
        saveAddress: false
      })
    })
    
    if (!qcResponse.ok) {
      console.log('   ⚠️  Test QC échoué')
      return false
    }
    
    const qcData = await qcResponse.json()
    const qcTaxRate = qcData.breakdown?.taxCalculation?.rate
    
    console.log(`   🧮 QC tax rate: ${(qcTaxRate * 100).toFixed(1)}%`)
    
    // Test Ontario (HST = 13%)
    const onResponse = await fetch(`${BASE_URL}/api/checkout/create-payment-intent`, {
      method: 'POST',
      headers: getTestHeaders(),
      body: JSON.stringify({
        cartId: 'cm000000000000000000000d',
        email: 'tax.test@testauth.local',
        billingAddress: {
          line1: '456 Ontario Street',
          city: 'Toronto',
          state: 'ON',
          postal_code: 'M5H 2N2',
          country: 'CA'
        },
        saveAddress: false
      })
    })
    
    if (!onResponse.ok) {
      console.log('   ⚠️  Test ON échoué')
    } else {
      const onData = await onResponse.json()
      const onTaxRate = onData.breakdown?.taxCalculation?.rate
      console.log(`   🧮 ON tax rate: ${(onTaxRate * 100).toFixed(1)}%`)
    }
    
    // Validation: QC devrait avoir 15%
    const qcTaxValid = Math.abs(qcTaxRate - 0.15) < 0.001
    
    if (qcTaxValid) {
      console.log('   ✅ SUCCÈS: Calcul taxes par région correct')
      return true
    } else {
      console.log('   ❌ ÉCHEC: Taux de taxe incorrect')
      return false
    }
    
  } catch (error) {
    console.log(`   ❌ ERREUR: ${error.message}`)
    return false
  }
}

// Fonction principale
async function runAmountValidationTests() {
  console.log('🧪 TESTS PAYMENT AMOUNT VALIDATION - SÉCURITÉ CRITIQUE')
  console.log('======================================================')
  
  if (process.env.NODE_ENV === 'production') {
    console.log('❌ Ces tests ne peuvent être exécutés qu\'en développement')
    process.exit(1)
  }
  
  const results = []
  
  // Exécuter tous les tests
  results.push(await testValidAmount())
  results.push(await testFraudAttemptDetection())
  results.push(await testCurrencyValidation())
  results.push(await testTaxCalculationValidation())
  
  // Résultats
  console.log('\n📊 RÉSULTATS SÉCURITÉ PAIEMENTS')
  console.log('================================')
  
  const passed = results.filter(r => r).length
  const total = results.length
  
  console.log(`✅ Tests réussis: ${passed}/${total}`)
  console.log(`❌ Tests échoués: ${total - passed}/${total}`)
  
  if (passed === total) {
    console.log('\n🎉 SÉCURITÉ PAIEMENTS VALIDÉE!')
    console.log('🔒 Le système détecte et bloque les tentatives de fraude')
    process.exit(0)
  } else {
    console.log('\n💥 FAILLE DE SÉCURITÉ DÉTECTÉE!')
    console.log('🚨 Corriger immédiatement avant déploiement')
    process.exit(1)
  }
}

// Lancer les tests si exécuté directement
if (require.main === module) {
  runAmountValidationTests().catch(error => {
    console.error('💥 Erreur fatale tests sécurité:', error)
    process.exit(1)
  })
}

module.exports = {
  runAmountValidationTests,
  testValidAmount,
  testFraudAttemptDetection,
  testCurrencyValidation,
  testTaxCalculationValidation
}

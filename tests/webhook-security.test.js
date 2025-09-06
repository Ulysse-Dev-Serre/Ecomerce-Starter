/**
 * Tests Webhook Security - Signature + Anti-rejeu
 * 
 * Scénarios testés:
 * - Signature invalide → 400 refusé
 * - Même event.id envoyé 2x → une seule écriture DB
 * - Event déjà traité → ignorer replay
 * - Retry après échec → autoriser retraitement
 */

const crypto = require('crypto')

// Configuration test
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'
const WEBHOOK_URL = `${BASE_URL}/api/webhooks/stripe`

// Fake webhook secret pour tests (sera overridé en vrai)
const TEST_WEBHOOK_SECRET = 'whsec_test_secret_for_webhook_security_tests'

/**
 * Crée une signature Stripe valide pour les tests
 */
function createStripeSignature(payload, secret, timestamp = Math.floor(Date.now() / 1000)) {
  const payloadData = `${timestamp}.${payload}`
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadData, 'utf8')
    .digest('hex')
  
  return `t=${timestamp},v1=${signature}`
}

/**
 * Crée un événement Stripe de test
 */
function createTestStripeEvent(eventId = `evt_test_${Date.now()}`) {
  return {
    id: eventId,
    type: 'payment_intent.succeeded',
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    data: {
      object: {
        id: `pi_test_${Date.now()}`,
        amount: 10000,
        currency: 'cad',
        status: 'succeeded',
        metadata: {
          cartId: 'test-cart-webhook-security',
          userId: 'test-user-webhook-security'
        }
      }
    }
  }
}

// Test 1: Signature invalide → 400 refusé
async function testInvalidSignature() {
  console.log('\n🧪 Test 1: Signature invalide → Refus 400')
  
  try {
    const testEvent = createTestStripeEvent()
    const payload = JSON.stringify(testEvent)
    
    // Créer une signature invalide
    const invalidSignature = 'invalid_signature_123'
    
    console.log('   📡 Envoi webhook avec signature invalide...')
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': invalidSignature
      },
      body: payload
    })
    
    console.log(`   📊 Status reçu: ${response.status}`)
    
    if (response.status === 400) {
      const error = await response.json()
      console.log(`   ✅ SUCCÈS: Signature invalide correctement rejetée`)
      console.log(`   📝 Message: ${error.error}`)
      return true
    } else {
      console.log('   ❌ ÉCHEC: Signature invalide acceptée')
      return false
    }
    
  } catch (error) {
    console.log(`   ❌ ERREUR: ${error.message}`)
    return false
  }
}

// Test 2: Signature manquante → 400 refusé
async function testMissingSignature() {
  console.log('\n🧪 Test 2: Signature manquante → Refus 400')
  
  try {
    const testEvent = createTestStripeEvent()
    const payload = JSON.stringify(testEvent)
    
    console.log('   📡 Envoi webhook sans signature...')
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // Pas de Stripe-Signature header
      },
      body: payload
    })
    
    console.log(`   📊 Status reçu: ${response.status}`)
    
    if (response.status === 400) {
      const error = await response.json()
      console.log(`   ✅ SUCCÈS: Signature manquante correctement rejetée`)
      console.log(`   📝 Message: ${error.error}`)
      return true
    } else {
      console.log('   ❌ ÉCHEC: Signature manquante acceptée')
      return false
    }
    
  } catch (error) {
    console.log(`   ❌ ERREUR: ${error.message}`)
    return false
  }
}

// Test 3: Même event.id envoyé 2x → une seule écriture
async function testEventIdempotence() {
  console.log('\n🧪 Test 3: Même event.id 2x → Une seule écriture')
  
  // Note: Ce test nécessiterait une vraie signature Stripe
  // Pour l'instant, on teste la logique d'idempotence uniquement
  
  try {
    const eventId = `evt_idempotence_test_${Date.now()}`
    console.log(`   📡 Test idempotence pour event: ${eventId}`)
    
    // Simuler une vérification d'idempotence directe
    const { ensureEventIdempotence } = require('../src/lib/webhook-security')
    
    // Premier traitement
    console.log('   📝 Premier enregistrement event...')
    const check1 = await ensureEventIdempotence(eventId, 'payment_intent.succeeded')
    
    console.log(`   📊 Premier check - shouldProcess: ${check1.shouldProcess}`)
    
    // Marquer comme traité
    const { markEventProcessed } = require('../src/lib/webhook-security')
    await markEventProcessed(eventId, true)
    
    // Deuxième tentative (replay)
    console.log('   📝 Tentative replay...')
    const check2 = await ensureEventIdempotence(eventId, 'payment_intent.succeeded')
    
    console.log(`   📊 Deuxième check - shouldProcess: ${check2.shouldProcess}`)
    console.log(`   📊 IsRetry: ${check2.isRetry}`)
    
    // Vérification: Premier OK, deuxième refusé
    if (check1.shouldProcess && !check2.shouldProcess && check2.isRetry) {
      console.log('   ✅ SUCCÈS: Idempotence fonctionne - replay ignoré')
      return true
    } else {
      console.log('   ❌ ÉCHEC: Idempotence défaillante')
      return false
    }
    
  } catch (error) {
    console.log(`   ❌ ERREUR: ${error.message}`)
    return false
  }
}

// Test 4: Retry après échec → autoriser retraitement
async function testFailedEventRetry() {
  console.log('\n🧪 Test 4: Retry après échec → Retraitement autorisé')
  
  try {
    const eventId = `evt_retry_test_${Date.now()}`
    console.log(`   📡 Test retry pour event: ${eventId}`)
    
    const { ensureEventIdempotence, markEventProcessed } = require('../src/lib/webhook-security')
    
    // Premier traitement (échec)
    console.log('   📝 Premier traitement (échec simulé)...')
    const check1 = await ensureEventIdempotence(eventId, 'payment_intent.succeeded')
    
    // Marquer comme échec
    await markEventProcessed(eventId, false, 'Test error for retry logic')
    
    // Deuxième tentative (retry)
    console.log('   📝 Tentative retry...')
    const check2 = await ensureEventIdempotence(eventId, 'payment_intent.succeeded')
    
    console.log(`   📊 Premier check - shouldProcess: ${check1.shouldProcess}`)
    console.log(`   📊 Retry check - shouldProcess: ${check2.shouldProcess}`)
    console.log(`   📊 IsRetry: ${check2.isRetry}`)
    
    // Vérification: Les deux tentatives autorisées
    if (check1.shouldProcess && check2.shouldProcess && check2.isRetry) {
      console.log('   ✅ SUCCÈS: Retry après échec autorisé')
      return true
    } else {
      console.log('   ❌ ÉCHEC: Retry après échec bloqué')
      return false
    }
    
  } catch (error) {
    console.log(`   ❌ ERREUR: ${error.message}`)
    return false
  }
}

// Test 5: Statistiques webhook
async function testWebhookStats() {
  console.log('\n🧪 Test 5: Statistiques webhook')
  
  try {
    const { getWebhookStats } = require('../src/lib/webhook-security')
    
    console.log('   📊 Récupération statistiques...')
    const stats = await getWebhookStats()
    
    console.log('   📈 Stats webhook:', {
      total: stats.total,
      processed: stats.processed,
      failed: stats.failed,
      pending: stats.pending,
      avgRetryCount: stats.avgRetryCount
    })
    
    // Vérification: Stats cohérentes
    const statsCoherent = (stats.processed + stats.failed + stats.pending) <= stats.total
    
    if (statsCoherent) {
      console.log('   ✅ SUCCÈS: Statistiques cohérentes')
      return true
    } else {
      console.log('   ❌ ÉCHEC: Statistiques incohérentes')
      return false
    }
    
  } catch (error) {
    console.log(`   ❌ ERREUR: ${error.message}`)
    return false
  }
}

// Fonction principale
async function runWebhookSecurityTests() {
  console.log('🧪 TESTS WEBHOOK SECURITY - SIGNATURE + ANTI-REJEU')
  console.log('===================================================')
  
  if (process.env.NODE_ENV === 'production') {
    console.log('❌ Ces tests ne peuvent être exécutés qu\'en développement')
    process.exit(1)
  }
  
  const results = []
  
  // Exécuter tous les tests
  results.push(await testInvalidSignature())
  results.push(await testMissingSignature()) 
  results.push(await testEventIdempotence())
  results.push(await testFailedEventRetry())
  results.push(await testWebhookStats())
  
  // Résultats
  console.log('\n📊 RÉSULTATS SÉCURITÉ WEBHOOK')
  console.log('==============================')
  
  const passed = results.filter(r => r).length
  const total = results.length
  
  console.log(`✅ Tests réussis: ${passed}/${total}`)
  console.log(`❌ Tests échoués: ${total - passed}/${total}`)
  
  if (passed === total) {
    console.log('\n🎉 SÉCURITÉ WEBHOOK VALIDÉE!')
    console.log('🔒 Protection signature + anti-rejeu opérationnelle')
    process.exit(0)
  } else {
    console.log('\n💥 FAILLE SÉCURITÉ WEBHOOK DÉTECTÉE!')
    console.log('🚨 Corriger immédiatement avant déploiement')
    process.exit(1)
  }
}

// Lancer les tests si exécuté directement
if (require.main === module) {
  runWebhookSecurityTests().catch(error => {
    console.error('💥 Erreur fatale tests webhook sécurité:', error)
    process.exit(1)
  })
}

module.exports = {
  runWebhookSecurityTests,
  testInvalidSignature,
  testMissingSignature,
  testEventIdempotence,
  testFailedEventRetry,
  testWebhookStats,
  createStripeSignature,
  createTestStripeEvent
}

/**
 * Test Runner - Lance les tests avec l'environnement correct
 * Vérifie que le serveur est accessible avant de lancer les tests
 */

const { spawn } = require('child_process')

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'
const HEALTH_ENDPOINT = `${BASE_URL}/api/auth/session`

/**
 * Vérifie si le serveur est accessible
 */
async function checkServerHealth() {
  try {
    console.log(`🔍 Vérification serveur: ${BASE_URL}`)
    
    const response = await fetch(HEALTH_ENDPOINT)
    
    if (response.ok || response.status === 401) {
      console.log('✅ Serveur accessible')
      return true
    } else {
      console.log(`❌ Serveur répond avec status: ${response.status}`)
      return false
    }
  } catch (error) {
    console.log(`❌ Serveur non accessible: ${error.message}`)
    return false
  }
}

/**
 * Lance un test avec l'environnement correct
 */
function runTest(testFile) {
  return new Promise((resolve, reject) => {
    console.log(`\n🧪 Lancement: ${testFile}`)
    
    const child = spawn('node', [testFile], {
      env: {
        ...process.env,
        NODE_ENV: 'development'
      },
      stdio: 'inherit'
    })
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${testFile} - SUCCÈS`)
        resolve(true)
      } else {
        console.log(`❌ ${testFile} - ÉCHEC (code: ${code})`)
        resolve(false)
      }
    })
    
    child.on('error', (error) => {
      console.log(`💥 ${testFile} - ERREUR: ${error.message}`)
      resolve(false)
    })
  })
}

/**
 * Lance tous les tests payment
 */
async function runPaymentTests() {
  console.log('🧪 PAYMENT TESTS RUNNER')
  console.log('=======================')
  
  // 1. Vérifier serveur
  const serverOk = await checkServerHealth()
  if (!serverOk) {
    console.log('\n💥 SERVEUR NON ACCESSIBLE')
    console.log('🔧 Lancez d\'abord: npm run dev')
    process.exit(1)
  }
  
  // 2. Liste des tests
  const tests = [
    'tests/payment-intent-reuse.test.js',
    'tests/payment-intent-edge-cases.test.js', 
    'tests/payment-amount-validation.test.js',
    'tests/webhook-security.test.js'
  ]
  
  // 3. Lancer les tests
  const results = []
  for (const test of tests) {
    const result = await runTest(test)
    results.push(result)
  }
  
  // 4. Résultats globaux
  const passed = results.filter(r => r).length
  const total = results.length
  
  console.log('\n📊 RÉSULTATS GLOBAUX')
  console.log('====================')
  console.log(`✅ Tests réussis: ${passed}/${total}`)
  console.log(`❌ Tests échoués: ${total - passed}/${total}`)
  
  if (passed === total) {
    console.log('\n🎉 TOUS LES TESTS PAIEMENTS PASSENT!')
    process.exit(0)
  } else {
    console.log('\n💥 DES TESTS PAIEMENTS ÉCHOUENT')
    process.exit(1)
  }
}

// Lancer si exécuté directement
if (require.main === module) {
  runPaymentTests().catch(error => {
    console.error('💥 Erreur test runner:', error)
    process.exit(1)
  })
}

module.exports = { runPaymentTests, checkServerHealth, runTest }

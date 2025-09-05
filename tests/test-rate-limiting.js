#!/usr/bin/env node

/**
 * Script de test automatisé pour le rate limiting
 * Usage: node tests/test-rate-limiting.js
 */

const BASE_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(options.body || {})
    })
    
    return {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'x-ratelimit-limit': response.headers.get('x-ratelimit-limit'),
        'x-ratelimit-remaining': response.headers.get('x-ratelimit-remaining'),
        'x-ratelimit-reset': response.headers.get('x-ratelimit-reset'),
        'retry-after': response.headers.get('retry-after')
      },
      data: await response.json().catch(() => null)
    }
  } catch (error) {
    return {
      error: error.message,
      status: 0
    }
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function testAuthRateLimit() {
  console.log('\n🔐 Test du rate limiting sur l\'authentification')
  console.log('Limite: 5 requêtes par 15 minutes')
  console.log('=' .repeat(50))
  
  const testEmail = 'test-rate-limit@example.com'
  const authUrl = `${BASE_URL}/api/auth/callback/credentials`
  
  const results = []
  
  // Faire 6 requêtes rapides
  for (let i = 1; i <= 6; i++) {
    console.log(`Requête ${i}/6...`)
    
    const result = await makeRequest(authUrl, {
      body: {
        email: testEmail,
        password: 'wrongpassword',
        callbackUrl: `${BASE_URL}/`,
        csrfToken: 'test'
      }
    })
    
    results.push(result)
    
    console.log(`  Status: ${result.status}`)
    console.log(`  Remaining: ${result.headers['x-ratelimit-remaining'] || 'N/A'}`)
    
    if (result.status === 429) {
      console.log(`  ✅ Rate limit activé à la requête ${i}`)
      console.log(`  Retry-After: ${result.headers['retry-after']}s`)
      break
    }
    
    // Petite pause entre les requêtes
    await sleep(100)
  }
  
  return results
}

async function testCartRateLimit() {
  console.log('\n🛒 Test du rate limiting sur le panier')
  console.log('Limite: 30 requêtes par minute')
  console.log('=' .repeat(50))
  
  // Note: Ce test nécessite un userId valide et une session active
  console.log('⚠️  Pour tester le panier, vous devez:')
  console.log('   1. Être connecté avec un compte valide')
  console.log('   2. Remplacer USER_ID par un ID utilisateur réel')
  console.log('   3. Avoir un variantId valide')
  
  const userId = 'USER_ID' // À remplacer par un vrai userId
  const cartUrl = `${BASE_URL}/api/cart/${userId}`
  
  if (userId === 'USER_ID') {
    console.log('❌ Test du panier ignoré (USER_ID non configuré)')
    return []
  }
  
  const results = []
  
  // Faire 35 requêtes pour dépasser la limite de 30
  for (let i = 1; i <= 35; i++) {
    const result = await makeRequest(cartUrl, {
      headers: {
        'Cookie': 'session=your-session-cookie' // À remplacer
      },
      body: {
        variantId: 'test-variant-id',
        quantity: 1
      }
    })
    
    results.push(result)
    
    if (i % 5 === 0 || result.status === 429) {
      console.log(`Requête ${i}: Status ${result.status}, Remaining: ${result.headers['x-ratelimit-remaining'] || 'N/A'}`)
    }
    
    if (result.status === 429) {
      console.log(`✅ Rate limit panier activé à la requête ${i}`)
      break
    }
    
    await sleep(50) // 50ms entre les requêtes
  }
  
  return results
}

async function testRateLimitHeaders() {
  console.log('\n📋 Test des headers de rate limiting')
  console.log('=' .repeat(50))
  
  const result = await makeRequest(`${BASE_URL}/api/auth/callback/credentials`, {
    body: {
      email: 'header-test@example.com',
      password: 'test',
      callbackUrl: `${BASE_URL}/`
    }
  })
  
  console.log('Headers de rate limiting:')
  Object.entries(result.headers).forEach(([key, value]) => {
    if (value && key.includes('ratelimit')) {
      console.log(`  ${key}: ${value}`)
    }
  })
  
  return result
}

async function testIPBasedLimiting() {
  console.log('\n🌐 Test du rate limiting basé sur IP')
  console.log('=' .repeat(50))
  
  // Test avec IP différente
  const result1 = await makeRequest(`${BASE_URL}/api/auth/callback/credentials`, {
    headers: {
      'X-Forwarded-For': '192.168.1.100'
    },
    body: {
      email: 'ip-test@example.com',
      password: 'test'
    }
  })
  
  console.log(`IP 192.168.1.100 - Status: ${result1.status}`)
  
  // Test avec une autre IP
  const result2 = await makeRequest(`${BASE_URL}/api/auth/callback/credentials`, {
    headers: {
      'X-Forwarded-For': '192.168.1.200'
    },
    body: {
      email: 'ip-test@example.com',
      password: 'test'
    }
  })
  
  console.log(`IP 192.168.1.200 - Status: ${result2.status}`)
  
  return [result1, result2]
}

async function runAllTests() {
  console.log('🧪 Test Suite - Rate Limiting')
  console.log('Serveur:', BASE_URL)
  console.log('Date:', new Date().toISOString())
  
  try {
    await testAuthRateLimit()
    await testCartRateLimit()
    await testRateLimitHeaders()
    await testIPBasedLimiting()
    
    console.log('\n✅ Tests terminés!')
    console.log('\n📝 Notes importantes:')
    console.log('- Les tests d\'auth peuvent nécessiter un CSRF token valide')
    console.log('- Les tests de panier nécessitent une session active')
    console.log('- Vérifiez les logs du serveur pour plus de détails')
    console.log('- Attendez la fenêtre de reset avant de relancer les tests')
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message)
  }
}

if (require.main === module) {
  runAllTests()
}

module.exports = {
  testAuthRateLimit,
  testCartRateLimit,
  testRateLimitHeaders,
  testIPBasedLimiting
}

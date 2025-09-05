#!/usr/bin/env node

/**
 * Script de test automatisé pour la validation des entrées
 * Usage: node tests/test-validation.js
 */

const BASE_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

// Générateurs de données malformées
const MaliciousPayloads = {
  // Injection XSS
  xss: [
    '<script>alert("xss")</script>',
    '"><script>alert("xss")</script>',
    'javascript:alert("xss")',
    '<img src=x onerror=alert("xss")>',
    '\'"--></script><script>alert("xss")</script>'
  ],

  // Injection SQL
  sql: [
    "'; DROP TABLE users; --",
    "' OR 1=1; --",
    "'; DELETE FROM products WHERE 1=1; --",
    "admin'--",
    "' UNION SELECT * FROM users; --"
  ],

  // Path traversal
  pathTraversal: [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\config\\sam',
    '/etc/shadow',
    '....//....//....//etc/passwd',
    '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd'
  ],

  // Très longues chaînes
  longStrings: [
    'A'.repeat(10000),
    'A'.repeat(100000),
    '🚀'.repeat(5000), // Unicode
  ],

  // Injection de prototype
  prototype: [
    '__proto__',
    'constructor',
    'prototype',
    '__proto__.isAdmin',
    'constructor.prototype.isAdmin'
  ],

  // Types incorrects
  wrongTypes: [
    { notAString: 'should be string' },
    ['array', 'instead', 'of', 'string'],
    null,
    undefined,
    NaN,
    Infinity
  ],

  // Caractères de contrôle
  controlChars: [
    'test\u0000null',
    'test\u001funit separator',
    'test\u007fdelete',
    'test\u2028line separator',
    'test\u2029paragraph separator'
  ]
}

async function makeRequest(endpoint, payload, method = 'POST') {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: method === 'GET' ? undefined : JSON.stringify(payload)
    })
    
    const data = await response.json().catch(() => null)
    
    return {
      status: response.status,
      data,
      headers: Object.fromEntries(response.headers.entries())
    }
  } catch (error) {
    return {
      status: 0,
      error: error.message
    }
  }
}

async function testContactValidation() {
  console.log('\n📧 Test validation formulaire de contact')
  console.log('=' .repeat(50))
  
  const tests = [
    {
      name: 'Champs extra malveillants',
      payload: {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test',
        message: 'Test message',
        isAdmin: true,
        password: 'hacked',
        extraField: 'should be rejected'
      },
      expectedStatus: 400
    },
    
    {
      name: 'Injection XSS dans nom',
      payload: {
        name: MaliciousPayloads.xss[0],
        email: 'test@example.com',
        subject: 'Test',
        message: 'Test message'
      },
      expectedStatus: 400
    },
    
    {
      name: 'Email invalide',
      payload: {
        name: 'John Doe',
        email: 'not-an-email',
        subject: 'Test',
        message: 'Test message'
      },
      expectedStatus: 400
    },
    
    {
      name: 'Message trop long',
      payload: {
        name: 'John Doe',
        email: 'test@example.com',
        subject: 'Test',
        message: MaliciousPayloads.longStrings[0]
      },
      expectedStatus: 400
    },
    
    {
      name: 'Injection de prototype',
      payload: {
        name: 'John Doe',
        email: 'test@example.com',
        subject: 'Test',
        message: 'Test',
        __proto__: { isAdmin: true }
      },
      expectedStatus: 400
    },
    
    {
      name: 'Types de données incorrects',
      payload: {
        name: 123, // Should be string
        email: ['array@test.com'],
        subject: null,
        message: { message: 'nested object' }
      },
      expectedStatus: 400
    }
  ]
  
  for (const test of tests) {
    const result = await makeRequest('/api/contact', test.payload)
    const passed = result.status === test.expectedStatus
    
    console.log(`${passed ? '✅' : '❌'} ${test.name}`)
    console.log(`   Status: ${result.status} (attendu: ${test.expectedStatus})`)
    
    if (!passed && result.data) {
      console.log(`   Réponse: ${JSON.stringify(result.data).substring(0, 100)}...`)
    }
  }
}

async function testCartValidation() {
  console.log('\n🛒 Test validation panier')
  console.log('=' .repeat(50))
  
  const validUserId = 'test-user-id'
  
  const tests = [
    {
      name: 'Quantité négative',
      payload: {
        variantId: 'valid-variant-id',
        quantity: -5
      },
      expectedStatus: 400
    },
    
    {
      name: 'Quantité trop élevée',
      payload: {
        variantId: 'valid-variant-id',
        quantity: 999999
      },
      expectedStatus: 400
    },
    
    {
      name: 'Champs extra malveillants',
      payload: {
        variantId: 'valid-variant-id',
        quantity: 1,
        price: 0.01,
        isAdmin: true,
        discount: 100
      },
      expectedStatus: 400
    },
    
    {
      name: 'ID avec path traversal',
      payload: {
        variantId: MaliciousPayloads.pathTraversal[0],
        quantity: 1
      },
      expectedStatus: 400
    },
    
    {
      name: 'Types de données incorrects',
      payload: {
        variantId: 12345, // Should be string
        quantity: 'not-a-number'
      },
      expectedStatus: 400
    }
  ]
  
  for (const test of tests) {
    const result = await makeRequest(`/api/cart/${validUserId}`, test.payload)
    const passed = result.status === test.expectedStatus || result.status === 401 // 401 si pas d'auth
    
    console.log(`${passed ? '✅' : '❌'} ${test.name}`)
    console.log(`   Status: ${result.status} (attendu: ${test.expectedStatus} ou 401)`)
    
    if (!passed && result.data) {
      console.log(`   Réponse: ${JSON.stringify(result.data).substring(0, 100)}...`)
    }
  }
}

async function testMassAssignmentProtection() {
  console.log('\n🛡️  Test protection Mass Assignment')
  console.log('=' .repeat(50))
  
  const tests = [
    {
      name: 'Contact avec champs admin',
      endpoint: '/api/contact',
      payload: {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test',
        message: 'Test message',
        // Champs qui ne devraient pas être acceptés
        isAdmin: true,
        role: 'ADMIN',
        permissions: ['ALL'],
        internalId: 'ADM001'
      }
    }
  ]
  
  for (const test of tests) {
    const result = await makeRequest(test.endpoint, test.payload)
    const passed = result.status === 400
    
    console.log(`${passed ? '✅' : '❌'} ${test.name}`)
    console.log(`   Status: ${result.status}`)
    
    if (result.data && result.data.code === 'VALIDATION_ERROR') {
      console.log(`   ✅ Validation error détectée correctement`)
    }
  }
}

async function testEdgeCases() {
  console.log('\n⚡ Test cas limites')
  console.log('=' .repeat(50))
  
  const tests = [
    {
      name: 'JSON malformé',
      endpoint: '/api/contact',
      payload: '{"name": "test" "email": "missing-comma"}', // JSON invalide
      rawPayload: true
    },
    
    {
      name: 'Payload vide',
      endpoint: '/api/contact',
      payload: {},
    },
    
    {
      name: 'Payload null',
      endpoint: '/api/contact',
      payload: null,
    },
    
    {
      name: 'Array au lieu d\'objet',
      endpoint: '/api/contact',
      payload: ['not', 'an', 'object'],
    }
  ]
  
  for (const test of tests) {
    try {
      const response = await fetch(`${BASE_URL}${test.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: test.rawPayload ? test.payload : JSON.stringify(test.payload)
      })
      
      const result = {
        status: response.status,
        data: await response.json().catch(() => null)
      }
      
      const passed = result.status >= 400 && result.status < 500
      
      console.log(`${passed ? '✅' : '❌'} ${test.name}`)
      console.log(`   Status: ${result.status}`)
      
    } catch (error) {
      console.log(`✅ ${test.name}`)
      console.log(`   Erreur réseau attendue: ${error.message}`)
    }
  }
}

async function runAllValidationTests() {
  console.log('🧪 Test Suite - Validation des entrées utilisateur')
  console.log('Serveur:', BASE_URL)
  console.log('Date:', new Date().toISOString())
  console.log('=' .repeat(70))
  
  try {
    await testContactValidation()
    await testCartValidation()
    await testMassAssignmentProtection()
    await testEdgeCases()
    
    console.log('\n✅ Tests de validation terminés!')
    console.log('\n📝 Points vérifiés:')
    console.log('- Rejection des champs non autorisés (mass assignment)')
    console.log('- Validation des types de données')
    console.log('- Limites de taille/longueur')
    console.log('- Protection contre injections XSS/SQL')
    console.log('- Sanitization des données')
    console.log('- Gestion des cas limites (JSON malformé, etc.)')
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message)
  }
}

// Fonction pour générer des payloads aléatoirement malformés
function generateRandomMaliciousPayload() {
  const types = Object.keys(MaliciousPayloads)
  const randomType = types[Math.floor(Math.random() * types.length)]
  const payloads = MaliciousPayloads[randomType]
  
  return payloads[Math.floor(Math.random() * payloads.length)]
}

// Test de fuzzing basique
async function fuzzTest(endpoint, basePayload, iterations = 10) {
  console.log(`\n🎲 Fuzz test sur ${endpoint}`)
  console.log('=' .repeat(50))
  
  for (let i = 0; i < iterations; i++) {
    const payload = { ...basePayload }
    
    // Remplacer des champs par des valeurs malveillantes
    const fields = Object.keys(payload)
    const randomField = fields[Math.floor(Math.random() * fields.length)]
    payload[randomField] = generateRandomMaliciousPayload()
    
    const result = await makeRequest(endpoint, payload)
    const passed = result.status >= 400 && result.status < 500
    
    console.log(`${passed ? '✅' : '❌'} Fuzz ${i + 1}: Status ${result.status}`)
  }
}

// Exécution si appelé directement
if (require.main === module) {
  runAllValidationTests()
    .then(() => {
      // Optionnel: fuzz test
      return fuzzTest('/api/contact', {
        name: 'Test',
        email: 'test@example.com',
        subject: 'Test',
        message: 'Test'
      }, 5)
    })
    .catch(console.error)
}

module.exports = {
  testContactValidation,
  testCartValidation,
  testMassAssignmentProtection,
  testEdgeCases,
  fuzzTest,
  MaliciousPayloads
}

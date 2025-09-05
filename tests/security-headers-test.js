#!/usr/bin/env node

/**
 * Script de test des en-têtes de sécurité
 * Usage: node tests/security-headers-test.js [URL]
 * 
 * Ce script vérifie la présence et la configuration correcte
 * des en-têtes de sécurité critiques.
 */

const BASE_URL = process.argv[2] || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

// Configuration des tests d'en-têtes de sécurité
const SECURITY_TESTS = {
  // En-têtes requis avec leurs valeurs attendues/patterns
  required: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': /^(strict-origin-when-cross-origin|strict-origin|no-referrer)$/,
    'Content-Security-Policy': /default-src\s+[^;]*'self'/,
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin'
  },
  
  // En-têtes conditionnels (production uniquement)
  production: {
    'Strict-Transport-Security': /max-age=\d{7,}.*includeSubDomains/
  },
  
  // En-têtes qui ne doivent PAS être présents (pour sécurité)
  forbidden: [
    'Server',
    'X-Powered-By'
  ]
}

async function testSecurityHeaders(url) {
  console.log(`🔒 Test des en-têtes de sécurité pour: ${url}\n`)
  
  try {
    const response = await fetch(url)
    const headers = Object.fromEntries(response.headers.entries())
    
    const results = {
      passed: [],
      failed: [],
      warnings: []
    }
    
    // Test des en-têtes requis
    console.log('📋 En-têtes de sécurité requis:')
    console.log('=' .repeat(50))
    
    Object.entries(SECURITY_TESTS.required).forEach(([headerName, expectedValue]) => {
      const actualValue = headers[headerName.toLowerCase()]
      
      if (!actualValue) {
        results.failed.push(`❌ ${headerName}: MANQUANT`)
        console.log(`❌ ${headerName}: MANQUANT`)
      } else {
        const isValid = typeof expectedValue === 'string' 
          ? actualValue === expectedValue
          : expectedValue.test(actualValue)
          
        if (isValid) {
          results.passed.push(`✅ ${headerName}: OK`)
          console.log(`✅ ${headerName}: ${actualValue}`)
        } else {
          results.failed.push(`❌ ${headerName}: "${actualValue}" (attendu: ${expectedValue})`)
          console.log(`❌ ${headerName}: "${actualValue}"`)
          console.log(`   Attendu: ${expectedValue}`)
        }
      }
    })
    
    // Test des en-têtes de production
    const isProduction = url.startsWith('https')
    if (isProduction) {
      console.log('\n🏭 En-têtes spécifiques production:')
      console.log('=' .repeat(50))
      
      Object.entries(SECURITY_TESTS.production).forEach(([headerName, expectedPattern]) => {
        const actualValue = headers[headerName.toLowerCase()]
        
        if (!actualValue) {
          results.warnings.push(`⚠️  ${headerName}: Recommandé en production`)
          console.log(`⚠️  ${headerName}: MANQUANT (recommandé en production)`)
        } else {
          const isValid = expectedPattern.test(actualValue)
          if (isValid) {
            results.passed.push(`✅ ${headerName}: OK`)
            console.log(`✅ ${headerName}: ${actualValue}`)
          } else {
            results.failed.push(`❌ ${headerName}: Configuration incorrecte`)
            console.log(`❌ ${headerName}: "${actualValue}"`)
          }
        }
      })
    } else {
      console.log('\n🔧 Mode développement: en-têtes production ignorés')
    }
    
    // Test des en-têtes interdits
    console.log('\n🚫 Vérification en-têtes sensibles:')
    console.log('=' .repeat(50))
    
    SECURITY_TESTS.forbidden.forEach(headerName => {
      const actualValue = headers[headerName.toLowerCase()]
      
      if (actualValue && actualValue.trim() !== '') {
        results.warnings.push(`⚠️  ${headerName}: "${actualValue}" (exposition d'informations)`)
        console.log(`⚠️  ${headerName}: "${actualValue}" (peut exposer des informations)`)
      } else {
        results.passed.push(`✅ ${headerName}: Masqué/absent`)
        console.log(`✅ ${headerName}: Masqué ou absent`)
      }
    })
    
    // Vérification CSP spécifique
    console.log('\n🛡️  Analyse Content Security Policy:')
    console.log('=' .repeat(50))
    
    const csp = headers['content-security-policy']
    if (csp) {
      analyzeCSP(csp, results)
    } else {
      console.log('❌ CSP complètement manquante')
      results.failed.push('❌ CSP: Politique de sécurité manquante')
    }
    
    // Cookies de sécurité (test approximatif via Set-Cookie headers)
    console.log('\n🍪 Vérification configuration cookies:')
    console.log('=' .repeat(50))
    
    const setCookies = response.headers.getSetCookie?.() || []
    if (setCookies.length > 0) {
      analyzeCookieSecurity(setCookies, results)
    } else {
      console.log('ℹ️  Aucun cookie défini dans cette réponse')
    }
    
    // Résumé final
    console.log('\n📊 Résumé des tests:')
    console.log('=' .repeat(50))
    console.log(`✅ Réussis: ${results.passed.length}`)
    console.log(`❌ Échecs: ${results.failed.length}`)
    console.log(`⚠️  Avertissements: ${results.warnings.length}`)
    
    if (results.failed.length === 0) {
      console.log('\n🎉 Tous les tests de sécurité critiques sont passés!')
    } else {
      console.log('\n🔧 Actions recommandées:')
      results.failed.forEach(failure => console.log(`  • ${failure}`))
    }
    
    if (results.warnings.length > 0) {
      console.log('\n💡 Améliorations possibles:')
      results.warnings.forEach(warning => console.log(`  • ${warning}`))
    }
    
    return {
      success: results.failed.length === 0,
      score: Math.round((results.passed.length / (results.passed.length + results.failed.length)) * 100),
      details: results
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message)
    return { success: false, error: error.message }
  }
}

function analyzeCSP(csp, results) {
  const directives = csp.split(';').map(d => d.trim())
  
  // Vérifications CSP critiques
  const criticalDirectives = [
    { name: 'default-src', pattern: /'self'/, description: "Source par défaut sécurisée" },
    { name: 'script-src', pattern: /.+/, description: "Contrôle des scripts" },
    { name: 'object-src', pattern: /'none'/, description: "Blocage plugins/Flash" },
    { name: 'base-uri', pattern: /'self'/, description: "Restriction base URI" }
  ]
  
  criticalDirectives.forEach(({ name, pattern, description }) => {
    const directive = directives.find(d => d.startsWith(name))
    
    if (!directive) {
      results.failed.push(`❌ CSP ${name}: Directive manquante`)
      console.log(`❌ CSP ${name}: Directive manquante (${description})`)
    } else if (pattern.test(directive)) {
      results.passed.push(`✅ CSP ${name}: OK`)
      console.log(`✅ CSP ${name}: ${directive}`)
    } else {
      results.warnings.push(`⚠️  CSP ${name}: Configuration à vérifier`)
      console.log(`⚠️  CSP ${name}: ${directive}`)
    }
  })
  
  // Avertissements CSP
  if (csp.includes("'unsafe-eval'")) {
    results.warnings.push(`⚠️  CSP: 'unsafe-eval' détecté`)
    console.log(`⚠️  CSP: 'unsafe-eval' peut être dangereux`)
  }
  
  if (csp.includes("'unsafe-inline'")) {
    results.warnings.push(`⚠️  CSP: 'unsafe-inline' détecté`)
    console.log(`⚠️  CSP: 'unsafe-inline' réduit la protection`)
  }
}

function analyzeCookieSecurity(setCookies, results) {
  setCookies.forEach((cookieString, index) => {
    const cookieName = cookieString.split('=')[0]
    console.log(`🍪 Cookie ${index + 1}: ${cookieName}`)
    
    const flags = {
      httpOnly: cookieString.includes('HttpOnly'),
      secure: cookieString.includes('Secure'),
      sameSite: cookieString.match(/SameSite=(\w+)/i)?.[1]
    }
    
    // Vérifications de sécurité cookies
    if (flags.httpOnly) {
      console.log(`  ✅ HttpOnly: Activé`)
    } else {
      console.log(`  ⚠️  HttpOnly: Désactivé (vulnérable XSS)`)
      results.warnings.push(`⚠️  Cookie ${cookieName}: HttpOnly manquant`)
    }
    
    if (flags.secure) {
      console.log(`  ✅ Secure: Activé`)
    } else {
      console.log(`  ⚠️  Secure: Désactivé (HTTPS recommandé)`)
      results.warnings.push(`⚠️  Cookie ${cookieName}: Secure manquant`)
    }
    
    if (flags.sameSite) {
      console.log(`  ✅ SameSite: ${flags.sameSite}`)
    } else {
      console.log(`  ⚠️  SameSite: Non défini (CSRF possible)`)
      results.warnings.push(`⚠️  Cookie ${cookieName}: SameSite manquant`)
    }
  })
}

// Fonction pour tester plusieurs endpoints
async function runComprehensiveTest() {
  const endpoints = [
    '/',
    '/auth',
    '/admin',
    '/api/products',
  ]
  
  console.log('🔒 Test complet des en-têtes de sécurité')
  console.log(`Serveur: ${BASE_URL}`)
  console.log('Date:', new Date().toISOString())
  console.log('=' .repeat(70))
  
  const results = []
  
  for (const endpoint of endpoints) {
    const url = BASE_URL + endpoint
    console.log(`\n📍 Test: ${url}`)
    console.log('─' .repeat(50))
    
    const result = await testSecurityHeaders(url)
    results.push({ endpoint, ...result })
    
    // Pause entre les tests
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  // Score global
  const globalScore = Math.round(
    results.reduce((acc, r) => acc + (r.score || 0), 0) / results.length
  )
  
  console.log('\n🏆 Score global de sécurité:', globalScore + '%')
  
  if (globalScore >= 90) {
    console.log('🎉 Excellente configuration de sécurité!')
  } else if (globalScore >= 75) {
    console.log('✅ Bonne configuration, quelques améliorations possibles')
  } else {
    console.log('⚠️  Configuration à améliorer pour une meilleure sécurité')
  }
  
  return results
}

// Exécution si appelé directement
if (require.main === module) {
  runComprehensiveTest().catch(console.error)
}

module.exports = { testSecurityHeaders, runComprehensiveTest }

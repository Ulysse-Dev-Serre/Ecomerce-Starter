export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '../../../../lib/auth-session'
import { getSecurityHeaders, validateCSP, defaultSecurityConfig } from '../../../../lib/security-headers'

// GET /api/admin/security-check - Diagnostic des en-têtes de sécurité
export async function GET(request: NextRequest) {
  // Vérifier l'authentification
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // En développement seulement
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Non disponible en production' }, { status: 403 })
  }

  try {
    const securityHeaders = getSecurityHeaders(defaultSecurityConfig)
    
    // Validation de la CSP
    const cspValidation = validateCSP(securityHeaders['Content-Security-Policy'] || '')
    
    // Analyse de la configuration
    const analysis = {
      headers: securityHeaders,
      validation: {
        csp: cspValidation,
        hsts: {
          enabled: !!securityHeaders['Strict-Transport-Security'],
          duration: securityHeaders['Strict-Transport-Security']?.match(/max-age=(\d+)/)?.[1],
          includesSubdomains: securityHeaders['Strict-Transport-Security']?.includes('includeSubDomains'),
          preload: securityHeaders['Strict-Transport-Security']?.includes('preload')
        }
      },
      cookies: {
        httpOnly: false,
        secure: false,
        sameSite: ''
      },
      recommendations: [] as Array<{
        type: 'error' | 'warning' | 'info'
        message: string
        details: string[]
      }>
    }
    
    // Recommandations basées sur l'analyse
    if (!cspValidation.valid) {
      analysis.recommendations.push({
        type: 'error',
        message: 'CSP invalide',
        details: cspValidation.errors
      })
    }
    
    if (defaultSecurityConfig.isDevelopment) {
      analysis.recommendations.push({
        type: 'info',
        message: 'Mode développement détecté',
        details: ['HSTS désactivé', 'Cookies non sécurisés', 'CSP permissive']
      })
    }
    
    if (!process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET === 'development-secret-change-in-production') {
      analysis.recommendations.push({
        type: 'warning',
        message: 'Secret NextAuth par défaut',
        details: ['Changer NEXTAUTH_SECRET en production']
      })
    }
    
    // Test de la configuration des cookies NextAuth
    analysis.cookies = {
      httpOnly: true,
      secure: defaultSecurityConfig.isDevelopment ? false : true,
      sameSite: 'lax'
    }
    
    if (!defaultSecurityConfig.isDevelopment && !analysis.cookies.secure) {
      analysis.recommendations.push({
        type: 'warning',
        message: 'Configuration cookies non optimale',
        details: ['Cookies non sécurisés en production']
      })
    }
    
    // Score de sécurité
    const securityScore = calculateSecurityScore(analysis)
    
    return NextResponse.json({
      score: securityScore,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      ...analysis
    })
    
  } catch (error) {
    console.error('Erreur lors du diagnostic sécurité:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

function calculateSecurityScore(analysis: any): number {
  let score = 100
  
  // CSP
  if (!analysis.validation.csp.valid) {
    score -= 30
  }
  
  // HSTS
  if (!analysis.validation.hsts.enabled) {
    score -= 20
  } else {
    const duration = parseInt(analysis.validation.hsts.duration || '0')
    if (duration < 15768000) { // 6 mois
      score -= 10
    }
    if (!analysis.validation.hsts.includesSubdomains) {
      score -= 5
    }
  }
  
  // Cookies
  if (!analysis.cookies.secure) {
    score -= 15
  }
  
  // Recommandations d'erreur
  const errors = analysis.recommendations.filter((r: any) => r.type === 'error')
  score -= errors.length * 10
  
  // Recommandations d'avertissement
  const warnings = analysis.recommendations.filter((r: any) => r.type === 'warning')
  score -= warnings.length * 5
  
  return Math.max(0, Math.min(100, score))
}

// POST /api/admin/security-check - Test d'un header spécifique
export async function POST(request: NextRequest) {
  const session = await getAuthSession()
  if (!session?.user?.id || process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { headerName, headerValue } = await request.json()
    
    if (!headerName) {
      return NextResponse.json({ error: 'headerName requis' }, { status: 400 })
    }
    
    const testResult = {
      header: headerName,
      value: headerValue,
      tests: [] as Array<{
        test: string
        passed: boolean
        details: string[]
      }>
    }
    
    // Tests spécifiques selon le header
    switch (headerName.toLowerCase()) {
      case 'content-security-policy':
        const cspValidation = validateCSP(headerValue)
        testResult.tests = [
          {
            test: 'Validité CSP',
            passed: cspValidation.valid,
            details: cspValidation.errors
          },
          {
            test: 'default-src présent',
            passed: headerValue.includes('default-src'),
            details: headerValue.includes('default-src') ? [] : ['default-src manquant']
          }
        ]
        break
        
      case 'strict-transport-security':
        const hstsRegex = /max-age=(\d+)/
        const maxAge = hstsRegex.exec(headerValue)?.[1]
        const sixMonths = 15768000
        
        testResult.tests = [
          {
            test: 'Format HSTS valide',
            passed: hstsRegex.test(headerValue),
            details: hstsRegex.test(headerValue) ? [] : ['Format max-age invalide']
          },
          {
            test: 'Durée >= 6 mois',
            passed: parseInt(maxAge || '0') >= sixMonths,
            details: parseInt(maxAge || '0') >= sixMonths ? [] : [`Durée trop courte: ${maxAge}s`]
          },
          {
            test: 'includeSubDomains',
            passed: headerValue.includes('includeSubDomains'),
            details: headerValue.includes('includeSubDomains') ? [] : ['includeSubDomains recommandé']
          }
        ]
        break
        
      default:
        testResult.tests = [
          {
            test: 'Header présent',
            passed: !!headerValue,
            details: !!headerValue ? [] : ['Header manquant']
          }
        ]
    }
    
    return NextResponse.json(testResult)
    
  } catch (error) {
    console.error('Erreur test header:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

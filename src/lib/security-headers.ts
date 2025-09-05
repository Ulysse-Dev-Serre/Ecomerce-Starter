/**
 * Configuration des en-têtes de sécurité
 * Ces en-têtes protègent contre diverses attaques web
 */

export interface SecurityHeadersConfig {
  enableHSTS: boolean
  enableCSP: boolean
  enablePermissionsPolicy: boolean
  isDevelopment: boolean
  domain?: string
}

export function getSecurityHeaders(config: SecurityHeadersConfig): Record<string, string> {
  const headers: Record<string, string> = {}
  
  // Content Security Policy (CSP)
  if (config.enableCSP) {
    const cspDirectives = [
      "default-src 'self'",
      
      // Scripts: autoriser 'self', 'unsafe-inline' pour Next.js, et domaines tiers nécessaires
      config.isDevelopment 
        ? "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://apis.google.com"
        : "script-src 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com",
      
      // Styles: autoriser 'self', 'unsafe-inline' pour Tailwind et CSS-in-JS
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      
      // Fonts: autoriser Google Fonts
      "font-src 'self' https://fonts.gstatic.com data:",
      
      // Images: autoriser 'self', data URLs, et CDN d'images
      "img-src 'self' data: blob: https: http:",
      
      // Connexions: API, Google Auth, uploads
      "connect-src 'self' https://accounts.google.com https://api.google.com" + (config.isDevelopment ? " ws: wss:" : ""),
      
      // Frames: autoriser Google OAuth
      "frame-src 'self' https://accounts.google.com",
      
      // Objects: bloquer Flash et autres plugins
      "object-src 'none'",
      
      // Base URI: limiter à 'self'
      "base-uri 'self'",
      
      // Form actions: autoriser 'self' et Google OAuth
      "form-action 'self' https://accounts.google.com",
      
      // Upgrade insecure requests en production
      ...(config.isDevelopment ? [] : ["upgrade-insecure-requests"])
    ]
    
    headers['Content-Security-Policy'] = cspDirectives.join('; ')
  }
  
  // HTTP Strict Transport Security (HSTS)
  if (config.enableHSTS && !config.isDevelopment) {
    // 6 mois minimum + includeSubdomains + preload
    headers['Strict-Transport-Security'] = 'max-age=15768000; includeSubDomains; preload'
  }
  
  // X-Content-Type-Options: prévient le MIME type sniffing
  headers['X-Content-Type-Options'] = 'nosniff'
  
  // X-Frame-Options: prévient le clickjacking (redondant avec CSP mais garde pour compatibilité)
  headers['X-Frame-Options'] = 'DENY'
  
  // X-XSS-Protection: protection XSS legacy (moderne = CSP)
  headers['X-XSS-Protection'] = '1; mode=block'
  
  // Referrer-Policy: contrôle les informations envoyées dans les requêtes cross-origin
  headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
  
  // Permissions Policy: contrôle l'accès aux APIs du navigateur
  if (config.enablePermissionsPolicy) {
    const permissions = [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'gyroscope=()',
      'magnetometer=()',
      'payment=(self)',
      'usb=()'
    ]
    headers['Permissions-Policy'] = permissions.join(', ')
  }
  
  // Cross-Origin-Opener-Policy: isole la fenêtre des autres origines
  headers['Cross-Origin-Opener-Policy'] = 'same-origin'
  
  // Cross-Origin-Resource-Policy: contrôle qui peut inclure cette ressource
  headers['Cross-Origin-Resource-Policy'] = 'same-origin'
  
  // Cross-Origin-Embedder-Policy: requis pour SharedArrayBuffer
  // Note: peut causer des problèmes avec certaines intégrations tierces
  // headers['Cross-Origin-Embedder-Policy'] = 'require-corp'
  
  return headers
}

// Configuration par défaut
export const defaultSecurityConfig: SecurityHeadersConfig = {
  enableHSTS: true,
  enableCSP: true,
  enablePermissionsPolicy: true,
  isDevelopment: process.env.NODE_ENV === 'development',
  domain: process.env.NEXTAUTH_URL ? new URL(process.env.NEXTAUTH_URL).hostname : undefined
}

// Helper pour appliquer les headers à une Response
export function applySecurityHeaders(response: Response, config = defaultSecurityConfig): Response {
  const headers = getSecurityHeaders(config)
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}

// Helper pour créer une Response avec headers de sécurité
export function createSecureResponse(
  body?: BodyInit,
  init?: ResponseInit,
  config = defaultSecurityConfig
): Response {
  const response = new Response(body, init)
  return applySecurityHeaders(response, config)
}

// Validation CSP - vérifie que la policy est valide
export function validateCSP(csp: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Vérifications de base
  if (!csp.includes("default-src")) {
    errors.push("default-src directive manquante")
  }
  
  if (csp.includes("'unsafe-eval'") && process.env.NODE_ENV === 'production') {
    errors.push("'unsafe-eval' détecté en production")
  }
  
  if (!csp.includes("object-src") || !csp.includes("'none'")) {
    errors.push("object-src 'none' manquant (sécurité Flash/plugins)")
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

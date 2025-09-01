import { Language } from '../generated/prisma'

// Configuration globale du site e-commerce
export const SITE_CONFIG = {
  // Langue et devise par défaut (personnalisable par niche)
  DEFAULT_LANGUAGE: Language.FR,
  DEFAULT_CURRENCY: 'CAD',
  
  // Business rules
  FREE_SHIPPING_THRESHOLD: 75.00,
  SHIPPING_COST: 9.99,
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Cart
  CART_EXPIRY_DAYS: 30,
  MAX_CART_ITEMS: 50,
  
  // Reviews
  MIN_RATING: 1,
  MAX_RATING: 5,
  
  // Inventory
  LOW_STOCK_THRESHOLD: 10,
  
  // Cache
  PRODUCT_CACHE_TTL: 300, // 5 minutes
  CATEGORY_CACHE_TTL: 600, // 10 minutes
} as const

// Langue et devise helpers
export const getSupportedLanguages = () => Object.values(Language)

export const getCurrencySymbol = (currency: string) => {
  const symbols: Record<string, string> = {
    'CAD': '$',
    'USD': '$', 
    'EUR': '€',
    'GBP': '£'
  }
  return symbols[currency] || currency
}

export const formatPrice = (amount: number, currency: string) => {
  return `${amount.toFixed(2)} ${currency}`
}

// URL helpers
export const getProductUrl = (slug: string) => `/products/${slug}`
export const getCategoryUrl = (slug: string) => `/categories/${slug}`
export const getImageUrl = (path: string) => path.startsWith('http') ? path : `/images/${path}`

// Validation helpers
export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
export const isValidPostalCode = (code: string, country: string) => {
  const patterns: Record<string, RegExp> = {
    'CA': /^[A-Z]\d[A-Z] \d[A-Z]\d$/i,
    'US': /^\d{5}(-\d{4})?$/,
    'FR': /^\d{5}$/
  }
  return patterns[country]?.test(code) ?? true
}

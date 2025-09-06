/**
 * Payment Validation - Sécurité montants
 * 
 * CRITIQUE: Validation serveur des montants pour éviter la manipulation côté client
 * Source de vérité: Base de données (produits, taxes, shipping, promotions)
 */

import { db } from './db'
import { formatAmountForStripe } from './stripe'

// Configuration des taxes par pays/région
const TAX_RATES = {
  CA: {
    QC: 0.15,   // TPS + TVQ Québec
    ON: 0.13,   // HST Ontario
    BC: 0.12,   // GST + PST Colombie-Britannique
    default: 0.05 // GST seulement
  },
  US: {
    default: 0.08 // Moyenne approximative
  },
  default: 0.0
} as const

// Configuration shipping
const SHIPPING_RULES = {
  FREE_SHIPPING_THRESHOLD: 75.00, // CAD
  STANDARD_SHIPPING_COST: 9.99,   // CAD
  EXPRESS_SHIPPING_COST: 19.99    // CAD
} as const

interface CartCalculationResult {
  subtotal: number
  taxes: number  
  shipping: number
  discount: number
  total: number
  currency: string
  breakdown: {
    items: Array<{
      variantId: string
      sku: string
      name: string
      quantity: number
      unitPrice: number
      lineTotal: number
    }>
    taxCalculation: {
      region: string
      rate: number
    }
    shippingCalculation: {
      method: string
      cost: number
      freeShippingApplied: boolean
    }
  }
}

/**
 * Calcule le montant total d'un panier depuis la base de données
 * SOURCE DE VÉRITÉ - Ne jamais faire confiance au client
 */
export async function calculateCartTotal(
  cartId: string,
  shippingAddress?: {
    country: string
    state?: string
  },
  shippingMethod: 'standard' | 'express' = 'standard'
): Promise<{ data?: CartCalculationResult; error?: string }> {
  try {
    // 1. Récupérer le panier avec items depuis la DB
    const cart = await db.cart.findUnique({
      where: {
        id: cartId,
        status: 'ACTIVE'
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    translations: {
                      where: { language: 'FR' },
                      take: 1
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!cart || cart.items.length === 0) {
      return { error: 'Panier vide ou introuvable' }
    }

    // 2. Calculer le sous-total depuis les PRIX DB (source de vérité)
    let subtotal = 0
    const itemsBreakdown = []

    for (const item of cart.items) {
      // Vérifier stock disponible
      if (item.variant.stock < item.quantity) {
        return { 
          error: `Stock insuffisant pour ${item.variant.sku}. Disponible: ${item.variant.stock}, demandé: ${item.quantity}` 
        }
      }

      // Utiliser le prix DB (jamais le client)
      const unitPrice = item.variant.price
      const lineTotal = unitPrice * item.quantity
      subtotal += lineTotal

      itemsBreakdown.push({
        variantId: item.variant.id,
        sku: item.variant.sku,
        name: item.variant.product.translations[0]?.name || 'Produit',
        quantity: item.quantity,
        unitPrice,
        lineTotal
      })
    }

    // 3. Calculer les taxes selon la région
    const taxCalculation = calculateTaxes(subtotal, shippingAddress)
    const taxes = taxCalculation.amount

    // 4. Calculer les frais de livraison
    const shippingCalculation = calculateShipping(subtotal, shippingMethod)
    const shipping = shippingCalculation.cost

    // 5. Calculer les promotions/remises (à implémenter)
    const discount = 0 // TODO: Implémenter système de promotions

    // 6. Total final
    const total = subtotal + taxes + shipping - discount
    const currency = 'CAD' // TODO: Support multi-devise

    const result: CartCalculationResult = {
      subtotal,
      taxes,
      shipping,
      discount,
      total,
      currency,
      breakdown: {
        items: itemsBreakdown,
        taxCalculation: {
          region: `${shippingAddress?.country || 'CA'}-${shippingAddress?.state || 'QC'}`,
          rate: taxCalculation.rate
        },
        shippingCalculation: {
          method: shippingMethod,
          cost: shipping,
          freeShippingApplied: shippingCalculation.freeShippingApplied
        }
      }
    }

    return { data: result }

  } catch (error) {
    console.error('Erreur calcul panier:', error)
    return { error: 'Erreur lors du calcul du montant' }
  }
}

/**
 * Calcule les taxes selon la région de livraison
 */
function calculateTaxes(
  subtotal: number, 
  shippingAddress?: { country: string; state?: string }
): { amount: number; rate: number } {
  const country = shippingAddress?.country || 'CA'
  const state = shippingAddress?.state || 'QC'
  
  let rate = TAX_RATES.default
  
  if (country === 'CA' && TAX_RATES.CA[state as keyof typeof TAX_RATES.CA]) {
    rate = TAX_RATES.CA[state as keyof typeof TAX_RATES.CA]
  } else if (country === 'CA') {
    rate = TAX_RATES.CA.default
  } else if (country === 'US') {
    rate = TAX_RATES.US.default
  }
  
  return {
    amount: subtotal * rate,
    rate
  }
}

/**
 * Calcule les frais de livraison
 */
function calculateShipping(
  subtotal: number, 
  method: 'standard' | 'express' = 'standard'
): { cost: number; freeShippingApplied: boolean } {
  // Livraison gratuite si seuil atteint
  if (subtotal >= SHIPPING_RULES.FREE_SHIPPING_THRESHOLD) {
    return {
      cost: 0,
      freeShippingApplied: true
    }
  }
  
  const cost = method === 'express' 
    ? SHIPPING_RULES.EXPRESS_SHIPPING_COST 
    : SHIPPING_RULES.STANDARD_SHIPPING_COST
    
  return {
    cost,
    freeShippingApplied: false
  }
}

/**
 * Valide qu'un PaymentIntent correspond au montant calculé serveur
 * SÉCURITÉ CRITIQUE: Détecte les tentatives de manipulation de montant
 */
export async function validatePaymentAmount(
  paymentIntentAmount: number, // Montant en centimes (Stripe)
  paymentIntentCurrency: string,
  cartId: string,
  shippingAddress?: {
    country: string
    state?: string
  }
): Promise<{ 
  valid: boolean
  serverAmount?: number
  discrepancy?: number
  calculation?: CartCalculationResult
  error?: string 
}> {
  try {
    // 1. Recalculer le montant côté serveur (source de vérité)
    const calculationResult = await calculateCartTotal(cartId, shippingAddress)
    
    if (calculationResult.error || !calculationResult.data) {
      return { 
        valid: false, 
        error: calculationResult.error || 'Erreur calcul serveur' 
      }
    }

    const serverCalculation = calculationResult.data
    
    // 2. Convertir en centimes pour comparaison Stripe
    const serverAmountCents = formatAmountForStripe(serverCalculation.total, serverCalculation.currency)
    
    // 3. Vérifier la devise
    if (paymentIntentCurrency.toUpperCase() !== serverCalculation.currency.toUpperCase()) {
      logSecurityAlert('CURRENCY_MISMATCH', {
        cartId,
        paymentIntentCurrency,
        serverCurrency: serverCalculation.currency,
        timestamp: new Date().toISOString()
      })
      
      return {
        valid: false,
        error: 'Devise non concordante',
        serverAmount: serverAmountCents,
        calculation: serverCalculation
      }
    }
    
    // 4. Comparaison stricte des montants (tolérance 0 centime)
    const discrepancy = Math.abs(paymentIntentAmount - serverAmountCents)
    const isValid = discrepancy === 0
    
    // 5. Logger les tentatives de fraude
    if (!isValid) {
      logSecurityAlert('AMOUNT_MISMATCH', {
        cartId,
        paymentIntentAmount,
        serverAmount: serverAmountCents,
        discrepancy,
        currency: serverCalculation.currency,
        serverCalculation: {
          subtotal: serverCalculation.subtotal,
          taxes: serverCalculation.taxes,
          shipping: serverCalculation.shipping,
          total: serverCalculation.total
        },
        timestamp: new Date().toISOString(),
        severity: 'CRITICAL'
      })
    }
    
    return {
      valid: isValid,
      serverAmount: serverAmountCents,
      discrepancy,
      calculation: serverCalculation,
      error: isValid ? undefined : `Montant non concordant. Attendu: ${serverAmountCents}, reçu: ${paymentIntentAmount}`
    }
    
  } catch (error) {
    console.error('Erreur validation montant paiement:', error)
    
    logSecurityAlert('VALIDATION_ERROR', {
      cartId,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      timestamp: new Date().toISOString()
    })
    
    return { 
      valid: false, 
      error: 'Erreur lors de la validation du montant' 
    }
  }
}

/**
 * Enregistre les alertes de sécurité critiques
 */
function logSecurityAlert(type: string, data: any) {
  const alert = {
    type: `PAYMENT_SECURITY_${type}`,
    severity: data.severity || 'HIGH',
    data,
    timestamp: new Date().toISOString()
  }
  
  // Log immédiat dans la console (production: envoyer vers système de monitoring)
  console.error('🚨 ALERTE SÉCURITÉ PAIEMENT:', JSON.stringify(alert, null, 2))
  
  // TODO: En production, envoyer vers:
  // - Système de monitoring (Sentry, Datadog)
  // - Alertes Slack/Teams
  // - Base de données des incidents sécurité
  // - Email admin
}

/**
 * Utilitaire pour formater les montants en centimes
 */
export function formatAmountDisplay(amountCents: number, currency: string): string {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountCents / 100)
}

import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables')
}

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil', // Use latest API version
  typescript: true,
})

// Helper to format amount for Stripe (convert to cents)
export function formatAmountForStripe(amount: number, currency: string): number {
  const numberFormat = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
  })
  
  const parts = numberFormat.formatToParts(amount)
  let zeroDecimalCurrency = true
  
  for (const part of parts) {
    if (part.type === 'decimal') {
      zeroDecimalCurrency = false
      break
    }
  }
  
  return zeroDecimalCurrency ? amount : Math.round(amount * 100)
}

// Helper to format amount from Stripe (convert from cents)
export function formatAmountFromStripe(amount: number, currency: string): number {
  const numberFormat = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
  })
  
  const parts = numberFormat.formatToParts(100) // Test with 100 to check decimal places
  let zeroDecimalCurrency = true
  
  for (const part of parts) {
    if (part.type === 'decimal') {
      zeroDecimalCurrency = false
      break
    }
  }
  
  return zeroDecimalCurrency ? amount : amount / 100
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    throw new Error('Invalid webhook signature')
  }
}

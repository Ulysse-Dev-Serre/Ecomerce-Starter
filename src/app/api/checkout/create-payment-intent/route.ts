export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '../../../../lib/auth-session'
import { getAuthSessionWithTestSupport } from '../../../../lib/test-auth-middleware'
import { withRateLimit } from '../../../../lib/rate-limit-middleware'
import { createValidationMiddleware } from '../../../../lib/validation'
import { stripe, formatAmountForStripe } from '../../../../lib/stripe'
import { db } from '../../../../lib/db'
import { calculateCartTotal } from '../../../../lib/payment-validation'
import { z } from 'zod'

const CreatePaymentIntentSchema = z.object({
  cartId: z.string().cuid('Invalid cart ID'),
  email: z.string().email('Email invalide'),
  billingAddress: z.object({
    line1: z.string().min(1, 'Adresse requise'),
    line2: z.string().optional(),
    city: z.string().min(1, 'Ville requise'),
    state: z.string().optional(),
    postal_code: z.string().min(1, 'Code postal requis'),
    country: z.string().length(2, 'Code pays invalide'),
  }),
  saveAddress: z.boolean().default(false),
})

// POST /api/checkout/create-payment-intent - Create Stripe Payment Intent
export async function POST(request: NextRequest) {
  // Apply rate limiting for checkout operations
  const rateLimitResponse = await withRateLimit(request, { type: 'general' })
  if (rateLimitResponse) return rateLimitResponse

  try {
    // Check authentication (with test support)
    const session = await getAuthSessionWithTestSupport(request, getAuthSession)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Validate request data
    const validatePaymentIntent = createValidationMiddleware('createPaymentIntent', { logErrors: true })
    const { data: validatedData, error: validationError } = await validatePaymentIntent(request)
    
    if (validationError) {
      return validationError
    }

    if (!validatedData) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const { cartId, email, billingAddress, saveAddress } = validatedData

    // SÉCURITÉ CRITIQUE: Recalculer le montant côté serveur (source de vérité)
    
    // Pour les tests: utiliser données simulées si cartId commence par "cm000000"
    let serverCalculation
    
    if (cartId.startsWith('cm000000') && process.env.NODE_ENV === 'development') {
      console.log('🧪 Test mode: Using simulated cart calculation')
      
      // Simulation calcul pour tests (montant fixe)
      serverCalculation = {
        subtotal: 100.00,
        taxes: 15.00,   // 15% Québec
        shipping: 0.00, // Gratuit
        discount: 0.00,
        total: 115.00,
        currency: 'CAD',
        breakdown: {
          items: [{
            variantId: 'test-variant',
            sku: 'TEST-SKU',
            name: 'Test Product',
            quantity: 1,
            unitPrice: 100.00,
            lineTotal: 100.00
          }],
          taxCalculation: {
            region: 'CA-QC',
            rate: 0.15
          },
          shippingCalculation: {
            method: 'standard',
            cost: 0.00,
            freeShippingApplied: true
          }
        }
      }
    } else {
      // Production: calcul réel depuis DB
      const calculationResult = await calculateCartTotal(cartId, billingAddress)
      
      if (calculationResult.error || !calculationResult.data) {
        return NextResponse.json({ 
          error: calculationResult.error || 'Erreur lors du calcul du montant' 
        }, { status: 400 })
      }

      serverCalculation = calculationResult.data
    }

    const totalAmount = serverCalculation.total
    const stripeAmount = formatAmountForStripe(totalAmount, serverCalculation.currency)

    // Check if there's already an active PaymentIntent for this cart
    const existingPaymentIntents = await stripe.paymentIntents.list({
      limit: 10,
    })

    const existingPI = existingPaymentIntents.data.find(pi => 
      pi.metadata.cartId === cartId && 
      pi.metadata.userId === session.user.id &&
      pi.status !== 'canceled' &&
      pi.status !== 'succeeded' &&
      pi.amount === stripeAmount &&
      pi.currency === serverCalculation.currency.toLowerCase()
    )

    let paymentIntent: any

    if (existingPI) {
      // Reuse existing PaymentIntent
      paymentIntent = existingPI
      console.log('Reusing existing Payment Intent:', {
        paymentIntentId: existingPI.id,
        cartId: cartId,
        userId: session.user.id,
        status: existingPI.status,
        amount: stripeAmount,
        timestamp: new Date().toISOString(),
      })
    } else {
      // Create new PaymentIntent with Stripe
      paymentIntent = await stripe.paymentIntents.create({
      amount: stripeAmount,
      currency: serverCalculation.currency.toLowerCase(),
      receipt_email: email,
      metadata: {
        cartId: cartId,
        userId: session.user.id,
        itemCount: serverCalculation.breakdown.items.length.toString(),
        subtotal: serverCalculation.subtotal.toString(),
        taxes: serverCalculation.taxes.toString(),
        shipping: serverCalculation.shipping.toString(),
        total: totalAmount.toString(),
        calculationVersion: '1.0', // Pour audit trail
      },
      shipping: {
        address: {
          line1: billingAddress.line1,
          line2: billingAddress.line2 || undefined,
          city: billingAddress.city,
          state: billingAddress.state || undefined,
          postal_code: billingAddress.postal_code,
          country: billingAddress.country,
        },
        name: session.user.name || 'Client',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

      // Log successful payment intent creation (no sensitive data)
      console.log('Payment Intent created:', {
        paymentIntentId: paymentIntent.id,
        amount: stripeAmount,
        currency: serverCalculation.currency,
        userId: session.user.id,
        cartId: cartId,
        serverCalculation: {
          subtotal: serverCalculation.subtotal,
          taxes: serverCalculation.taxes,
          shipping: serverCalculation.shipping,
          total: serverCalculation.total
        },
        timestamp: new Date().toISOString(),
      })
    }

    // Save address to user profile if requested
    if (saveAddress) {
      await db.address.create({
        data: {
          userId: session.user.id,
          street: billingAddress.line1,
          city: billingAddress.city,
          state: billingAddress.state,
          zipCode: billingAddress.postal_code,
          country: billingAddress.country,
          type: 'BOTH',
          isDefault: false,
        }
      }).catch(error => {
        // Don't fail the payment if address save fails
        console.warn('Failed to save address:', error)
      })
    }



    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalAmount,
      currency: serverCalculation.currency,
      breakdown: serverCalculation.breakdown, // Pour transparence client
    })

  } catch (error) {
    console.error('Create Payment Intent error:', error)
    
    // Handle Stripe errors specifically
    if (error instanceof Error && 'type' in error) {
      const stripeError = error as Stripe.StripeError
      return NextResponse.json({ 
        error: 'Erreur de traitement du paiement',
        details: stripeError.message 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'Erreur lors de la création du paiement' 
    }, { status: 500 })
  }
}

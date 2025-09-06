export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '../../../../lib/auth-session'
import { withRateLimit } from '../../../../lib/rate-limit-middleware'
import { createValidationMiddleware } from '../../../../lib/validation'
import { stripe, formatAmountForStripe } from '../../../../lib/stripe'
import { db } from '../../../../lib/db'
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
    // Check authentication
    const session = await getAuthSession()
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

    // Get user's active cart with items
    const cart = await db.cart.findFirst({
      where: {
        id: cartId,
        userId: session.user.id,
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
      return NextResponse.json({ 
        error: 'Panier vide ou introuvable' 
      }, { status: 404 })
    }

    // Calculate total amount
    const subtotal = cart.items.reduce((sum, item) => 
      sum + (item.variant.price * item.quantity), 0
    )
    
    // Add taxes (15% for Quebec/Canada)
    const taxes = subtotal * 0.15
    const shipping = 0 // Free shipping
    const totalAmount = subtotal + taxes + shipping

    // Convert to cents for Stripe
    const stripeAmount = formatAmountForStripe(totalAmount, 'cad')

    // Create PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: stripeAmount,
      currency: 'cad',
      customer_email: email,
      metadata: {
        cartId: cart.id,
        userId: session.user.id,
        itemCount: cart.items.length.toString(),
        subtotal: subtotal.toString(),
        taxes: taxes.toString(),
        total: totalAmount.toString(),
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

    // Log successful payment intent creation (no sensitive data)
    console.log('Payment Intent created:', {
      paymentIntentId: paymentIntent.id,
      amount: stripeAmount,
      currency: 'cad',
      userId: session.user.id,
      cartId: cart.id,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalAmount,
      currency: 'CAD',
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

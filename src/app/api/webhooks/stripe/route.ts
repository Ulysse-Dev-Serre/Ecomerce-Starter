export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, verifyWebhookSignature } from '../../../../lib/stripe'
import { db } from '../../../../lib/db'
import { validatePaymentAmount } from '../../../../lib/payment-validation'
import { ensureEventIdempotence, markEventProcessed } from '../../../../lib/webhook-security'
import { incrementEventTypeMetric, isCriticalEventType } from '../../../../lib/webhook-metrics'
import Stripe from 'stripe'

// POST /api/webhooks/stripe - Handle Stripe webhook events
export async function POST(request: NextRequest) {
  try {
    // Get raw body as text for signature verification
    const body = await request.text()
    
    // Get Stripe signature from headers
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')
    
    if (!signature) {
      console.error('Missing Stripe signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    // Verify webhook signature and construct event
    let event: Stripe.Event
    try {
      event = verifyWebhookSignature(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // SÉCURITÉ: Vérifier idempotence (anti-rejeu)
    const idempotenceCheck = await ensureEventIdempotence(
      event.id,
      event.type,
      event.data.object
    )

    if (!idempotenceCheck.shouldProcess) {
      console.log('🔒 Event already processed - ignoring replay attempt')
      return NextResponse.json({ 
        received: true, 
        status: 'already_processed',
        eventId: event.id 
      })
    }

    // Log webhook event (safe data only)
    console.log('🔄 STRIPE WEBHOOK RECEIVED:', {
      eventId: event.id,
      type: event.type,
      created: event.created,
      livemode: event.livemode,
      isRetry: idempotenceCheck.isRetry,
      retryCount: idempotenceCheck.eventRecord?.retryCount || 0,
      timestamp: new Date().toISOString(),
    })

    let processingSuccess = false
    let processingError: string | undefined

    // Handle the event based on type
    try {
      switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.created':
        handlePaymentIntentCreated(event.data.object as Stripe.PaymentIntent)
        break

      case 'charge.dispute.created':
        await handleChargeDisputeCreated(event.data.object as Stripe.Dispute)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
        // Log pour analytics - événements non critiques
        console.debug('Event details:', {
          eventId: event.id,
          type: event.type,
          created: event.created
        })
        break
      }
      
      processingSuccess = true
      
    } catch (processingErr) {
      processingSuccess = false
      processingError = processingErr instanceof Error ? processingErr.message : 'Unknown processing error'
      
      console.error('Event processing failed:', {
        eventId: event.id,
        eventType: event.type,
        error: processingError,
        retryCount: idempotenceCheck.eventRecord?.retryCount || 0,
        isCritical: isCriticalEventType(event.type)
      })
      
      // Ne pas throw l'erreur ici - marquer comme échec et retourner 200
      // Stripe retentera automatiquement
    }

    // Mettre à jour les métriques
    await incrementEventTypeMetric(event.type, processingSuccess)

    // Marquer l'événement comme traité (succès ou échec)
    await markEventProcessed(event.id, processingSuccess, processingError)

    if (processingSuccess) {
      return NextResponse.json({ 
        received: true, 
        status: 'processed',
        eventId: event.id 
      })
    } else {
      // Retourner 200 même en cas d'échec pour éviter les retry loops infinis
      // L'événement sera marqué comme failed et pourra être retraité manuellement
      return NextResponse.json({ 
        received: true, 
        status: 'failed',
        eventId: event.id,
        error: processingError 
      })
    }

  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ 
      error: 'Webhook handler failed' 
    }, { status: 500 })
  }
}

// Handle successful payment
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Processing successful payment:', paymentIntent.id)

  try {
    const cartId = paymentIntent.metadata.cartId
    const userId = paymentIntent.metadata.userId

    if (!cartId || !userId) {
      console.error('Missing cart or user ID in payment metadata')
      return
    }

    // SÉCURITÉ CRITIQUE: Valider le montant avant de créer la commande
    console.log('🔒 Validating payment amount against server calculation...')
    
    const validation = await validatePaymentAmount(
      paymentIntent.amount,
      paymentIntent.currency,
      cartId
    )

    if (!validation.valid) {
      // ALERTE SÉCURITÉ CRITIQUE - Tentative de fraude détectée
      console.error('🚨 FRAUD ATTEMPT DETECTED - Payment amount mismatch:', {
        paymentIntentId: paymentIntent.id,
        paymentIntentAmount: paymentIntent.amount,
        serverAmount: validation.serverAmount,
        discrepancy: validation.discrepancy,
        error: validation.error,
        cartId,
        userId,
        timestamp: new Date().toISOString()
      })

      // Ne pas créer la commande - paiement suspendu
      throw new Error(`Payment amount validation failed: ${validation.error}`)
    }

    console.log('✅ Payment amount validated successfully', {
      paymentIntentId: paymentIntent.id,
      validatedAmount: validation.serverAmount,
      currency: paymentIntent.currency
    })

    // Start database transaction to create order
    await db.$transaction(async (tx) => {
      // Get cart with items
      const cart = await tx.cart.findUnique({
        where: { id: cartId },
        include: {
          items: {
            include: {
              variant: true
            }
          }
        }
      })

      if (!cart) {
        throw new Error(`Cart ${cartId} not found`)
      }

      // Create order
      const order = await tx.order.create({
        data: {
          userId: userId,
          status: 'PAID',
          totalAmount: paymentIntent.amount / 100, // Convert from cents to dollars
          currency: paymentIntent.currency.toUpperCase(),
          shippingAddress: paymentIntent.shipping?.address ? JSON.stringify(paymentIntent.shipping.address) : '{}',
          billingAddress: paymentIntent.shipping?.address ? JSON.stringify(paymentIntent.shipping.address) : '{}',
        }
      })

      // Create order items from cart items
      for (const cartItem of cart.items) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            variantId: cartItem.variantId,
            quantity: cartItem.quantity,
            priceSnapshot: cartItem.variant.price,
            currency: cartItem.variant.currency,
            productSnapshot: JSON.stringify({
              variantId: cartItem.variantId,
              sku: cartItem.variant.sku
            }),
          }
        })

        // Update product stock
        await tx.productVariant.update({
          where: { id: cartItem.variantId },
          data: {
            stock: {
              decrement: cartItem.quantity
            }
          }
        })
      }

      // Create payment record
      await tx.payment.create({
        data: {
          orderId: order.id,
          amount: paymentIntent.amount / 100, // Convert from cents to dollars
          currency: paymentIntent.currency.toUpperCase(),
          method: 'STRIPE',
          status: 'COMPLETED',
          externalId: paymentIntent.id,
          transactionData: JSON.stringify({
            stripePaymentIntentId: paymentIntent.id,
            charges: paymentIntent.latest_charge || paymentIntent.id,
          }),
        }
      })

      // Mark cart as converted
      await tx.cart.update({
        where: { id: cartId },
        data: { status: 'CONVERTED' }
      })

      console.log('✅ ORDER CREATED SUCCESSFULLY:', {
        orderId: order.id,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        userId: userId,
        totalAmount: order.totalAmount,
        currency: order.currency,
        status: order.status,
        timestamp: new Date().toISOString()
      })
    })

    // TODO: Send confirmation email to customer
    // TODO: Send notification to admin
    // TODO: Trigger fulfillment process

  } catch (error) {
    console.error('Error processing successful payment:', error)
    // In production, you might want to send this to a dead letter queue
    // or alert system for manual processing
  }
}

// Handle failed payment
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Processing failed payment:', paymentIntent.id)

  // Log the failure for monitoring
  console.warn('Payment failed:', {
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    lastPaymentError: paymentIntent.last_payment_error,
    userId: paymentIntent.metadata.userId,
    cartId: paymentIntent.metadata.cartId,
  })

  // TODO: Send notification to customer about failed payment
  // TODO: Log to monitoring system for analysis
}

// Handle canceled payment
async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  console.log('Processing canceled payment:', paymentIntent.id)

  // Log the cancellation
  console.log('Payment canceled:', {
    paymentIntentId: paymentIntent.id,
    userId: paymentIntent.metadata.userId,
    cartId: paymentIntent.metadata.cartId,
  })

  // TODO: Send notification if needed
}

// Handle PaymentIntent created (informational only)
function handlePaymentIntentCreated(paymentIntent: Stripe.PaymentIntent) {
  // Event informationnel - aucune action métier requise
  // PaymentIntent.created se produit avant la confirmation de paiement

  console.log('PaymentIntent created (info):', {
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: paymentIntent.status,
    cartId: paymentIntent.metadata.cartId || 'unknown',
  })

  // Pas d'action nécessaire - l'important est payment_intent.succeeded
}

// Handle dispute created (chargeback)
async function handleChargeDisputeCreated(dispute: Stripe.Dispute) {
  console.log('Processing dispute:', dispute.id)

  // Log dispute for immediate attention
  console.error('DISPUTE CREATED - IMMEDIATE ATTENTION REQUIRED:', {
    disputeId: dispute.id,
    chargeId: dispute.charge,
    amount: dispute.amount,
    reason: dispute.reason,
    status: dispute.status,
    created: dispute.created,
  })

  // TODO: Send immediate alert to admin
  // TODO: Log to monitoring/alerting system
  // TODO: Create internal dispute tracking record
}

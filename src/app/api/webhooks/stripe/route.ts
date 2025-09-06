export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, verifyWebhookSignature } from '../../../../lib/stripe'
import { db } from '../../../../lib/db'
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

    // Log webhook event (safe data only)
    console.log('Stripe webhook received:', {
      eventId: event.id,
      type: event.type,
      created: event.created,
      livemode: event.livemode,
      timestamp: new Date().toISOString(),
    })

    // Handle the event based on type
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

      case 'charge.dispute.created':
        await handleChargeDisputeCreated(event.data.object as Stripe.Dispute)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
        break
    }

    return NextResponse.json({ received: true })

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
          totalAmount: parseFloat(paymentIntent.metadata.total || '0'),
          currency: paymentIntent.currency.toUpperCase(),
          stripePaymentIntentId: paymentIntent.id,
          shippingAddress: paymentIntent.shipping?.address ? JSON.stringify(paymentIntent.shipping.address) : null,
          billingAddress: paymentIntent.shipping?.address ? JSON.stringify(paymentIntent.shipping.address) : null,
        }
      })

      // Create order items from cart items
      for (const cartItem of cart.items) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            variantId: cartItem.variantId,
            quantity: cartItem.quantity,
            price: cartItem.variant.price,
            currency: cartItem.variant.currency,
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
          amount: parseFloat(paymentIntent.metadata.total || '0'),
          currency: paymentIntent.currency.toUpperCase(),
          method: 'STRIPE',
          status: 'COMPLETED',
          stripePaymentIntentId: paymentIntent.id,
          transactionId: paymentIntent.charges.data[0]?.id || paymentIntent.id,
        }
      })

      // Mark cart as converted
      await tx.cart.update({
        where: { id: cartId },
        data: { status: 'CONVERTED' }
      })

      console.log('Order created successfully:', {
        orderId: order.id,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        userId: userId,
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

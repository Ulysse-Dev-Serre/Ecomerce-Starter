# Sécurité des Paiements

## Vue d'Ensemble

Sécurisation complète des paiements avec **Stripe** suivant les standards PCI DSS et les meilleures pratiques de l'industrie.

## Architecture Sécurisée

### Principe de Base
- **Aucune donnée carte** stockée côté serveur
- **Stripe Elements** pour collecte sécurisée
- **Tokenisation** pour toutes les transactions
- **Validation côté serveur** obligatoire

### Flow de Paiement
```
1. Client → Stripe Elements (iframe sécurisé)
2. Stripe → Payment Method Token
3. Server → Stripe Payment Intent
4. Client → Confirmation 3D Secure
5. Server → Webhook validation
```

## Implémentation Stripe Elements

### Configuration Sécurisée
```typescript
// Stripe Elements avec CSP strict
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  {
    locale: 'fr',
    stripeAccount: undefined, // Pas de connected accounts
  }
)

const options: StripeElementsOptions = {
  appearance: {
    theme: 'stripe',
    variables: {
      colorPrimary: '#0570de',
      fontFamily: 'Inter, system-ui, sans-serif',
    },
  },
  loader: 'always',
}
```

### Elements Sécurisés
```typescript
// Utilisation des Elements officiels uniquement
<PaymentElement 
  id="payment-element"
  options={{
    layout: 'tabs',
    paymentMethodOrder: ['card', 'paypal'], // Limiter les méthodes
  }}
/>

<AddressElement 
  options={{
    mode: 'billing',
    autocomplete: {
      mode: 'google_maps_api', // Validation adresses
    },
  }}
/>
```

## Validation Côté Serveur

### Payment Intent Sécurisé
```typescript
// app/api/checkout/payment-intent/route.ts
export async function POST(request: NextRequest) {
  const session = await requireAuth(request)
  
  // Validation du panier
  const cart = await getValidatedCart(session.user.id)
  if (!cart.items.length) {
    return NextResponse.json(
      { error: 'Cart is empty' }, 
      { status: 400 }
    )
  }
  
  // Calcul sécurisé côté serveur
  const amount = calculateSecureAmount(cart.items)
  
  // Création Payment Intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Conversion en centimes
    currency: 'cad',
    customer: await getOrCreateStripeCustomer(session.user),
    metadata: {
      userId: session.user.id,
      cartId: cart.id,
      orderNumber: generateOrderNumber(),
    },
    payment_method_options: {
      card: {
        capture_method: 'automatic',
        setup_future_usage: 'off_session', // Éviter stockage
      },
    },
  })
  
  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
  })
}
```

### Validation Montants
```typescript
function calculateSecureAmount(items: CartItem[]): number {
  return items.reduce((total, item) => {
    // Prix depuis la base, pas du client
    const securePrice = item.variant.price
    const quantity = Math.max(1, Math.min(99, item.quantity))
    
    return total + (securePrice * quantity)
  }, 0)
}
```

## Webhooks Sécurisés

### Validation Signature
```typescript
// app/api/webhooks/stripe/route.ts
export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!
  
  let event: Stripe.Event
  
  try {
    // Vérification signature obligatoire
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return new Response('Invalid signature', { status: 400 })
  }
  
  // Traitement sécurisé par type
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object)
      break
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object)
      break
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }
  
  return new Response('OK', { status: 200 })
}
```

### Idempotence
```typescript
async function handlePaymentSuccess(
  paymentIntent: Stripe.PaymentIntent
) {
  const orderId = paymentIntent.metadata.orderNumber
  
  // Vérifier si déjà traité (idempotence)
  const existingOrder = await db.order.findUnique({
    where: { orderNumber: orderId }
  })
  
  if (existingOrder?.status === 'CONFIRMED') {
    return // Déjà traité
  }
  
  // Traitement atomique
  await db.$transaction(async (tx) => {
    await tx.order.update({
      where: { orderNumber: orderId },
      data: {
        status: 'CONFIRMED',
        paymentId: paymentIntent.id,
        paidAt: new Date(),
      }
    })
    
    // Mise à jour stock
    await updateStockLevels(tx, orderId)
  })
}
```

## Protection Anti-Fraude

### Validation Client
```typescript
// Vérifications avant paiement
async function validatePayment(
  userId: string,
  amount: number,
  paymentMethodId: string
) {
  // Limite montant par transaction
  if (amount > 10000) { // 10,000 CAD
    throw new Error('Amount exceeds limit')
  }
  
  // Vérifier historique utilisateur
  const recentOrders = await db.order.count({
    where: {
      userId,
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24h
      }
    }
  })
  
  if (recentOrders > 5) {
    throw new Error('Too many orders in 24h')
  }
  
  // Validation payment method
  const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)
  if (paymentMethod.customer !== getStripeCustomerId(userId)) {
    throw new Error('Payment method mismatch')
  }
}
```

### Radar Rules (Stripe)
```typescript
// Configuration côté Stripe Dashboard
const radarRules = [
  {
    rule: 'block_if(::ip_country != ::card_country)',
    description: 'Bloquer si pays IP ≠ pays carte'
  },
  {
    rule: 'block_if(::amount > 500 and ::risk_score > 60)',
    description: 'Bloquer gros montants risqués'
  },
  {
    rule: 'review_if(::amount > 1000)',
    description: 'Review manuel > 1000 CAD'
  }
]
```

## Gestion des Remboursements

### Remboursement Sécurisé
```typescript
async function processRefund(
  orderId: string,
  amount?: number,
  reason?: string
) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { user: true }
  })
  
  if (!order?.paymentId) {
    throw new Error('No payment to refund')
  }
  
  // Validation business rules
  const daysSincePurchase = (Date.now() - order.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  if (daysSincePurchase > 30) {
    throw new Error('Refund period expired')
  }
  
  // Remboursement via Stripe
  const refund = await stripe.refunds.create({
    payment_intent: order.paymentId,
    amount: amount ? Math.round(amount * 100) : undefined,
    reason: reason || 'requested_by_customer',
    metadata: {
      orderId: order.id,
      userId: order.userId,
    },
  })
  
  // Update base de données
  await db.order.update({
    where: { id: orderId },
    data: {
      status: amount ? 'PARTIALLY_REFUNDED' : 'REFUNDED',
      refundId: refund.id,
    }
  })
  
  return refund
}
```

## Tests de Sécurité

### Cartes de Test Stripe
```typescript
// Tests automatisés avec cartes spécifiques
const testCards = {
  success: '4242424242424242',
  decline: '4000000000000002',
  fraud: '4100000000000019',
  auth_required: '4000002500003155',
  insufficient_funds: '4000000000009995',
}
```

### Tests de Validation
```typescript
describe('Payment Security', () => {
  it('rejects tampered amounts', async () => {
    const response = await request(app)
      .post('/api/checkout/payment-intent')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        amount: 1, // Tentative de manipulation
        cartId: validCartId
      })
      
    expect(response.status).toBe(400)
    expect(response.body.error).toContain('amount')
  })
  
  it('validates payment method ownership', async () => {
    const otherUserPaymentMethod = 'pm_other_user'
    
    const response = await request(app)
      .post('/api/checkout/confirm')
      .send({
        paymentMethodId: otherUserPaymentMethod,
        paymentIntentId: validPaymentIntent
      })
      
    expect(response.status).toBe(403)
  })
})
```

## Configuration Production

### Variables d'Environnement
```env
# Stripe Production Keys
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Security
PAYMENT_MAX_AMOUNT=10000
PAYMENT_RATE_LIMIT=5
FRAUD_DETECTION_ENABLED=true
```

### Monitoring
```typescript
// Métriques à surveiller
const paymentMetrics = {
  successRate: 'payment_success_rate',
  declineRate: 'payment_decline_rate',
  fraudAttempts: 'fraud_attempts',
  averageAmount: 'average_payment_amount',
  refundRate: 'refund_rate',
}
```

## Conformité PCI DSS

### Exigences Respectées
- ✅ Pas de stockage de données carte
- ✅ Chiffrement en transit (HTTPS)
- ✅ Accès restreint aux données
- ✅ Audit trail complet
- ✅ Tests de sécurité réguliers

### Questionnaire SAQ A
Le projet qualifie pour **SAQ A** (Self-Assessment Questionnaire A) car :
- Utilise uniquement Stripe Elements
- Aucune donnée carte stockée
- Redirection vers pages sécurisées

## Audit et Compliance

### Checklist Sécurité
- [ ] Clés Stripe production configurées
- [ ] Webhooks avec validation signature
- [ ] Rate limiting sur endpoints paiement
- [ ] Logs des transactions sensibles
- [ ] Tests de sécurité automatisés
- [ ] Monitoring fraude actif
- [ ] Documentation mise à jour

### Tests Périodiques
- **Hebdomadaire** : Tests cartes de test
- **Mensuel** : Audit logs transactions
- **Trimestriel** : Revue règles anti-fraude
- **Annuel** : Audit sécurité complet

# Tests de Paiements

## Vue d'Ensemble

Suite complète de tests pour valider la sécurité et le fonctionnement des paiements Stripe.

## Configuration Tests

### Prérequis
```bash
# 1. Serveur lancé
npm run dev

# 2. Variables test (minimum)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_test_secret_for_development"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### Script Automatique
```bash
# Recommandé - tests automatisés
npm run test:payments

# Manuel pour debug
NODE_ENV=development npm run test:payment-intent
```

## Tests Sécurité Paiements

### Validation Montants
```javascript
// tests/payment-amount-validation.test.js
describe('Payment Amount Security', () => {
  it('detects amount tampering', async () => {
    // Créer un panier avec montant connu
    const cart = await createTestCart([
      { price: 100, quantity: 2 }, // 200 + taxes
      { price: 50, quantity: 1 }   // 50 + taxes
    ])
    
    // Tentative de manipulation montant
    const tamperedAmount = 1000 // Montant réduit frauduleux
    const realAmount = 28750    // Vrai montant (287.50 CAD en centimes)
    
    const validation = await validatePaymentAmount(
      tamperedAmount,
      'cad',
      cart.id
    )
    
    expect(validation.valid).toBe(false)
    expect(validation.expectedAmount).toBe(realAmount)
    expect(validation.discrepancy).toBe(27750) // Différence
  })
})
```

### Tests Anti-Fraude
```javascript
describe('Fraud Detection', () => {
  it('blocks suspicious high amounts', async () => {
    const suspiciousAmount = 50000 // 500$ CAD
    const validation = await validatePaymentAmount(
      suspiciousAmount,
      'cad',
      'empty-cart-id'
    )
    
    expect(validation.valid).toBe(false)
    expect(validation.reason).toContain('suspicious')
  })
  
  it('validates currency consistency', async () => {
    const validation = await validatePaymentAmount(
      10000, // 100$ en centimes
      'usd', // Devise différente
      testCartId
    )
    
    expect(validation.valid).toBe(false)
    expect(validation.reason).toContain('currency')
  })
})
```

## Tests Payment Intent

### Création Sécurisée
```javascript
describe('Payment Intent Creation', () => {
  it('creates valid payment intent', async () => {
    const response = await fetch('http://localhost:3000/api/checkout/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Test-User-Id': 'test-user-payment',
        'X-Test-User-Email': 'test@testauth.local',
        'X-Test-User-Role': 'USER'
      },
      body: JSON.stringify({
        cartId: testCartId,
        email: 'test@testauth.local',
        billingAddress: {
          line1: '123 Test St',
          city: 'Montreal',
          postal_code: 'H1H1H1',
          country: 'CA'
        }
      })
    })
    
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.clientSecret).toMatch(/^pi_.*_secret_.*/)
    expect(data.paymentIntentId).toMatch(/^pi_.*/)
  })
  
  it('prevents duplicate payment intents', async () => {
    // Premier payment intent
    const response1 = await createPaymentIntent(testData)
    expect(response1.status).toBe(200)
    
    // Deuxième tentative immédiate
    const response2 = await createPaymentIntent(testData)
    expect(response2.status).toBe(200)
    
    // Vérifier même payment intent retourné
    const data1 = await response1.json()
    const data2 = await response2.json()
    expect(data1.paymentIntentId).toBe(data2.paymentIntentId)
  })
})
```

## Tests Webhooks Stripe

### Validation Signature
```javascript
describe('Stripe Webhooks', () => {
  it('validates webhook signature', () => {
    const payload = JSON.stringify({
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_test' } }
    })
    
    const signature = generateTestSignature(payload)
    
    const isValid = validateWebhookSignature(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
    
    expect(isValid).toBe(true)
  })
  
  it('rejects invalid signatures', () => {
    const payload = JSON.stringify({ type: 'test' })
    const invalidSignature = 'invalid_signature'
    
    const isValid = validateWebhookSignature(
      payload,
      invalidSignature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
    
    expect(isValid).toBe(false)
  })
  
  it('handles payment_intent.succeeded', async () => {
    const webhookPayload = {
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: testPaymentIntentId,
          amount: 10000,
          currency: 'cad',
          metadata: {
            userId: testUserId,
            cartId: testCartId,
            orderNumber: 'ORD-TEST-001'
          }
        }
      }
    }
    
    const result = await handleStripeWebhook(webhookPayload)
    
    expect(result.success).toBe(true)
    
    // Vérifier ordre créé
    const order = await db.order.findUnique({
      where: { orderNumber: 'ORD-TEST-001' }
    })
    
    expect(order).toBeTruthy()
    expect(order.status).toBe('CONFIRMED')
  })
})
```

## Tests Cartes Stripe

### Cartes de Test Standards
```javascript
const testCards = {
  success: '4242424242424242',
  decline: '4000000000000002',
  insufficientFunds: '4000000000009995',
  fraudulent: '4100000000000019',
  authRequired: '4000002500003155'
}

describe('Stripe Test Cards', () => {
  it('processes successful payment', async () => {
    const paymentResult = await processTestPayment({
      cardNumber: testCards.success,
      amount: 5000, // 50 CAD
      currency: 'cad'
    })
    
    expect(paymentResult.status).toBe('succeeded')
  })
  
  it('handles declined card', async () => {
    const paymentResult = await processTestPayment({
      cardNumber: testCards.decline,
      amount: 5000
    })
    
    expect(paymentResult.status).toBe('failed')
    expect(paymentResult.error.code).toBe('card_declined')
  })
})
```

## Tests d'Intégration Complète

### Workflow End-to-End
```javascript
describe('Complete Payment Flow', () => {
  it('completes full payment process', async () => {
    // 1. Créer panier
    const cart = await createTestCart()
    
    // 2. Créer payment intent
    const piResponse = await createPaymentIntent({
      cartId: cart.id,
      email: 'test@example.com'
    })
    
    const { clientSecret, paymentIntentId } = await piResponse.json()
    
    // 3. Simuler paiement réussi
    await simulateSuccessfulPayment(paymentIntentId)
    
    // 4. Vérifier webhook traité
    const webhook = await simulateStripeWebhook({
      type: 'payment_intent.succeeded',
      paymentIntentId
    })
    
    expect(webhook.status).toBe(200)
    
    // 5. Vérifier commande créée
    const orders = await db.order.findMany({
      where: { paymentId: paymentIntentId }
    })
    
    expect(orders).toHaveLength(1)
    expect(orders[0].status).toBe('CONFIRMED')
  })
})
```

## Troubleshooting Tests

### Problèmes Courants

#### Tests échouent : "SERVER_NOT_READY"
```bash
# Solution 1: Serveur lancé
npm run dev
# Attendre "Ready in XXXms"

# Solution 2: Vérifier port 3000
lsof -i :3000
```

#### Variables manquantes
```bash
# Vérifier configuration
NODE_ENV=development node -e "
  console.log('DATABASE_URL:', !!process.env.DATABASE_URL)
  console.log('STRIPE_SECRET:', !!process.env.STRIPE_SECRET_KEY)
  console.log('WEBHOOK_SECRET:', !!process.env.STRIPE_WEBHOOK_SECRET)
"
```

#### Authentication Tests échoue
```bash
# Headers test requis
curl -H "X-Test-User-Id: test-user-debug" \
     -H "X-Test-User-Email: debug@testauth.local" \
     -H "X-Test-User-Role: USER" \
     http://localhost:3000/api/admin/check-role
```

## Test Data Cleanup

### Base de Données Test
```javascript
// Nettoyer après tests
afterEach(async () => {
  await db.order.deleteMany({
    where: { orderNumber: { startsWith: 'TEST-' } }
  })
  
  await db.cart.deleteMany({
    where: { userId: { startsWith: 'test-user-' } }
  })
})
```

### Stripe Test Data
```javascript
// Nettoyer payment intents test
afterAll(async () => {
  const paymentIntents = await stripe.paymentIntents.list({
    limit: 100
  })
  
  for (const pi of paymentIntents.data) {
    if (pi.metadata.testRun) {
      await stripe.paymentIntents.cancel(pi.id)
    }
  }
})
```

## Commandes Utiles

### Lancer les Tests
```bash
# Tous les tests paiements
npm run test:payments

# Test spécifique
NODE_ENV=development node tests/payment-intent.test.js

# Debug mode
DEBUG=stripe npm run test:payments

# Coverage
npm run test:payments:coverage
```

### Validation Manuelle
```bash
# Test payment intent endpoint
curl -X POST http://localhost:3000/api/checkout/create-payment-intent \
  -H "Content-Type: application/json" \
  -H "X-Test-User-Id: test-user-manual" \
  -H "X-Test-User-Email: manual@testauth.local" \
  -d '{"cartId":"test","email":"test@example.com"}'
```

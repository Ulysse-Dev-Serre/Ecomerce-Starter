# Stratégie de Tests

## Vue d'Ensemble

Approche de test complète couvrant tous les aspects critiques de l'e-commerce avec tests automatisés et manuels.

## Types de Tests

### Tests Unitaires
**Coverage** : Fonctions utilitaires et logique métier

```typescript
// Exemple : test de calcul de prix
describe('Price Calculation', () => {
  it('calculates total with taxes', () => {
    const items = [
      { price: 100, quantity: 2 },
      { price: 50, quantity: 1 }
    ]
    const total = calculateTotal(items, 0.15) // QC tax
    expect(total).toBe(287.5) // (200 + 50) * 1.15
  })
  
  it('applies free shipping threshold', () => {
    const shipping = calculateShipping(100) // Over 75$
    expect(shipping).toBe(0)
  })
})
```

### Tests d'Intégration API
**Coverage** : Endpoints et workflow complets

```typescript
describe('Cart Workflow', () => {
  it('completes cart to order flow', async () => {
    // 1. Add items to cart
    const addResponse = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ variantId: 'test-variant', quantity: 2 })
    
    expect(addResponse.status).toBe(200)
    
    // 2. Create payment intent
    const piResponse = await request(app)
      .post('/api/checkout/payment-intent')
      .set('Authorization', `Bearer ${token}`)
    
    expect(piResponse.body.clientSecret).toBeDefined()
    
    // 3. Simulate webhook confirmation
    const webhookResponse = await simulateStripeWebhook({
      type: 'payment_intent.succeeded',
      paymentIntentId: piResponse.body.paymentIntentId
    })
    
    expect(webhookResponse.status).toBe(200)
    
    // 4. Verify order created
    const orders = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${token}`)
    
    expect(orders.body.data).toHaveLength(1)
    expect(orders.body.data[0].status).toBe('CONFIRMED')
  })
})
```

### Tests E2E (End-to-End)
**Coverage** : Parcours utilisateur complets avec Playwright

```typescript
import { test, expect } from '@playwright/test'

test('complete purchase flow', async ({ page }) => {
  // 1. Navigate to shop
  await page.goto('/shop')
  
  // 2. Add product to cart
  await page.click('[data-testid="add-to-cart-btn"]')
  await expect(page.locator('[data-testid="cart-count"]')).toContainText('1')
  
  // 3. Go to checkout
  await page.click('[data-testid="cart-link"]')
  await page.click('[data-testid="checkout-btn"]')
  
  // 4. Fill payment form (test mode)
  await page.fill('[data-testid="email-input"]', 'test@example.com')
  await page.fill('[data-testid="card-number"]', '4242424242424242')
  await page.fill('[data-testid="card-expiry"]', '12/25')
  await page.fill('[data-testid="card-cvc"]', '123')
  
  // 5. Submit payment
  await page.click('[data-testid="pay-button"]')
  
  // 6. Verify success
  await expect(page.locator('h1')).toContainText('Payment Successful')
})
```

## Test Data Management

### Fixtures
```typescript
// tests/fixtures/products.json
{
  "products": [
    {
      "id": "test-product-1",
      "slug": "test-iphone",
      "translations": [
        {
          "language": "FR",
          "name": "iPhone Test",
          "description": "iPhone pour tests",
          "price": 999.00
        }
      ],
      "status": "ACTIVE"
    }
  ]
}
```

### Database Seeding
```typescript
// tests/helpers/seed.ts
export async function seedTestData() {
  const testUser = await db.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER'
    }
  })
  
  const testProduct = await db.product.create({
    data: {
      slug: 'test-product',
      status: 'ACTIVE',
      translations: {
        create: {
          language: 'FR',
          name: 'Produit Test',
          price: 29.99
        }
      }
    }
  })
  
  return { testUser, testProduct }
}
```

## Tests de Performance

### Load Testing avec Artillery
```yaml
# artillery.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Browse products"
    weight: 60
    flow:
      - get:
          url: "/api/products"
  - name: "Add to cart"
    weight: 30
    flow:
      - post:
          url: "/api/cart"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            variantId: "test-variant"
            quantity: 1
  - name: "Create order"
    weight: 10
    flow:
      - post:
          url: "/api/orders"
          headers:
            Authorization: "Bearer {{ token }}"
```

### Métriques de Performance
```typescript
describe('Performance Tests', () => {
  it('loads product list under 200ms', async () => {
    const start = Date.now()
    const response = await request(app).get('/api/products')
    const duration = Date.now() - start
    
    expect(response.status).toBe(200)
    expect(duration).toBeLessThan(200)
  })
  
  it('handles concurrent cart additions', async () => {
    const promises = Array(10).fill(null).map(() => 
      request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${token}`)
        .send({ variantId: 'test-variant', quantity: 1 })
    )
    
    const responses = await Promise.all(promises)
    responses.forEach(response => {
      expect(response.status).toBe(200)
    })
  })
})
```

## Tests de Sécurité

### Validation Input
```typescript
describe('Security - Input Validation', () => {
  it('blocks XSS attempts', async () => {
    const xssPayload = '<script>alert("xss")</script>'
    
    const response = await request(app)
      .post('/api/contact')
      .send({
        name: xssPayload,
        email: 'test@example.com',
        message: 'Test'
      })
    
    expect(response.status).toBe(400)
    expect(response.body.error).toContain('validation')
  })
  
  it('prevents SQL injection', async () => {
    const sqlPayload = "'; DROP TABLE products; --"
    
    const response = await request(app)
      .get('/api/products')
      .query({ search: sqlPayload })
    
    expect(response.status).toBe(200)
    // Vérifier que les produits existent toujours
    expect(response.body.data).toBeDefined()
  })
})
```

### Tests d'Autorisation
```typescript
describe('Security - Authorization', () => {
  it('blocks unauthorized admin access', async () => {
    const userToken = await getUserToken('USER')
    
    const response = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send(validProductData)
    
    expect(response.status).toBe(403)
  })
  
  it('prevents cross-user data access', async () => {
    const user1Token = await getUserToken('user1')
    const user2Id = 'user2-id'
    
    const response = await request(app)
      .get(`/api/users/${user2Id}/orders`)
      .set('Authorization', `Bearer ${user1Token}`)
    
    expect(response.status).toBe(403)
  })
})
```

## Configuration CI/CD

### GitHub Actions
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
        
      - name: Run integration tests
        run: npm run test:api
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          
      - name: Run E2E tests
        run: npm run test:e2e
```

## Coverage et Reporting

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  }
}
```

### Reports de Coverage
```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html
```

## Commandes de Test

### Développement
```bash
# Tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Tests spécifiques
npm run test -- --testNamePattern="Cart"

# Tests avec coverage
npm run test:coverage
```

### CI/CD
```bash
# Tests unitaires
npm run test:unit

# Tests d'intégration
npm run test:api

# Tests E2E
npm run test:e2e

# Tests de performance
npm run test:performance

# Tests de sécurité
npm run test:security
```

## Best Practices

### Structure des Tests
1. **AAA Pattern** : Arrange, Act, Assert
2. **Noms descriptifs** : `should create order when cart has items`
3. **Tests isolés** : Pas de dépendances entre tests
4. **Mock external services** : APIs tierces mockées

### Performance Tests
- Temps de réponse < 200ms pour APIs
- Concurrent users handling
- Memory leaks detection
- Database connection pooling

### Maintenance
- **Tests fragiles** : Éviter sélecteurs CSS fragiles
- **Data cleanup** : Nettoyer après chaque test
- **Environment consistency** : Même config dev/test/prod
- **Regular updates** : Mise à jour dépendances test

## Monitoring Tests

### Métriques à Surveiller
- Test execution time
- Flaky tests frequency
- Coverage trends
- Performance regression

### Alertes
- Coverage drops below threshold
- Tests failing in CI
- Performance degradation
- Security test failures

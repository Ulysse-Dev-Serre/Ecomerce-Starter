# Tests API

## Vue d'Ensemble

Tests automatisés et manuels pour valider le comportement de tous les endpoints API.

## Configuration Tests

### Framework
- **Jest** : Framework de test principal
- **Supertest** : Tests d'intégration API
- **MSW** : Mock Service Worker pour mocks

### Structure
```
tests/
├── api/
│   ├── products.test.ts
│   ├── cart.test.ts
│   ├── orders.test.ts
│   └── users.test.ts
├── fixtures/
│   ├── users.json
│   ├── products.json
│   └── orders.json
└── helpers/
    ├── test-db.ts
    └── auth-helpers.ts
```

## Tests d'Intégration

### Setup base
```typescript
import { setupTestDatabase, cleanupTestDatabase } from '@/tests/helpers/test-db'
import request from 'supertest'
import { createApp } from '@/app'

describe('Products API', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })
  
  afterAll(async () => {
    await cleanupTestDatabase()
  })
  
  beforeEach(async () => {
    await seedTestData()
  })
})
```

### Test authentification
```typescript
describe('GET /api/cart', () => {
  it('returns 401 when not authenticated', async () => {
    const response = await request(app)
      .get('/api/cart')
      
    expect(response.status).toBe(401)
    expect(response.body.success).toBe(false)
  })
  
  it('returns user cart when authenticated', async () => {
    const authToken = await getTestAuthToken()
    
    const response = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${authToken}`)
      
    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data).toHaveProperty('items')
  })
})
```

### Test validation
```typescript
describe('POST /api/products', () => {
  it('validates required fields', async () => {
    const invalidProduct = {
      // slug manquant
      status: 'ACTIVE'
    }
    
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', await getAdminToken())
      .send(invalidProduct)
      
    expect(response.status).toBe(400)
    expect(response.body.code).toBe('VALIDATION_ERROR')
    expect(response.body.details).toContainEqual({
      field: 'slug',
      message: expect.stringContaining('required')
    })
  })
  
  it('creates product with valid data', async () => {
    const validProduct = {
      slug: 'test-product',
      status: 'ACTIVE',
      translations: [{
        language: 'FR',
        name: 'Produit Test',
        description: 'Description test',
        price: 29.99
      }]
    }
    
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', await getAdminToken())
      .send(validProduct)
      
    expect(response.status).toBe(201)
    expect(response.body.success).toBe(true)
    expect(response.body.data.slug).toBe('test-product')
  })
})
```

## Tests Manuels

### REST Client
Fichier `api-tests.http` avec tous les endpoints :

```http
### Variables
@baseUrl = http://localhost:3000
@authToken = your_auth_token_here

### Get Products
GET {{baseUrl}}/api/products
Content-Type: application/json

### Get Product by Slug
GET {{baseUrl}}/api/products/iphone-15
Content-Type: application/json

### Add to Cart (Auth Required)
POST {{baseUrl}}/api/cart
Content-Type: application/json
Authorization: Bearer {{authToken}}

{
  "variantId": "clm...",
  "quantity": 2
}

### Get Cart (Auth Required)
GET {{baseUrl}}/api/cart
Authorization: Bearer {{authToken}}

### Create Order (Auth Required)
POST {{baseUrl}}/api/orders
Content-Type: application/json
Authorization: Bearer {{authToken}}

{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Montreal",
    "zipCode": "H1A 1A1",
    "country": "CA"
  },
  "billingAddress": {
    "street": "123 Main St",
    "city": "Montreal", 
    "zipCode": "H1A 1A1",
    "country": "CA"
  }
}
```

## Tests de Sécurité

### Injection Attempts
```typescript
describe('Security Tests', () => {
  it('prevents SQL injection in product search', async () => {
    const maliciousQuery = "'; DROP TABLE products; --"
    
    const response = await request(app)
      .get('/api/products')
      .query({ search: maliciousQuery })
      
    expect(response.status).toBe(200)
    // Vérifier que la table existe toujours
    const products = await db.product.count()
    expect(products).toBeGreaterThan(0)
  })
  
  it('prevents XSS in user input', async () => {
    const xssPayload = '<script>alert("xss")</script>'
    
    const response = await request(app)
      .post('/api/contact')
      .send({
        name: xssPayload,
        email: 'test@example.com',
        message: 'Test message'
      })
      
    expect(response.status).toBe(400)
    expect(response.body.error).toContain('validation')
  })
})
```

### Authorization Tests
```typescript
describe('Authorization', () => {
  it('prevents users from accessing admin endpoints', async () => {
    const userToken = await getUserToken()
    
    const response = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send(validProductData)
      
    expect(response.status).toBe(403)
  })
  
  it('prevents users from accessing other users data', async () => {
    const user1Token = await getUserToken('user1')
    const user2Id = 'user2_id'
    
    const response = await request(app)
      .get(`/api/users/${user2Id}/orders`)
      .set('Authorization', `Bearer ${user1Token}`)
      
    expect(response.status).toBe(403)
  })
})
```

## Tests de Performance

### Load Testing
```typescript
describe('Performance Tests', () => {
  it('handles concurrent cart additions', async () => {
    const userToken = await getUserToken()
    const promises = []
    
    // 10 ajouts simultanés
    for (let i = 0; i < 10; i++) {
      promises.push(
        request(app)
          .post('/api/cart')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ variantId: 'test-variant', quantity: 1 })
      )
    }
    
    const responses = await Promise.all(promises)
    
    // Tous devraient réussir
    responses.forEach(response => {
      expect(response.status).toBe(200)
    })
    
    // Vérifier quantité finale cohérente
    const cart = await getCart(userToken)
    expect(cart.totalItems).toBe(10)
  })
})
```

## Helpers de Test

### Base de données test
```typescript
// tests/helpers/test-db.ts
export async function setupTestDatabase() {
  // Utilise une DB séparée pour les tests
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
  await db.$connect()
  await db.$executeRaw`TRUNCATE TABLE "User", "Product", "Cart" CASCADE`
}

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

### Auth helpers
```typescript
// tests/helpers/auth-helpers.ts
export async function getTestAuthToken(role = 'USER') {
  const user = await db.user.create({
    data: {
      email: `test-${Date.now()}@example.com`,
      name: 'Test User',
      role
    }
  })
  
  return jwt.sign({ userId: user.id, role }, process.env.NEXTAUTH_SECRET)
}

export async function getUserToken(userId?: string) {
  if (!userId) {
    const user = await createTestUser()
    userId = user.id
  }
  return getTestAuthToken('USER')
}

export async function getAdminToken() {
  return getTestAuthToken('ADMIN')
}
```

## Coverage et Reporting

### Configuration Jest
```javascript
// jest.config.js
module.exports = {
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'app/api/**/*.ts',
    'lib/**/*.ts',
    '!**/*.test.ts',
    '!**/*.d.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
```

### Commandes
```bash
# Tous les tests
npm run test

# Tests API seulement
npm run test:api

# Coverage complet
npm run test:coverage

# Tests en watch mode
npm run test:watch

# Tests avec verbose
npm run test:verbose
```

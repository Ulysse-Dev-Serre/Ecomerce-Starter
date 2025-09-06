# Résolution de Problèmes Tests

## Problèmes Courants

### Tests Échouent : "Tests en développement uniquement"

**Cause** : `NODE_ENV` non défini
**Solution** :
```bash
# ✅ Utiliser le script automatique
npm run test:payments

# ✅ Ou forcer NODE_ENV
NODE_ENV=development npm run test:payment-intent
```

### Tests Échouent : "fetch failed"

**Cause** : Serveur Next.js non lancé
**Solution** :
```bash
# Terminal 1: Lancer serveur
npm run dev
# Attendre: "✓ Ready in XXXms"

# Terminal 2: Tests
npm run test:payments
```

### Tests Échouent : "Cannot find module"

**Cause** : Chemins d'import incorrects
**Solution** : Vérifier les imports dans les fichiers de tests
```javascript
// ✅ Correct
const { validateWebhook } = require('../src/lib/webhook-security')

// ❌ Incorrect  
const { validateWebhook } = require('../../../../src/lib/webhook-security')
```

### Variables Stripe Manquantes

**Cause** : `STRIPE_WEBHOOK_SECRET` non configuré
**Solution** : Ajouter dans `.env.local` :
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_test_secret_for_development"
```

**Note** : Pour tests locaux, utiliser une clé factice est suffisant.

## Script Automatique de Tests

### Configuration
Créer `scripts/test-runner.js` :
```javascript
const { spawn } = require('child_process')
const http = require('http')

async function checkServer() {
  return new Promise((resolve) => {
    const req = http.request('http://localhost:3000/api/health', (res) => {
      resolve(res.statusCode === 200)
    })
    req.on('error', () => resolve(false))
    req.end()
  })
}

async function runTests() {
  // Vérifier serveur
  const serverReady = await checkServer()
  if (!serverReady) {
    console.error('❌ Serveur non accessible sur localhost:3000')
    console.log('💡 Lancer: npm run dev')
    process.exit(1)
  }
  
  // Lancer tests avec NODE_ENV
  const testProcess = spawn('node', ['tests/payment-tests.js'], {
    env: { ...process.env, NODE_ENV: 'development' },
    stdio: 'inherit'
  })
  
  testProcess.on('close', (code) => {
    process.exit(code)
  })
}

runTests()
```

### Package.json
```json
{
  "scripts": {
    "test:payments": "node scripts/test-runner.js",
    "test:payments:manual": "NODE_ENV=development node tests/payment-tests.js"
  }
}
```

## Debug Configuration

### Vérifier Prérequis
```bash
# 1. Serveur accessible
curl http://localhost:3000/api/auth/session
# Attendu: {"user":null} ou données session

# 2. Variables environnement
node -e "
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('DATABASE_URL:', !!process.env.DATABASE_URL) 
console.log('STRIPE_SECRET:', !!process.env.STRIPE_SECRET_KEY)
"

# 3. Base de données
npx prisma db push
# Vérifier: "✔ Generated Prisma Client"
```

### Test Auth Headers
```bash
curl -H "X-Test-User-Id: test-user-debug" \
     -H "X-Test-User-Email: debug@testauth.local" \
     -H "X-Test-User-Role: USER" \
     http://localhost:3000/api/admin/check-role
# Attendu: {"isAdmin":false}
```

## Ordre d'Exécution Recommandé

### Setup Initial
```bash
# 1. Base de données
npm run db:push

# 2. Variables environnement
cp .env.example .env.local
# Éditer .env.local avec vraies valeurs

# 3. Serveur (terminal séparé)
npm run dev
```

### Exécution Tests
```bash
# Attendre "Ready" puis:
npm run test:payments
```

## Tests Spécifiques

### Test Endpoint Individuel
```bash
NODE_ENV=development curl \
  -H "X-Test-User-Id: test-user-individual" \
  -H "X-Test-User-Email: individual@testauth.local" \
  -H "X-Test-User-Role: USER" \
  -H "Content-Type: application/json" \
  -X POST http://localhost:3000/api/checkout/create-payment-intent \
  -d '{
    "cartId":"test-cart",
    "email":"individual@testauth.local",
    "billingAddress":{
      "line1":"123 Test",
      "city":"Test",
      "postal_code":"H1H1H1",
      "country":"CA"
    }
  }'
```

### Test Authentication Middleware
```bash
# Test headers auth corrects
NODE_ENV=development node -e "
const headers = {
  'X-Test-User-Id': 'test-user-middleware',
  'X-Test-User-Email': 'middleware@testauth.local',
  'X-Test-User-Role': 'USER'
}

fetch('http://localhost:3000/api/admin/check-role', {
  headers
}).then(r => r.json()).then(console.log)
"
```

## Logs de Debug

### Activer Logs Détaillés
```bash
# Logs serveur complets
DEBUG=* npm run dev

# Logs tests avec détails
NODE_ENV=development DEBUG=test npm run test:payments
```

### Logs Personnalisés
```javascript
// Dans les tests
console.log('🧪 TEST:', testName)
console.log('📤 REQUEST:', JSON.stringify(requestData, null, 2))
console.log('📥 RESPONSE:', JSON.stringify(responseData, null, 2))
```

## Erreurs Fréquentes

### "ECONNREFUSED"
**Cause** : Port 3000 occupé ou serveur non lancé
```bash
# Vérifier port
lsof -i :3000

# Tuer processus si nécessaire
kill -9 $(lsof -ti:3000)

# Relancer serveur
npm run dev
```

### "Database not found"
**Cause** : Base de données non initialisée
```bash
# Reset complet
npx prisma migrate reset
npx prisma db push
npx prisma db seed
```

### "Invalid test headers"
**Cause** : Format headers test incorrect
```javascript
// ✅ Format correct
const testHeaders = {
  'X-Test-User-Id': 'test-user-format',      // Préfixe requis
  'X-Test-User-Email': 'format@testauth.local', // Domaine requis
  'X-Test-User-Role': 'USER'                    // Role valide
}

// ❌ Format incorrect
const badHeaders = {
  'userId': 'test-user',           // Pas de préfixe X-Test-
  'email': 'test@gmail.com',       // Pas de domaine @testauth.local
  'role': 'INVALID_ROLE'           // Role non supporté
}
```

## Performance et Timing

### Timeouts Tests
```javascript
// Dans les tests
const TIMEOUT_MS = 10000 // 10 secondes

describe('Tests avec timeout', () => {
  beforeEach(() => {
    jest.setTimeout(TIMEOUT_MS)
  })
})
```

### Retry Logic
```javascript
async function retryTest(testFn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await testFn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}
```

## Clean Up et Maintenance

### Nettoyage Après Tests
```javascript
afterEach(async () => {
  // Nettoyer données test
  await db.order.deleteMany({
    where: { orderNumber: { startsWith: 'TEST-' } }
  })
  
  await db.user.deleteMany({
    where: { email: { endsWith: '@testauth.local' } }
  })
})
```

### Monitoring Tests
```javascript
// Métriques tests
const testMetrics = {
  startTime: Date.now(),
  testsRun: 0,
  testsPassed: 0,
  testsFailed: 0
}

afterAll(() => {
  const duration = Date.now() - testMetrics.startTime
  console.log(`📊 Tests completed in ${duration}ms`)
  console.log(`✅ Passed: ${testMetrics.testsPassed}`)
  console.log(`❌ Failed: ${testMetrics.testsFailed}`)
})
```

## Checklist Debug

- [ ] Serveur Next.js lancé sur port 3000
- [ ] Variables environnement configurées
- [ ] Base de données accessible
- [ ] `NODE_ENV=development` défini
- [ ] Headers test au bon format
- [ ] Timeouts suffisants pour tests
- [ ] Logs activés si nécessaire
- [ ] Nettoyage données test après exécution

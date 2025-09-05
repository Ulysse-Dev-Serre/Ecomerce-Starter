# Tests E2E de Sécurité d'Accès - Documentation

## Vue d'ensemble

Les tests de sécurité d'accès vérifient que les protections d'ownership, d'authentification et d'autorisation fonctionnent correctement sur tous les endpoints de l'API.

## Types de tests implémentés

### 1. Tests de violation d'ownership

Vérifient qu'un utilisateur ne peut pas accéder aux ressources d'un autre utilisateur.

**Scénarios testés**:
- Utilisateur A tente d'accéder au panier de B → `403 Forbidden`
- Utilisateur A tente de modifier le profil de B → `403 Forbidden`  
- Utilisateur A tente d'ajouter au panier de B → `403 Forbidden`
- Utilisateur A tente de voir les commandes de B → `403 Forbidden`

**Endpoints testés**:
```
GET  /api/cart/[userId]           → ownership check
POST /api/cart/[userId]           → ownership check  
GET  /api/users/[id]              → ownership check
PATCH /api/users/[id]             → ownership check
GET  /api/users/[id]/orders       → ownership check
```

### 2. Tests d'authentification

Vérifient que les routes privées nécessitent une authentification.

**Scénarios testés**:
- Accès sans session/token → `401 Unauthorized`
- Headers d'authentification manquants → `401 Unauthorized`
- Session expirée/invalide → `401 Unauthorized`

**Endpoints testés**:
```
GET /api/cart/[userId]            → auth required
GET /api/orders                   → auth required
GET /api/users                    → auth required
POST /api/cart/[userId]           → auth required
```

### 3. Tests d'autorisation admin

Vérifient que les routes admin nécessitent des privilèges élevés.

**Scénarios testés**:
- Utilisateur régulier tente accès admin → `403 Forbidden`
- Non-authentifié tente accès admin → `401 Unauthorized`
- Admin accède aux routes admin → `200 OK`

**Endpoints testés**:
```
GET  /api/admin/products          → admin required
POST /api/admin/products          → admin required
GET  /api/admin/categories        → admin required
POST /api/admin/media/upload      → admin required
GET  /api/admin/security-check    → admin required
```

### 4. Tests de codes de statut HTTP

Vérifient que les codes de statut appropriés sont retournés.

**Distinctions testées**:
- `401 Unauthorized` vs `403 Forbidden`
- `403 Forbidden` vs `404 Not Found`
- `400 Bad Request` vs `403 Forbidden`

## Architecture des tests

### Système d'authentification de test

En mode développement, les tests utilisent des headers HTTP pour simuler l'authentification:

```http
X-Test-User-Id: test-user-regular-001
X-Test-User-Email: user.regular@testauth.local  
X-Test-User-Role: USER
```

**Sécurité**: Ce système n'est actif qu'en `NODE_ENV=development`.

### Utilisateurs de test standardisés

```typescript
const TestUsers = {
  regularUser: {
    id: 'test-user-regular-001',
    email: 'user.regular@testauth.local',
    role: 'USER'
  },
  otherUser: {
    id: 'test-user-other-002', 
    email: 'user.other@testauth.local',
    role: 'USER'
  },
  adminUser: {
    id: 'test-user-admin-003',
    email: 'admin@testauth.local',
    role: 'ADMIN'
  }
}
```

### Scénarios de test réutilisables

```typescript
const TestScenarios = {
  ownershipViolation: (endpoint, owner, attacker) => ({
    name: `Ownership violation: ${attacker.name} → ${owner.name} resource`,
    endpoint,
    user: attacker,
    expectedStatus: 403,
    expectsSecurityLog: true
  }),
  
  unauthorizedAdminAccess: (endpoint, regularUser) => ({
    name: `Unauthorized admin: ${regularUser.name} → ${endpoint}`,
    endpoint,
    user: regularUser,
    expectedStatus: 403
  })
}
```

## Execution des tests

### Tests automatisés

```bash
# Test complet de sécurité d'accès
npm run test:access-security

# Ou directement
node tests/test-access-security.js
```

### Tests manuels (REST Client)

```bash
# Ouvrir dans VS Code avec extension REST Client
code tests/access-security.http
```

### Intégration dans pipeline CI/CD

```bash
# Tous les tests de sécurité
npm run security:all
```

## Logging et monitoring

### Events de sécurité loggés

```typescript
logSecurityEvent('ownership_violation', {
  userId: 'user-***001',        // Partiellement masqué
  resource: '/api/cart/other',  // Endpoint tenté
  timestamp: '2024-01-01T12:00:00Z'
})
```

**Informations PAS loggées** (sécurité):
- Mots de passe ou tokens complets
- Données personnelles complètes  
- Détails techniques internes
- Stack traces en production

### Métriques recommandées

- Nombre de violations d'ownership par jour
- IPs avec le plus de tentatives non autorisées
- Endpoints admin les plus ciblés
- Taux de succès des attaques simulées

## Critères d'acceptation validés

### ✅ Test ownership violation
```
Utilisateur A tente /api/cart/{id de B}
→ 403 Forbidden + log sécurité neutre
```

### ✅ Test accès non authentifié  
```
Requête sans session/token sur route privée
→ 401 Unauthorized + pas de data leak
```

### ✅ Test accès admin non autorisé
```
Utilisateur régulier tente route admin  
→ 403 Forbidden + log approprié
```

### ✅ Test codes de statut corrects
```
401 vs 403: Distinction claire selon contexte
403 vs 404: Ressources vs permissions
```

## Configuration des tests

### Variables d'environnement

```bash
# Tests actifs seulement en développement
NODE_ENV=development

# URL de base pour les tests
NEXT_PUBLIC_URL=http://localhost:3000
```

### Personnalisation des endpoints

```typescript
// Dans tests/test-access-security.js
const EndpointsToTest = {
  ownership: [
    {
      endpoint: `/api/cart/${TestResources.regularUserCart}`,
      owner: TestUsers.regularUser,
      methods: ['GET', 'POST']
    }
    // Ajouter d'autres endpoints...
  ]
}
```

## Résultats attendus

### Score global de sécurité

- **95-100%**: Sécurité excellente, toutes protections actives
- **85-94%**: Sécurité bonne, ajustements mineurs possibles
- **<85%**: Sécurité insuffisante, corrections requises

### Exemple de rapport

```
🛡️ Test Suite E2E - Sécurité d'accès et ownership
======================================================

📊 Score global: 47/50 (94%)
  ownership: 15/15 (100%)
  authentication: 12/12 (100%)  
  authorization: 10/12 (83%)
  statusCodes: 8/8 (100%)
  logging: 2/3 (67%)

✅ CRITÈRES D'ACCEPTATION VÉRIFIÉS:
  • Utilisateur A ne peut pas accéder aux ressources de B → 403
  • Utilisateur non connecté → 401 sur routes privées
  • Utilisateur non admin → 403 sur routes admin
  • Codes HTTP corrects (403 vs 404) selon contexte
```

## Maintenance et évolution

### Ajout de nouveaux endpoints

1. Ajouter l'endpoint dans `EndpointsToTest`
2. Définir les utilisateurs autorisés
3. Tester manuellement avec REST Client
4. Vérifier les logs de sécurité

### Mise à jour des scénarios

```typescript
// Nouveau scénario de test
TestScenarios.resourceNotFound = (endpoint, user) => ({
  name: `Resource not found: ${user.name} → ${endpoint}`,
  endpoint,
  user,
  expectedStatus: 404
})
```

### Intégration avec monitoring

```typescript
// Envoyer métriques vers système de monitoring
if (violationCount > threshold) {
  alerting.send('High number of access violations detected')
}
```

## Bonnes pratiques

### Sécurité des tests

1. **Isolation**: Tests n'affectent pas les données de production
2. **Nettoyage**: Cleanup automatique après tests
3. **Simulation**: Authentification simulée seulement en dev
4. **Logs sécurisés**: Pas d'exposition de données sensibles

### Performance

1. **Rate limiting**: Pauses entre tests pour éviter blocage
2. **Parallélisation**: Tests indépendants exécutés en parallèle  
3. **Cleanup efficient**: Nettoyage rapide des données de test

### Maintenance

1. **Tests réguliers**: Exécution dans CI/CD
2. **Mise à jour**: Synchronisation avec nouveaux endpoints
3. **Monitoring**: Surveillance métriques sécurité
4. **Documentation**: Mise à jour des scénarios de test

## Troubleshooting

### Tests échouent en mode développement

1. Vérifier `NODE_ENV=development`
2. Contrôler headers de test dans requests
3. Vérifier que les endpoints existent

### Faux positifs/négatifs

1. Revoir la logique d'authentification
2. Vérifier les codes de statut attendus
3. Contrôler les logs applicatifs

### Performance dégradée

1. Réduire le nombre de tests parallèles
2. Augmenter les pauses entre requests
3. Optimiser le nettoyage des données

## Exemple complet d'utilisation

```javascript
// Exécuter un test de violation d'ownership
const result = await runTestScenario(
  TestScenarios.ownershipViolation(
    '/api/cart/user-b-cart',
    TestUsers.regularUser,  // Owner
    TestUsers.otherUser     // Attacker
  ),
  { method: 'GET' }
)

console.log(result.passed ? '✅ Test passed' : '❌ Test failed')
```

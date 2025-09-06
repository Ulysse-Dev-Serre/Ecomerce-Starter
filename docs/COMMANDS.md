# Référence Complète des Commandes

## ⚡ Commandes les Plus Utilisées

```bash
# Démarrer le projet
npm run dev                    # Serveur développement

# Créer un admin (VOTRE MÉTHODE)
node scripts/create-admin.js ulyssebo255@gmail.com

# Interface base de données
npm run db:studio             # GUI pour gérer la DB

# Tests sécurité avant production
npm run security:all          # Suite complète sécurité
```

## 🚀 Développement

### Serveur
```bash
npm run dev                   # Développement avec Turbopack
npm run build                 # Build production
npm run start                 # Serveur production
npm run lint                  # ESLint
```

### Base de Données
```bash
npm run db:generate           # Générer client Prisma
npm run db:push              # Pousser schema vers DB
npm run db:studio            # Interface graphique Prisma
npm run db:init              # Initialiser DB (script shell)
```

## 🔐 Administration

### Gestion Utilisateurs
```bash
# Scripts directs
node scripts/create-admin.js email@example.com    # Créer/promouvoir admin ⭐
node scripts/make-admin.js email@example.com      # Alternative admin

# Interface graphique
npm run db:studio                                 # GUI Prisma → Users

# SQL direct  
npx prisma db execute --stdin <<< "UPDATE users SET role='ADMIN' WHERE email='email@example.com';"
```

## 🧪 Tests de Sécurité

### Suite Complète
```bash
npm run security:all          # Tous les tests sécurité
npm run security:audit        # Guide audit externe
```

### Tests Individuels
```bash
npm run test:rate-limit        # Rate limiting (5 req/15min auth)
npm run test:security-headers  # Headers (CSP, HSTS, CSRF)  
npm run test:validation        # Validation Zod strict
npm run test:access-security   # Ownership & RBAC
npm run test:auth-security     # Protection account takeover
npm run test:webhook-race      # Race conditions webhooks
```

## 💳 Tests de Paiements

### Suite Complète
```bash
npm run test:payments          # Runner auto (serveur requis)
npm run test:payments:manual   # Suite manuelle
```

### Tests Individuels  
```bash
npm run test:payment-intent        # PaymentIntent logic
npm run test:payment-edge-cases    # Edge cases montants
npm run test:payment-security      # Validation montants serveur
npm run test:webhook-security      # Webhooks HMAC + idempotence
npm run test:payment-test-mode     # Mode test sécurisé
npm run test:webhook-integration   # Tests intégration API
```

## 📋 Tests Manuels (REST Client)

### Guides
```bash
npm run test:api              # Guide api-tests.http
npm run docs                  # Guide REST Client
```

### Fichiers Tests (.http)
```bash
# Dans VS Code avec extension REST Client
tests/api-tests.http               # Tests API généraux
tests/access-security.http         # Tests ownership
tests/rate-limiting.http          # Tests rate limit  
tests/security-headers.http       # Tests headers
tests/validation-malformed.http   # Payloads malveillants
```

## 🔧 Scripts Utilitaires

### Scripts Node Directs
```bash
node scripts/create-admin.js email@example.com    # Admin creator ⭐
node scripts/make-admin.js email@example.com      # Alternative admin
node scripts/test-runner.js                       # Test runner paiements
./scripts/init-db.sh                             # Init DB bash script
```

### Commandes Prisma Avancées
```bash
# Génération et Schema
npx prisma generate              # Générer client
npx prisma format               # Formater schema.prisma

# Migrations  
npx prisma migrate dev --name "description"    # Nouvelle migration
npx prisma migrate deploy                      # Appliquer en prod
npx prisma migrate reset                       # Reset DB (DANGER)

# Database
npx prisma db push                             # Push sans migration
npx prisma db seed                             # Seed data
npx prisma studio                              # Interface GUI

# Debug
npx prisma db execute --stdin <<< "SELECT * FROM users;"
npx prisma db execute --file query.sql
```

## 🚀 Workflows Recommandés

### Setup Initial Projet
```bash
1. git clone [repo]
2. npm install
3. cp .env.example .env
4. npm run db:init
5. node scripts/create-admin.js votre@email.com
6. npm run dev
```

### Développement Quotidien  
```bash
1. npm run dev                    # Démarrer
2. npm run db:studio             # Gérer données si besoin
3. [développer...]
4. npm run security:all          # Tests avant commit
5. git commit && git push
```

### Pré-Production Checklist
```bash
1. npm run build                 # Vérifier build
2. npm run security:all          # Tests sécurité 
3. npm run test:payments         # Tests paiements
4. npm run lint                  # Code quality
5. [Deploy to staging/prod]
```

### Debug & Maintenance
```bash
# Vérifier status
npm run db:studio               # Données
npm run test:auth-security      # Auth working?
npm run test:webhook-race       # Webhooks OK?

# Nettoyage
npx prisma db execute --stdin <<< "DELETE FROM sessions WHERE expires < NOW();"
npx prisma db execute --stdin <<< "UPDATE carts SET status='ABANDONED' WHERE updatedAt < NOW() - INTERVAL '30 days';"
```

## 📊 Monitoring & Stats

### Vérifications Régulières
```bash
# Users & Admins
npx prisma db execute --stdin <<< "SELECT email, role, createdAt FROM users WHERE role = 'ADMIN';"

# Commandes récentes  
npx prisma db execute --stdin <<< "SELECT id, status, totalAmount, createdAt FROM orders ORDER BY createdAt DESC LIMIT 10;"

# Stats générales
npx prisma db execute --stdin <<< "SELECT 'Users' as table_name, COUNT(*) FROM users UNION ALL SELECT 'Orders', COUNT(*) FROM orders;"
```

---

## 🔥 Commandes Favorites (TOP 10)

```bash
1. npm run dev                                    # Start dev
2. node scripts/create-admin.js votre@email.com  # Admin création
3. npm run db:studio                              # DB GUI
4. npm run security:all                           # Tests sécurité
5. npm run test:payments                          # Tests paiements  
6. npm run build                                  # Build prod
7. npm run db:push                                # Update DB schema
8. npx prisma migrate dev                         # Nouvelle migration
9. npm run test:auth-security                     # Test auth security
10. npm run lint                                  # Code quality
```

Cette référence contient **TOUTES** les commandes disponibles dans le projet !

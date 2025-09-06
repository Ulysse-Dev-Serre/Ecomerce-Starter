# Administration - Guide Pratique

## 🚀 Accès Rapide

### Créer un utilisateur admin (MÉTHODE SIMPLE)

```bash
# LA méthode que vous utilisiez avant (trouvée !)
node scripts/create-admin.js ulyssebo255@gmail.com

# Fonctionne avec n'importe quel email
node scripts/create-admin.js nimportequelle@email.com
```

### Autres méthodes admin

```bash
# Interface graphique
npm run db:studio
# → Users → Trouver email → Changer role → ADMIN

# Commande SQL directe
npx prisma db execute --stdin <<< "
UPDATE users SET role = 'ADMIN' WHERE email = 'ulyssebo255@gmail.com';"
```

### Commandes de base

```bash
# Démarrer le projet
npm run dev                    # Serveur développement
npm run build                  # Build production  
npm run start                  # Serveur production

# Base de données
npm run db:generate           # Générer client Prisma
npm run db:push              # Pousser schema vers DB
npm run db:studio            # Interface graphique DB
npm run db:init              # Initialiser DB complète
```

## 📊 Interface Admin

### Pages disponibles
- **Dashboard** : `/admin` - Métriques et KPIs
- **Produits** : `/admin/products` - Gestion catalogue
- **Commandes** : `/admin/orders` - Suivi commandes
- **Utilisateurs** : `/admin/users` - Gestion clients
- **Analytics** : `/admin/analytics` - Rapports détaillés

### Permissions par rôle
```
USER        → Profil + ses commandes
ADMIN       → Gestion produits/commandes/analytics  
SUPER_ADMIN → Accès total + gestion utilisateurs
```

## 🧪 Tests et Sécurité

### Tests de Sécurité (CRITIQUES)
```bash
# Suite sécurité complète (avant production)
npm run security:all          # Tous les tests sécurité

# Tests individuels  
npm run test:rate-limit        # Rate limiting endpoints
npm run test:security-headers  # Headers sécurité (CSP, HSTS)
npm run test:validation        # Validation Zod strict
npm run test:access-security   # Ownership & RBAC
npm run test:auth-security     # Protection account takeover
npm run test:webhook-race      # Race conditions webhooks
```

### Tests de Paiements (STRIPE)
```bash
# Suite paiements complète
npm run test:payments          # Runner automatique (serveur requis)

# Tests individuels Stripe
npm run test:payment-intent        # PaymentIntent logic
npm run test:payment-edge-cases    # Edge cases montants
npm run test:payment-security      # Validation montants serveur
npm run test:webhook-security      # Webhooks HMAC + idempotence
npm run test:payment-test-mode     # Mode test sécurisé
npm run test:webhook-integration   # Tests intégration API

# Tests manuels (pas besoin serveur)
npm run test:payments:manual       # Suite manuelle
```

### Tests Manuels (REST Client)
```bash
# Tests avec REST Client VS Code
npm run test:api              # Guide pour api-tests.http
npm run docs                  # Guide REST Client

# Fichiers disponibles dans tests/
# - api-tests.http            (tests généraux)
# - access-security.http      (ownership tests)  
# - rate-limiting.http        (rate limit tests)
# - security-headers.http     (headers tests)
# - validation-malformed.http (payload malveillants)
```

## 🔧 Configuration

### Variables d'environnement admin
```bash
# .env
NEXTAUTH_SECRET=your-secret-key
ADMIN_DEFAULT_EMAIL=ulyssebo255@gmail.com
ADMIN_NOTIFICATION_EMAIL=admin@yourstore.com
```

### Personnalisation
```bash
# Logo admin dans : public/images/branding/
# Couleurs dans : src/styles/admin.css
# Textes dans : src/lib/admin-config.ts
```

## 🚨 Dépannage

### Problèmes d'accès admin
```bash
# 1. Vérifier le rôle user
SELECT email, role FROM users WHERE email = 'votre@email.com';

# 2. Forcer le rôle admin
UPDATE users SET role = 'ADMIN' WHERE email = 'votre@email.com';

# 3. Vider le cache session
# → Se déconnecter/reconnecter
```

### Erreurs courantes
```bash
# "Unauthorized" → Rôle insuffisant  
# "Session expired" → Se reconnecter
# "Database error" → Vérifier DB_URL
# "403 Forbidden" → Vérifier NEXTAUTH_SECRET
```

## 📝 Maintenance

### Tâches régulières
```bash
# Nettoyage des sessions expirées
npm run db:cleanup-sessions

# Backup des données critiques  
npm run db:backup-orders
npm run db:backup-users

# Nettoyage des webhooks anciens
npm run webhooks:cleanup
```

### Monitoring admin
```bash
# Logs admin dans : logs/admin.log
# Métriques dans : /admin/analytics
# Alertes email configurables
```

## 📝 Scripts Disponibles

### Scripts Direct (Node)
```bash
# Administration
node scripts/create-admin.js email@example.com  # Créer/promouvoir admin ⭐
node scripts/make-admin.js email@example.com    # Alternative admin  
node scripts/test-runner.js                     # Runner tests paiements

# Initialisation
./scripts/init-db.sh                           # Init DB complète
```

### Commandes Prisma
```bash
# Client et Schema  
npx prisma generate          # Générer client
npx prisma db push          # Pousser schema (sans migration)
npx prisma studio           # Interface graphique
npx prisma migrate dev      # Créer migration
npx prisma migrate deploy   # Appliquer migrations prod

# Debug et maintenance
npx prisma db execute --stdin <<< "SELECT * FROM users;"
npx prisma format           # Formater schema.prisma
```

### Vérifications Pré-Production
```bash
# Checklist complète
npm run security:all && \
npm run test:payments && \
npm run lint && \
npm run build

# Test intégration (serveur requis)
npm run dev &               # Lancer serveur background
npm run test:webhook-integration
```

## 💡 Workflow Recommandé

### Développement
```bash
1. npm run dev              # Démarrer
2. npm run db:studio        # Gérer données  
3. node scripts/create-admin.js votre@email.com
4. npm run security:all     # Vérifier sécurité
```

### Avant Déploiement
```bash
1. npm run build            # Tester build
2. npm run security:all     # Tests sécurité
3. npm run test:payments    # Tests paiements
4. git commit && git push   # Déployer
```

Cette documentation contient **TOUTES** les commandes disponibles dans le projet pour une gestion complète.

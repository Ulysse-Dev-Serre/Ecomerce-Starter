# Développement Local

## Démarrage Rapide

```bash
# Installation
npm install

# Démarrer en développement
npm run dev

# Accéder à l'application
http://localhost:3000
```

## Configuration Environnement

### 1. Variables essentielles
Copier `.env.example` vers `.env` et configurer :

```env
# Base de données
DATABASE_URL="postgresql://..."

# NextAuth.js
NEXTAUTH_SECRET="votre-secret-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# Email (optionnel pour dev)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_FROM="noreply@example.com"
```

### 2. Services externes (optionnels)
- [Google OAuth](authentication/google-oauth.md)
- [Stripe](payments/stripe-setup.md)

## Structure de Développement

### Ports par défaut
- **Application** : http://localhost:3000
- **Base de données** : localhost:5432 (PostgreSQL)

### Commandes utiles
```bash
# Build production locale
npm run build

# Vérification types
npm run type-check

# Linting
npm run lint

# Tests
npm test
```

## Hot Reload

Le serveur de développement Next.js redémarre automatiquement lors de modifications :
- Pages et composants
- API routes
- Configuration

## Debug

### Console développeur
- Erreurs côté client dans le navigateur
- Network tab pour les requêtes API
- React DevTools pour les composants

### Logs serveur
```bash
# Logs détaillés
DEBUG=* npm run dev
```

## Base de Données Locale

### Migration
```bash
npx prisma migrate dev
npx prisma db seed
```

### Interface d'administration
```bash
npx prisma studio
```

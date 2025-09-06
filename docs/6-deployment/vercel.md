# Déploiement Vercel

## Corrections Appliquées

### ✅ Schema Prisma pour Vercel
```prisma
generator client {
  provider      = "prisma-client-js"
  output        = "../src/generated/prisma"
  binaryTargets = ["native", "debian-openssl-3.0.x"]  // CRUCIAL pour Vercel
}
```

### ✅ Script PostInstall
```json
{
  "scripts": {
    "postinstall": "prisma generate"  // Génère client Prisma sur Vercel
  }
}
```

### ✅ Configuration Runtime
Tous les routes API incluent :
```typescript
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'  // Empêche pre-render au build
```

### ✅ Next.config.ts
```typescript
const nextConfig = {
  turbopack: {},  // Remplace experimental.turbo
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  }
}
```

## Variables d'Environnement Vercel

### OBLIGATOIRES
Dans Vercel Dashboard → Settings → Environment Variables :

```env
DATABASE_URL="postgresql://username:password@host:5432/database"
NEXTAUTH_SECRET="un-secret-aleatoire-de-32-caracteres-minimum"
NEXTAUTH_URL="https://votre-projet.vercel.app"
```

### Génération NEXTAUTH_SECRET
```bash
# Générer un secret sécurisé
openssl rand -base64 32
# Ou
node -e "console.log(crypto.randomBytes(32).toString('base64'))"
```

## Variables Optionnelles

### Google OAuth
```env
GOOGLE_CLIENT_ID="123456789-abcdefg.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="ABCD-1234567890abcdefg"
```

### Stripe (Production)
```env
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Email (Production)
```env
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@your-domain.com"
```

## Base de Données Production

### PostgreSQL Recommandé
Services compatibles :
- **Vercel Postgres** (recommandé)
- **Neon** (serverless)
- **Supabase** (full-stack)
- **Railway** (simple)

### Vercel Postgres Setup
```bash
# Installer Vercel CLI
npm i -g vercel@latest

# Connecter projet
vercel link

# Créer base Postgres
vercel storage create postgres

# Récupérer URL
vercel env pull .env.local
```

### Migration Base Production
```bash
# Appliquer schéma en production
npx prisma db push

# Ou migration propre
npx prisma migrate deploy
```

## Configuration Domaine

### DNS Configuration
```
Type: CNAME
Name: www (ou votre sous-domaine)
Value: cname.vercel-dns.com
```

### Redirect Configuration
```typescript
// next.config.ts
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },
}
```

## Process de Déploiement

### 1. Préparation
```bash
# Vérifier build local
npm run build
npm run start

# Vérifier types
npm run type-check

# Tests avant déploiement
npm run test
```

### 2. Git et Déploiement
```bash
git add .
git commit -m "feat: production ready with Vercel fixes"
git push origin main
```

### 3. Variables sur Vercel
- Dashboard Vercel → Settings → Environment Variables
- Ajouter toutes les variables requises
- Redéployer si nécessaire

## Post-Déploiement

### Tests de Fonctionnement
1. **Authentication** : `/auth/signin` fonctionne
2. **API** : `/api/products` répond
3. **Database** : Pas d'erreurs Prisma dans logs
4. **Stripe** : Checkout en mode test fonctionne

### Monitoring
```typescript
// Ajouter dans pages/_app.tsx pour monitoring
if (process.env.NODE_ENV === 'production') {
  console.log('App deployed successfully on Vercel')
}
```

## Optimisations Production

### Performance
```typescript
// next.config.ts
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true,
  },
}
```

### Security Headers
```typescript
// middleware.ts pour headers sécurité
export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    )
  }
  
  return response
}
```

## Troubleshooting Vercel

### Build Failures

#### Prisma Client Error
```bash
# Error: Cannot find module '@prisma/client'
# Solution: Vérifier postinstall script
"postinstall": "prisma generate"
```

#### Memory Limits
```javascript
// next.config.ts - Augmenter limites
const nextConfig = {
  experimental: {
    isrMemoryCacheSize: 0,
  },
}
```

### Runtime Errors

#### Database Connection
```typescript
// Vérifier DATABASE_URL format
const db = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})
```

#### API Routes 404
```typescript
// Vérifier export runtime
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
```

### Logs et Debug

#### Vercel CLI Logs
```bash
# Voir logs en temps réel
vercel logs your-deployment-url

# Logs d'une function spécifique
vercel logs --function api/products
```

#### Debug Production
```typescript
// Logs conditionnels production
if (process.env.VERCEL) {
  console.log('Running on Vercel')
}
```

## Environment Branches

### Preview Deployments
- **main** → Production
- **develop** → Preview
- **feature/*** → Preview temporaire

### Variables par Environment
```bash
# Production
NEXTAUTH_URL="https://your-domain.com"

# Preview
NEXTAUTH_URL="https://your-project-git-develop.vercel.app"
```

## Custom Commands

### Package.json Scripts
```json
{
  "scripts": {
    "vercel:build": "prisma generate && next build",
    "vercel:dev": "vercel dev",
    "vercel:pull": "vercel env pull",
    "vercel:deploy": "vercel --prod"
  }
}
```

### Vercel.json (optionnel)
```json
{
  "buildCommand": "npm run vercel:build",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  }
}
```

## Backup et Restauration

### Database Backup
```bash
# Backup automatique (script)
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restauration
psql $DATABASE_URL < backup-20240301.sql
```

### Code Rollback
```bash
# Rollback vers version précédente
vercel rollback your-deployment-url

# Ou redéployer commit spécifique
git reset --hard commit-hash
git push --force
```

## Checklist Déploiement

- [ ] Build local réussit
- [ ] Variables environnement configurées
- [ ] Base de données accessible
- [ ] DNS configuré (si domaine custom)
- [ ] Tests passent en local
- [ ] Git push effectué
- [ ] Déploiement Vercel terminé
- [ ] Tests post-déploiement OK
- [ ] Monitoring activé

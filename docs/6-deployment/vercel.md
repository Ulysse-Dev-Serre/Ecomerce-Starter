# Déploiement Vercel

## 🚀 Déploiement Express (5 min)

### 1. Préparer le Repository
```bash
# Push sur GitHub/GitLab
git add .
git commit -m "ready for production"
git push origin main
```

### 2. Connecter à Vercel
```bash
# Option A : Interface web
# 1. https://vercel.com/new
# 2. Import Git Repository → Sélectionner votre repo
# 3. Deploy (Vercel détecte Next.js automatiquement)

# Option B : CLI Vercel
npx vercel --prod
```

### 3. Variables d'Environnement
```bash
# Dans Vercel Dashboard → Project → Settings → Environment Variables
DATABASE_URL=postgres://...          # Neon/PlanetScale/Railway
NEXTAUTH_URL=https://votre-app.vercel.app
NEXTAUTH_SECRET=your-production-secret
STRIPE_SECRET_KEY=sk_live_...       # Clés LIVE pour production
STRIPE_WEBHOOK_SECRET=whsec_...     # Endpoint webhook Vercel
```

## ⚙️ Configuration Production

### Schema Prisma (Requis)
```prisma
# prisma/schema.prisma
generator client {
  provider      = "prisma-client-js"
  output        = "../src/generated/prisma"
  binaryTargets = ["native", "debian-openssl-3.0.x"]  # CRUCIAL Vercel
}
```

### Package.json Scripts
```json
{
  "scripts": {
    "postinstall": "prisma generate",   # Auto-génère client Prisma
    "build": "prisma generate && next build",
    "start": "next start"
  }
}
```

### API Routes Configuration
```typescript
# Ajouter à TOUS les routes API
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'  # Évite cache Build
```

## 🗄️ Base de Données Production

### Options recommandées
```bash
# Neon (PostgreSQL managed)
DATABASE_URL="postgres://user:pass@ep-xxx.neon.tech/neondb"

# PlanetScale (MySQL managed)  
DATABASE_URL="mysql://user:pass@aws.connect.psdb.cloud/db?sslaccept=strict"

# Railway (PostgreSQL)
DATABASE_URL="postgres://user:pass@containers-us-west-xxx.railway.app:xxxx/db"
```

### Migration Production
```bash
# Une fois déployé sur Vercel
npx prisma migrate deploy     # Applique migrations en prod
npx prisma db seed           # Optionnel : données initiales
```

## 📧 Configuration Email

### Resend (Recommandé)
```bash
# Variables Vercel
EMAIL_FROM=noreply@votredomaine.com
RESEND_API_KEY=re_...

# DNS Records à ajouter
# TXT: "v=spf1 include:resend.com ~all"  
# CNAME: resend._domainkey → resend.com
```

### Alternative SMTP
```bash
EMAIL_SERVER=smtps://user:pass@smtp.gmail.com:465
EMAIL_FROM=your@gmail.com
```

## 🔒 Stripe Production

### Webhooks Endpoint
```bash  
# Dans Stripe Dashboard → Webhooks
Endpoint URL: https://votre-app.vercel.app/api/webhooks/stripe
Events: payment_intent.succeeded, payment_intent.payment_failed
```

### Test Webhooks  
```bash
# Tester depuis Stripe Dashboard
stripe listen --forward-to https://votre-app.vercel.app/api/webhooks/stripe
```

## 🛡️ Sécurité Production

### Variables critiques
```bash
# Générer secrets cryptographiquement sûrs
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Headers sécurité activés automatiquement
# CSP, HSTS, X-Frame-Options, etc.
```

### SSL/TLS
```bash
# Vercel gère automatiquement
✅ Certificat SSL gratuit
✅ HTTPS forcé  
✅ HTTP/2 enabled
✅ Edge caching CDN
```

## 📊 Monitoring Production

### Vercel Analytics  
```bash
# Activer dans Dashboard → Analytics
- Page views, performance
- Core Web Vitals
- Edge requests/errors
```

### Logs Application
```bash
# Voir logs temps réel
vercel logs --follow

# Logs par fonction
vercel logs --since=1h api/checkout
```

## 🚨 Troubleshooting

### Erreurs fréquentes
```bash
# 1. "PrismaClient not generated"  
Solution: Vérifier postinstall script + binaryTargets

# 2. "Environment variables not found"
Solution: Vérifier Variables dans Vercel Dashboard

# 3. "Database connection failed"
Solution: Vérifier DATABASE_URL + firewall DB

# 4. "Stripe webhook failed"  
Solution: Vérifier STRIPE_WEBHOOK_SECRET + endpoint URL
```

### Commandes debug
```bash
# Build local pour tester
npm run build
npm run start

# Check variables env
vercel env ls

# Redéployer après changements
vercel --prod
```

## 📋 Checklist Pré-Production

### Avant le launch ✅
- [ ] Variables d'environnement configurées  
- [ ] Base de données migrée
- [ ] Webhooks Stripe configurés
- [ ] Tests sécurité passants
- [ ] Domain personnalisé configuré (optionnel)
- [ ] Monitoring activé

### Après le launch ✅  
- [ ] Test paiement en live mode
- [ ] Vérifier webhooks reçus
- [ ] Monitoring erreurs 24h
- [ ] Performance audit
- [ ] SEO check

Votre e-commerce est prêt pour la production ! 🎉

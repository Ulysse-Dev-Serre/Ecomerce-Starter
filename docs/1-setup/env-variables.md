# ⚙️ Variables d'Environnement - Configuration Complète

> **Guide de configuration de toutes les variables d'environnement**

## 📋 Variables obligatoires

### 🗄️ **Base de données**
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```
**Source :** [Neon PostgreSQL](https://neon.tech) (recommandé)

### 🔐 **Authentification NextAuth**
```env
NEXTAUTH_SECRET="secret-aleatoire-32-caracteres-minimum"
NEXTAUTH_URL="http://localhost:3000"  # ou votre domaine production
```
**Génération secret :** `openssl rand -base64 32`

---

## 🔗 Variables OAuth (optionnelles)

### **Google OAuth**
```env
GOOGLE_CLIENT_ID="123456789-abcd.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="ABCD-1234567890"
```
**Configuration :** [Guide Google OAuth](/docs/1-setup/authentication/google-oauth.md)

### **Apple OAuth**  
```env
APPLE_ID="votre-apple-id"
APPLE_TEAM_ID="votre-team-id"
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----"
APPLE_KEY_ID="votre-key-id"
```

---

## 💳 Variables Stripe (paiements)

```env
# Clés publiques (visibles côté client)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Clés secrètes (serveur uniquement)  
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

**Configuration :** [Guide Paiements Stripe](/docs/1-setup/payments.md)

---

## 📧 Variables Email (optionnelles)

```env
EMAIL_SERVER="smtp://user:pass@smtp.gmail.com:587"
EMAIL_FROM="noreply@votre-domaine.com"
```

**Providers supportés :** Gmail, SendGrid, Mailgun, AWS SES

---

## 🛠️ Variables développement

### **Environnement**
```env
NODE_ENV="development"  # ou "production"
```

### **Mode test paiements**
```env
PAYMENTS_TEST_MODE="true"   # CRITICAL: false en production
```
**Sécurité :** Autorise cartId simulés uniquement en développement

---

## 📊 Variables par environnement

### **Développement local**
```env
# .env.local
DATABASE_URL="postgresql://localhost/ecommerce_dev"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
PAYMENTS_TEST_MODE="true"

# Stripe Test
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_dev_12345"
```

### **Production Vercel**
```env
# Variables Vercel Dashboard
DATABASE_URL="postgresql://prod-host/db"
NEXTAUTH_URL="https://votre-domaine.com"
NODE_ENV="production"
PAYMENTS_TEST_MODE="false"  # OBLIGATOIRE

# Stripe Live  
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# OAuth Production
GOOGLE_CLIENT_ID="prod-client-id"
GOOGLE_CLIENT_SECRET="prod-client-secret"
```

---

## 🔒 Sécurité des variables

### **Variables publiques** (NEXT_PUBLIC_*)
- ✅ Visibles côté client (browser)
- ✅ Peuvent être dans le code source
- ⚠️ Pas de secrets dedans

### **Variables secrètes**
- 🔒 Serveur uniquement
- 🔒 Jamais dans le code source
- 🔒 Chiffrées dans Vercel/GitHub

### **Validation production**
```bash
# Vérifier avant déploiement
grep -E "test|dev|local" .env
# Résultat vide attendu en production

# Variables critiques présentes
grep -E "DATABASE_URL|NEXTAUTH_SECRET|STRIPE_SECRET_KEY" .env
```

---

## 📝 Templates par provider

### **Neon PostgreSQL**
```env
DATABASE_URL="postgresql://user:pass@ep-xxx.c-1.us-east-1.aws.neon.tech/db?sslmode=require"
```

### **PlanetScale MySQL** 
```env
DATABASE_URL="mysql://user:pass@hostname/database?sslaccept=strict"
```

### **Supabase PostgreSQL**
```env
DATABASE_URL="postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres"
```

---

## 🧪 Variables de test

### **Tests automatisés**
```env
# Pas de vraies clés nécessaires
STRIPE_SECRET_KEY="sk_test_fake_for_unit_tests"
STRIPE_WEBHOOK_SECRET="whsec_test_12345"
DATABASE_URL="postgresql://localhost/ecommerce_test"
```

### **Cartes de test Stripe**
```bash
# Visa réussie
4242 4242 4242 4242

# Carte déclinée  
4000 0000 0000 0002

# 3D Secure requis
4000 0027 6000 3184
```

---

## 🔍 Debugging variables

```bash
# Vérifier variables chargées
node -e "console.log(process.env.DATABASE_URL ? 'DB OK' : 'DB manquante')"

# Liste variables Next.js
node -e "Object.keys(process.env).filter(k => k.includes('NEXT')).forEach(k => console.log(k))"

# Test connexion DB
npx prisma db push --accept-data-loss
```

---

## 📚 Ressources

- **[Variables NextAuth](https://next-auth.js.org/configuration/options#environment-variables)**
- **[Variables Stripe](https://stripe.com/docs/keys)**
- **[Variables Vercel](https://vercel.com/docs/concepts/projects/environment-variables)**
- **[Variables Neon](https://neon.tech/docs/connect/connection-string)**

---

**⚠️ Ne jamais commit de vraies clés dans le code source !**

Utilisez `.env.local` pour le développement et le dashboard provider pour la production.

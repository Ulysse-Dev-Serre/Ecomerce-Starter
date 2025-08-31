# ✅ Checklist Vercel - Déploiement E-commerce

## 🔧 Corrections appliquées

### ✅ 1. Schema Prisma pour Vercel
```prisma
generator client {
  provider      = "prisma-client-js"
  output        = "../src/generated/prisma"
  binaryTargets = ["native", "debian-openssl-3.0.x"]  # ← CRUCIAL pour Vercel
}
```

### ✅ 2. PostInstall script  
```json
{
  "scripts": {
    "postinstall": "prisma generate"  # ← Génère client Prisma sur Vercel
  }
}
```

### ✅ 3. Runtime configuration
Tous les routes API ont maintenant :
```typescript
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'  # ← Empêche pre-render au build
```

### ✅ 4. Next.config.ts corrigé
```typescript
turbopack: {}  # ← Remplace experimental.turbo
```

### ✅ 5. Dependencies nettoyées
- Plus de conflits peer dependencies
- Plus de problèmes avec swagger

## 🚀 Variables Vercel (OBLIGATOIRES)

Dans Vercel Dashboard → Settings → Environment Variables :

```env
DATABASE_URL=postgresql://username:password@host:5432/db
NEXTAUTH_SECRET=un-secret-aleatoire-de-32-caracteres-minimum
NEXTAUTH_URL=https://votre-projet.vercel.app
```

## 🔧 Variables optionnelles (pour OAuth)

```env
GOOGLE_CLIENT_ID=votre-google-client-id
GOOGLE_CLIENT_SECRET=votre-google-client-secret
APPLE_ID=votre-apple-service-id  
APPLE_SECRET=votre-apple-private-key
```

## 📦 Déploiement

```bash
git add .
git commit -m "Fix Prisma for Vercel deployment"
git push origin main
```

## 🎯 Test post-déploiement

1. **Auth fonctionne** : /auth/signin
2. **API répond** : /api/products
3. **Database connectée** : Pas d'erreurs Prisma

---

**Le projet devrait maintenant déployer parfaitement sur Vercel !** 🚀

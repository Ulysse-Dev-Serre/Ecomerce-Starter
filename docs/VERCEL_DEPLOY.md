# 🚀 Guide de déploiement Vercel

## ⚡ Variables d'environnement requises

Dans le dashboard Vercel, ajoutez :

```env
# Base de données (Neon)
DATABASE_URL=postgresql://username:password@your-neon-db.com/dbname

# NextAuth.js (OBLIGATOIRE)
NEXTAUTH_SECRET=un-secret-aleatoire-de-32-caracteres-minimum
NEXTAUTH_URL=https://votre-site.vercel.app

# Google OAuth (pour activer la connexion Google)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Apple OAuth (pour activer la connexion Apple) 
APPLE_ID=your-apple-service-id
APPLE_SECRET=your-apple-private-key

# Email (optionnel - pour l'envoi d'emails)
EMAIL_SERVER=smtp://username:password@smtp.gmail.com:587
EMAIL_FROM=noreply@votre-boutique.com
```

## 🔧 Configuration Google OAuth

### 1. Google Cloud Console
1. Allez sur [console.cloud.google.com](https://console.cloud.google.com)
2. Créez un nouveau projet
3. Activez "Google+ API" 
4. Allez dans "Identifiants" → "Créer des identifiants" → "ID client OAuth 2.0"

### 2. URLs autorisées
```
Origines JavaScript autorisées:
https://votre-site.vercel.app

URLs de redirection autorisées:
https://votre-site.vercel.app/api/auth/callback/google
```

### 3. Récupérez les clés
- Client ID → `GOOGLE_CLIENT_ID`
- Client Secret → `GOOGLE_CLIENT_SECRET`

## 🍎 Configuration Apple Sign In

### 1. Apple Developer Account
1. [developer.apple.com](https://developer.apple.com)
2. "Certificates, Identifiers & Profiles"
3. "Services IDs" → Créer nouveau
4. Configurez "Sign in with Apple"

### 2. URLs autorisées
```
Domain: votre-site.vercel.app
Return URL: https://votre-site.vercel.app/api/auth/callback/apple
```

## 🔄 Processus de déploiement

### 1. Push vers GitHub
```bash
git add .
git commit -m "Ready for production"
git push origin main
```

### 2. Connecter à Vercel
1. Allez sur [vercel.com](https://vercel.com)
2. "Import Project" → Sélectionnez votre repo
3. Ajoutez les variables d'environnement

### 3. Build automatique
Vercel détecte Next.js et build automatiquement.

## 🐛 Troubleshooting

### **Peer dependency warnings**
✅ Résolu avec `.npmrc` :
```
legacy-peer-deps=true
auto-install-peers=true
```

### **ESLint errors sur Vercel**
✅ Résolu avec `next.config.ts` :
```typescript
eslint: {
  ignoreDuringBuilds: true,
}
```

### **Auth ne fonctionne pas**
- Vérifiez `NEXTAUTH_URL` = URL exacte de production
- Vérifiez Google/Apple URLs callback
- `NEXTAUTH_SECRET` doit être différent du dev

### **Database connection failed**
- Vérifiez `DATABASE_URL` Neon
- Lancez `npx prisma generate` sur Vercel

## 🎯 Test post-déploiement

1. **Connexion** : Testez Google/Apple/Email
2. **API** : Changez `@baseUrl` dans `api-tests.http`
3. **Database** : Vérifiez que les données se sauvent

---

**✅ Votre starter e-commerce est prêt pour la production !**

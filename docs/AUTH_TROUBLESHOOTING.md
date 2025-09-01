# 🔧 Résolution des problèmes d'authentification

## ❌ Erreur "OAuthAccountNotLinked"

### **Cause**
Vous avez déjà un compte avec le même email (ex: via magic link) et vous essayez de vous connecter avec Google.

### **✅ Solution appliquée**
Ajouté `allowDangerousEmailAccountLinking: true` dans la configuration NextAuth pour permettre la liaison automatique des comptes par email.

### **⚠️ Sécurité**
Cette option est marquée "dangerous" car elle permet à quelqu'un qui contrôle un email de prendre le contrôle d'un compte OAuth existant. Pour un e-commerce, c'est généralement acceptable car l'email est l'identifiant principal.

## 🔄 Comment tester maintenant

### **1. Redémarrez le serveur**
```bash
npm run dev
```

### **2. Testez la connexion Google**
1. Allez sur http://localhost:3000/auth/signin
2. Cliquez "Se connecter avec Google"
3. Choisissez votre compte Google
4. ✅ Vous devriez être connecté automatiquement

### **3. Vérifiez la liaison**
- Votre compte existant (magic link) est maintenant lié à Google
- L'avatar Google s'affiche dans la navbar
- Les données du panier sont conservées

## 🛠️ Autres problèmes possibles

### **Google OAuth non configuré**
```
Erreur: client_id is required
```
**Solution :** Vérifiez que `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` sont dans `.env`

### **URL callback non autorisée**
```
Erreur: redirect_uri_mismatch
```
**Solution :** Ajoutez `http://localhost:3000/api/auth/callback/google` dans Google Cloud Console

### **Écran de consentement non configuré**
```
Erreur: access_blocked
```
**Solution :** Configurez l'écran de consentement OAuth dans Google Cloud Console

## 🎯 Configuration production

Pour Vercel, ajoutez dans les variables d'environnement :
```env
NEXTAUTH_URL=https://votre-site.vercel.app
GOOGLE_CLIENT_ID=votre-client-id
GOOGLE_CLIENT_SECRET=votre-client-secret
```

Et dans Google Cloud Console, ajoutez :
```
https://votre-site.vercel.app/api/auth/callback/google
```

## ✅ Test final

Après ces corrections :
- ✅ Magic link fonctionne toujours
- ✅ Google OAuth fonctionne  
- ✅ Comptes se lient automatiquement
- ✅ Avatar et données conservées

---

**🎯 L'authentification devrait maintenant être 100% fonctionnelle !**

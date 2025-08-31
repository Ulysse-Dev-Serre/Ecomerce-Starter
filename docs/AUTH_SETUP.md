# 🔐 Configuration de l'authentification

## ⚡ Démarrage rapide (fonctionne immédiatement)

L'auth par **email** fonctionne en mode développement sans configuration !

### Ajoutez à votre `.env` :
```env
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### Test immédiat :
1. Allez sur http://localhost:3000/auth/signin
2. Entrez votre email  
3. Cliquez "Se connecter par email"
4. **En développement** : Le lien apparaît dans les logs du serveur
5. Copiez/collez le lien dans votre navigateur

## 🔧 Configuration Google OAuth (optionnel)

### 1. Créer projet Google Cloud
1. Allez sur [Google Cloud Console](https://console.cloud.google.com)
2. Créez un nouveau projet
3. Activez "Google+ API"
4. Créez des identifiants OAuth 2.0

### 2. Configurer les URLs autorisées
```
Origines JavaScript autorisées:
http://localhost:3000
https://votre-domaine.com

URLs de redirection autorisées:  
http://localhost:3000/api/auth/callback/google
https://votre-domaine.com/api/auth/callback/google
```

### 3. Ajouter à `.env`
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 🍎 Configuration Apple Sign In (optionnel)

### 1. Apple Developer Account
1. Allez sur [Apple Developer](https://developer.apple.com)
2. Créez un App ID
3. Configurez "Sign In with Apple"

### 2. Ajouter à `.env`
```env
APPLE_ID=your-apple-service-id
APPLE_SECRET=your-apple-private-key
```

## 📧 Configuration Email en production

Pour l'envoi d'emails en production, ajoutez :

```env
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@votre-boutique.com
```

## 🔄 Workflow d'authentification

### **Mode développement (email)**
1. User entre son email
2. Lien affiché dans console serveur
3. User clique le lien → connecté

### **Mode production (email + OAuth)**
1. User clique "Google" → OAuth flow
2. Ou user entre email → email envoyé
3. User clique lien email → connecté

## 🎯 Fonctionnalités disponibles

### **Après connexion**
- Avatar utilisateur dans navbar
- Panier persistant lié au compte
- Historique des commandes
- Adresses sauvegardées

### **Composants prêts**
- `<AuthButton />` - Bouton connexion/avatar
- `<Navbar />` - Navigation avec auth
- Page signin personnalisable
- Protection routes (TODO)

## 🔒 Sécurité

### **En développement**
- Secret par défaut OK
- Email local dans logs

### **En production**
- ✅ Changez `NEXTAUTH_SECRET`
- ✅ Configurez SMTP réel  
- ✅ HTTPS obligatoire
- ✅ URLs callback sécurisées

## 🚀 Déploiement

### **Vercel (recommandé)**
```bash
# Variables d'environnement dans Vercel dashboard
NEXTAUTH_SECRET=random-secret-32-chars
NEXTAUTH_URL=https://votre-boutique.vercel.app
DATABASE_URL=your-neon-db-url
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

## 🎨 Personnalisation par niche

### **Boutique mode**
- Google + Instagram OAuth
- Connexion rapide pour achats impulsifs

### **Boutique B2B** 
- Email professionnel obligatoire
- Validation comptes entreprise

### **Boutique internationale**
- Multi-providers selon région
- Localisation auth pages

---

**🎯 Objectif :** Auth simple et réutilisable pour toutes vos boutiques !

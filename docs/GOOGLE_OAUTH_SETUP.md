# 🔑 Configuration Google OAuth - Guide complet

## 🎯 Objectif
Activer la connexion "Se connecter avec Google" dans votre e-commerce starter.

## 📋 Étapes de configuration

### 1. **Google Cloud Console**
1. Allez sur [console.cloud.google.com](https://console.cloud.google.com)
2. Créez un nouveau projet ou sélectionnez un existant
3. Dans la barre de recherche, tapez "Google+ API" et activez-la

### 2. **Créer les identifiants OAuth**
1. Allez dans **API et Services** → **Identifiants**
2. Cliquez **Créer des identifiants** → **ID client OAuth 2.0**
3. Type d'application : **Application Web**

### 3. **Configurer les URLs autorisées**

#### **Origines JavaScript autorisées :**
```
http://localhost:3000
http://localhost:3001
https://votre-site.vercel.app
```

#### **URIs de redirection autorisées :**
```
http://localhost:3000/api/auth/callback/google
http://localhost:3001/api/auth/callback/google  
https://votre-site.vercel.app/api/auth/callback/google
```

### 4. **Récupérer les clés**
Après création, Google vous donne :
- **Client ID** (publique) 
- **Client Secret** (secret)

## 🔧 Configuration dans votre projet

### **Fichier .env local**
Ajoutez ces lignes à votre `.env` :
```env
# Google OAuth (remplacez par vos vraies valeurs)
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=ABCD-1234567890abcdefghijk
```

### **Variables Vercel (production)**
Dans Vercel Dashboard → Settings → Environment Variables :
```env
GOOGLE_CLIENT_ID=votre-client-id-google
GOOGLE_CLIENT_SECRET=votre-client-secret-google
```

## 🧪 Test de fonctionnement

### **Développement local**
1. Redémarrez : `npm run dev`
2. Allez sur http://localhost:3000/auth/signin  
3. Le bouton "Se connecter avec Google" devrait maintenant fonctionner
4. Cliquez → Redirection Google → Retour avec session

### **Production Vercel**
1. Déployez avec les variables d'environnement
2. Testez sur votre URL Vercel
3. Vérifiez que l'URL callback est bien autorisée

## 🔒 Écran de consentement OAuth

Si c'est votre première fois :

### **Configuration écran de consentement**
1. **API et Services** → **Écran de consentement OAuth**
2. Type d'utilisateur : **Externe** (pour test) ou **Interne** (domaine G Suite)
3. Remplissez les informations de base :
   - Nom de l'application : "Ma Boutique E-commerce"
   - Email support utilisateur : votre email
   - Logo (optionnel)

### **Domaines autorisés**
```
localhost
votre-domaine.com
vercel.app
```

## 🛠️ Debugging

### **Erreur "client_id is required"**
→ Vérifiez que `GOOGLE_CLIENT_ID` est bien défini

### **Erreur "redirect_uri_mismatch"**  
→ Vérifiez que l'URL callback est identique dans Google Console

### **Erreur "access_blocked"**
→ Configurez l'écran de consentement ou ajoutez votre email en test

## 🎨 Personnalisation du bouton

Le bouton Google est déjà stylé dans [`src/app/auth/signin/page.tsx`](file:///home/ulbo/Dev/ecommerce-starter/src/app/auth/signin/page.tsx) avec :
- Logo Google officiel
- Couleurs Google (blanc + texte gris)
- Hover effects

## ✅ Checklist finale

- [ ] Projet Google Cloud créé
- [ ] Google+ API activée
- [ ] Identifiants OAuth créés
- [ ] URLs callback configurées
- [ ] Variables .env ajoutées
- [ ] Test local réussi
- [ ] Variables Vercel configurées  
- [ ] Test production réussi

---

**🎯 Une fois configuré, vos utilisateurs pourront se connecter en 1 clic avec Google !**

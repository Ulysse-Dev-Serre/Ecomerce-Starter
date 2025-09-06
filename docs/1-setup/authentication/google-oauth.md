# Configuration Google OAuth

## Configuration Google Cloud Console

### 1. Créer le projet
1. Allez sur [console.cloud.google.com](https://console.cloud.google.com)
2. Créez un nouveau projet ou sélectionnez un existant
3. Activez l'API Google+ dans la barre de recherche

### 2. Créer les identifiants OAuth
1. **API et Services** → **Identifiants**
2. **Créer des identifiants** → **ID client OAuth 2.0**
3. Type : **Application Web**

### 3. URLs autorisées

**Origines JavaScript :**
```
http://localhost:3000
https://votre-site.vercel.app
```

**URIs de redirection :**
```
http://localhost:3000/api/auth/callback/google
https://votre-site.vercel.app/api/auth/callback/google
```

## Configuration Projet

### Variables d'environnement
```env
# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=ABCD-1234567890abcdefghijk
```

### Test local
1. Redémarrez : `npm run dev`
2. Allez sur `/auth/signin`
3. Testez le bouton Google

## Écran de Consentement OAuth

### Configuration
1. **API et Services** → **Écran de consentement OAuth**
2. Type : **Externe** (test) ou **Interne** (G Suite)
3. Informations :
   - Nom : "Ma Boutique E-commerce"
   - Email support : votre email

### Domaines autorisés
```
localhost
votre-domaine.com
vercel.app
```

## Résolution de Problèmes

| Erreur | Solution |
|--------|----------|
| `client_id is required` | Vérifier `GOOGLE_CLIENT_ID` |
| `redirect_uri_mismatch` | URL callback identique dans Console |
| `access_blocked` | Configurer écran de consentement |

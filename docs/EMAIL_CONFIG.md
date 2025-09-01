# 📧 Configuration d'envoi d'emails réels

## 🎯 Objectif
Envoyer de vrais emails de connexion au lieu d'afficher les liens dans la console.

## ⚡ Configuration Gmail (recommandée)

### **1. Activer l'authentification à 2 facteurs**
1. Allez sur [myaccount.google.com](https://myaccount.google.com)
2. Sécurité → Authentification à 2 facteurs → Activer

### **2. Créer un mot de passe d'application**
1. Sécurité → Authentification à 2 facteurs 
2. **Mots de passe des applications** → Sélectionner app → **Autre**
3. Nom : "E-commerce Starter"
4. **Copiez le mot de passe généré** (16 caractères)

### **3. Ajouter à votre .env**
```env
# Configuration email Gmail
EMAIL_SERVER=smtp://votre-email@gmail.com:MOT-DE-PASSE-APP@smtp.gmail.com:587
EMAIL_FROM=votre-email@gmail.com

# Ou format détaillé :
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=votre-email@gmail.com
EMAIL_SERVER_PASSWORD=MOT-DE-PASSE-APP-16-CHARS
EMAIL_FROM=votre-email@gmail.com
```

## 🔧 Autres fournisseurs d'emails

### **Outlook/Hotmail**
```env
EMAIL_SERVER=smtp://votre-email@outlook.com:mot-de-passe@smtp-mail.outlook.com:587
EMAIL_FROM=votre-email@outlook.com
```

### **Services professionnels (SendGrid, Mailgun)**
```env
# SendGrid
EMAIL_SERVER=smtp://apikey:SG.votre-api-key@smtp.sendgrid.net:587
EMAIL_FROM=noreply@votre-domaine.com

# Mailgun  
EMAIL_SERVER=smtp://postmaster@mg.votre-domaine.com:votre-password@smtp.mailgun.org:587
EMAIL_FROM=noreply@votre-domaine.com
```

## 🧪 Test de fonctionnement

### **1. Redémarrez le serveur**
```bash
npm run dev
```

### **2. Testez l'envoi**
1. Allez sur `/auth/signin`
2. Entrez votre email
3. Cliquez "Recevoir un lien par email"
4. ✅ **Vérifiez votre boîte mail** (inbox + spam)

### **3. Mode développement sans config**
Si EMAIL_SERVER n'est pas configuré :
- Le lien s'affiche dans la console (comme avant)
- Notification jaune explique la situation

## 🎨 Template d'email personnalisable

L'email envoyé contient :
- Logo de votre boutique
- Bouton de connexion stylé
- Message de sécurité
- Design responsive

Personnalisez dans [`src/app/api/auth/[...nextauth]/route.ts`](file:///home/ulbo/Dev/ecommerce-starter/src/app/api/auth/[...nextauth]/route.ts) ligne 45+

## 🔒 Sécurité

### **Bonnes pratiques**
- ✅ Utilisez un mot de passe d'application (pas votre mot de passe principal)
- ✅ Configurez EMAIL_FROM avec votre domaine en production
- ✅ Les liens expirent automatiquement (24h)

### **En production**
```env
EMAIL_SERVER=smtp://noreply@votre-boutique.com:password@smtp.votre-host.com:587
EMAIL_FROM=noreply@votre-boutique.com
```

## ✅ Résultat final

Après configuration :
- ✅ **Google OAuth** fonctionne (1 clic)
- ✅ **Email/Password** fonctionne (inscription + connexion)
- ✅ **Magic Link** par email réel
- ✅ **Design professionnel** style Shopify

---

**🎯 Votre e-commerce aura une authentification niveau production !**

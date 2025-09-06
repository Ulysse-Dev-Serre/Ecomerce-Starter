# Vue d'ensemble Authentification

## Méthodes Disponibles

### 1. Magic Link Email
Connexion sans mot de passe via lien sécurisé.

### 2. Google OAuth
Connexion en 1 clic avec compte Google.

### 3. Email + Mot de Passe
Méthode traditionnelle avec credentials.

## Fonctionnalités

### Avatar Intelligent
- Image Google ou initiales colorées
- Gestion d'erreur de chargement
- Utilisé dans Navbar et Profile

### Workflow Utilisateur

**Nouveau visiteur :**
1. Boutique → Ajouter produit → Redirection connexion
2. Connexion → Retour boutique automatique
3. Panier fonctionnel avec toast notifications

**Utilisateur connecté :**
1. Ajout direct au panier
2. Compteur temps réel dans navbar
3. Avatar → Profil avec historique

## États et Sécurité

- Session persistante entre visites
- Redirection intelligente après connexion
- Protection des routes sensibles
- Tokens sécurisés côté serveur

## Configuration Requise

Voir les guides spécifiques :
- [Google OAuth](google-oauth.md)
- [Variables d'environnement](../env-variables.md)

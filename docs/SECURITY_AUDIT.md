# Audit de Sécurité API - Contrôle d'Accès aux Ressources

## 🔒 Problème identifié

Les routes API avec paramètres dynamiques `[userId]` et `[id]` n'effectuaient aucune vérification d'autorisation, permettant à un utilisateur connecté d'accéder aux données de n'importe quel autre utilisateur en modifiant simplement l'URL.

## ✅ Corrections appliquées

### Routes sécurisées

| Route | Contrôles ajoutés |
|-------|-------------------|
| `GET /api/cart/[userId]` | ✅ Vérifie `session.user.id === userId` |
| `POST /api/cart/[userId]` | ✅ Vérifie `session.user.id === userId` |
| `DELETE /api/cart/[userId]/[itemId]` | ✅ Vérifie `session.user.id === userId` |
| `PATCH /api/cart/[userId]/[itemId]` | ✅ Vérifie `session.user.id === userId` |
| `GET /api/users/[id]` | ✅ Vérifie `session.user.id === id` |
| `PUT /api/users/[id]` | ✅ Vérifie `session.user.id === id` |
| `POST /api/users/[id]/addresses` | ✅ Vérifie `session.user.id === id` |
| `GET /api/users/[id]/orders` | ✅ Vérifie `session.user.id === id` |
| `GET /api/orders/[id]` | ✅ Vérifie `order.userId === session.user.id` |

### Codes de retour standardisés

- **401 Unauthorized** : Utilisateur non connecté
- **403 Forbidden** : Utilisateur connecté mais tentative d'accès aux données d'autrui
- **404 Not Found** : Ressource n'existe pas (après vérification de propriété)

### Exemples de protection

```typescript
// Security check standard appliqué partout
const session = await getServerSession()
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
}

if (session.user.id !== userId) {
  return NextResponse.json({ 
    error: 'Accès refusé - vous ne pouvez accéder qu\'à vos propres données' 
  }, { status: 403 })
}
```

## 🛡️ Sécurité garantie

**AVANT** : Un utilisateur pouvait faire :
- `GET /api/cart/autre-user-id` → ✅ Accès au panier de quelqu'un d'autre
- `PUT /api/users/autre-user-id` → ✅ Modification du profil de quelqu'un d'autre
- `GET /api/orders/ordre-dun-autre` → ✅ Accès aux commandes d'autrui

**APRÈS** : Toutes ces tentatives retournent `403 Forbidden` avec message explicite.

## 🔍 Tests de sécurité recommandés

```bash
# Test 1: Accès au panier d'autrui (doit retourner 403)
curl -H "Authorization: Bearer TOKEN_USER_A" /api/cart/USER_B_ID

# Test 2: Modification du profil d'autrui (doit retourner 403)
curl -X PUT -H "Authorization: Bearer TOKEN_USER_A" /api/users/USER_B_ID

# Test 3: Accès aux commandes d'autrui (doit retourner 403)
curl -H "Authorization: Bearer TOKEN_USER_A" /api/users/USER_B_ID/orders
```

## 📋 Exceptions légitimes

### Routes publiques (pas de vérification nécessaire)
- `/api/products/*` - Catalogue public
- `/api/categories/*` - Catégories publiques

### Routes admin (vérification de rôle ADMIN)
- `/api/admin/*` - Déjà sécurisées avec middleware admin

### Routes système
- `/api/auth/*` - Gestion d'authentification NextAuth.js

## ⚠️ Points d'attention futurs

1. **Nouvelles routes** : Toujours ajouter les vérifications d'autorisation
2. **Tests automatisés** : Implémenter des tests de sécurité
3. **Audit régulier** : Vérifier périodiquement les nouvelles routes
4. **Rate limiting** : Considérer l'ajout de limitations par IP/utilisateur

Cette correction élimine une faille de sécurité critique qui aurait pu permettre l'accès non autorisé aux données sensibles des utilisateurs.

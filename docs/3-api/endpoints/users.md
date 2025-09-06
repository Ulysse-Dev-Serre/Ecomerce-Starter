# API Utilisateurs

## Endpoints Disponibles

### `GET /api/users/profile`
Récupère le profil de l'utilisateur authentifié.

**Authentification requise** 🔒

**Réponse:**
```json
{
  "success": true,
  "data": {
    "id": "clm...",
    "email": "user@example.com",
    "name": "John Doe",
    "image": "https://lh3.googleusercontent.com/...",
    "role": "USER",
    "createdAt": "2024-01-15T10:00:00Z",
    "addresses": [
      {
        "id": "clm...",
        "street": "123 Main St",
        "city": "Montreal",
        "zipCode": "H1A 1A1",
        "country": "CA",
        "isDefault": true,
        "type": "SHIPPING"
      }
    ]
  }
}
```

### `PUT /api/users/profile`
Met à jour le profil de l'utilisateur.

**Authentification requise** 🔒

**Body:**
```json
{
  "name": "John Smith",
  "phone": "+1-555-0123"
}
```

### `POST /api/users`
Crée un nouvel utilisateur (inscription).

**Body:**
```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "password": "securePassword123"
}
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "id": "clm...",
    "email": "newuser@example.com",
    "name": "New User"
  },
  "message": "User created successfully"
}
```

## Adresses Utilisateur

### `GET /api/users/addresses`
Liste les adresses de l'utilisateur.

**Authentification requise** 🔒

### `POST /api/users/addresses`
Ajoute une nouvelle adresse.

**Authentification requise** 🔒

**Body:**
```json
{
  "street": "456 Oak Ave",
  "city": "Toronto",
  "state": "ON",
  "zipCode": "M5V 1A1",
  "country": "CA",
  "type": "BILLING",
  "isDefault": false
}
```

### `PUT /api/users/addresses/[id]`
Met à jour une adresse existante.

**Authentification requise** 🔒

### `DELETE /api/users/addresses/[id]`
Supprime une adresse.

**Authentification requise** 🔒

## Gestion des Adresses

### Types d'adresse
- `SHIPPING` : Adresse de livraison
- `BILLING` : Adresse de facturation
- `BOTH` : Adresse mixte

### Règles
- Une seule adresse par défaut par type
- Minimum une adresse pour passer commande
- Validation des formats selon le pays

### Pays supportés
```json
{
  "CA": {
    "name": "Canada",
    "zipFormat": "A1A 1A1",
    "states": ["AB", "BC", "ON", "QC", ...]
  },
  "US": {
    "name": "United States", 
    "zipFormat": "12345",
    "states": ["AL", "AK", "AZ", ...]
  }
}
```

## Rôles et Permissions

### Rôles disponibles
- `USER` : Utilisateur standard
- `ADMIN` : Administrateur
- `SUPER_ADMIN` : Super administrateur

### Permissions par rôle

| Action | USER | ADMIN | SUPER_ADMIN |
|--------|------|-------|-------------|
| Voir profil | ✅ | ✅ | ✅ |
| Modifier profil | ✅ | ✅ | ✅ |
| Voir toutes commandes | ❌ | ✅ | ✅ |
| Modifier produits | ❌ | ✅ | ✅ |
| Gérer utilisateurs | ❌ | ❌ | ✅ |

## Historique Commandes

### `GET /api/users/orders`
Récupère l'historique des commandes.

**Authentification requise** 🔒

**Query parameters:**
- `page` : Numéro de page
- `status` : Filtrer par statut

**Réponse:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clm...",
      "orderNumber": "ORD-20240301-001",
      "status": "DELIVERED",
      "totalAmount": 1998.00,
      "createdAt": "2024-03-01T10:00:00Z",
      "itemsCount": 3
    }
  ],
  "metadata": {
    "total": 12,
    "page": 1
  }
}
```

## Validation des Données

### Email
- Format email valide
- Unicité en base de données
- Vérification domaine

### Mot de passe (si utilisé)
- Minimum 8 caractères
- Au moins 1 majuscule
- Au moins 1 chiffre
- Au moins 1 caractère spécial

### Nom
- Entre 2 et 50 caractères
- Pas de caractères spéciaux dangereux
- Trim automatique

## Gestion d'Erreurs

### Email déjà utilisé
```json
{
  "success": false,
  "error": "Email already registered",
  "code": "EMAIL_EXISTS"
}
```

### Adresse par défaut requise
```json
{
  "success": false,
  "error": "Cannot delete default address",
  "code": "DEFAULT_ADDRESS_REQUIRED"
}
```

### Données invalides
```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": "Invalid email format",
    "name": "Name is required"
  }
}
```

## Sécurité

### Protection des données
- Pas de mots de passe en réponse
- Champs sensibles filtrés
- Rate limiting sur création

### Session management
- JWT tokens sécurisés
- Expiration automatique
- Révocation possible

### Privacy
- RGPD compliant
- Droit à l'oubli
- Export des données

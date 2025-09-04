# Interface d'Administration

L'interface d'administration permet aux utilisateurs ayant le rôle `ADMIN` de gérer les produits, catégories et commandes de la boutique.

## Accès à l'administration

### Créer un utilisateur admin

```bash
# Créer un admin avec l'email par défaut (admin@test.com)
node scripts/create-admin.js

# Ou avec un email spécifique
node scripts/create-admin.js votre@email.com
```

### Connexion

1. Connectez-vous normalement via `/auth`
2. Si vous avez le rôle `ADMIN`, un lien "Admin" apparaît dans la navbar
3. Accédez à `/admin` pour le dashboard d'administration

## Fonctionnalités

### ✅ Implémenté

- **Dashboard admin** (`/admin`) - Vue d'ensemble
- **Gestion des produits** (`/admin/products`)
  - Liste des produits existants
  - Formulaire multi-étapes d'ajout de produit
    - ✅ Étape 1: Informations de base (nom, description, traductions)
    - ✅ Étape 2: Variantes (SKU, prix, stock)
    - 🚧 Étape 3: Médias (à compléter)
    - 🚧 Étape 4: Catégories (à compléter)
    - ✅ Étape 5: Prévisualisation
- **Middleware de sécurité** - Vérification du rôle ADMIN
- **API endpoints** sécurisés pour les opérations CRUD

### 🚧 En cours de développement

- Upload d'images pour les produits
- Gestion des catégories
- Gestion des commandes
- Interface de gestion des variantes avancées

### 📋 Prochaines étapes

- Système d'upload d'images (Cloudinary/AWS S3)
- Éditeur WYSIWYG pour les descriptions
- Gestion des attributs produits (couleur, taille, etc.)
- Export/Import en masse
- Statistiques et analytics

## Structure des fichiers

```
src/
├── app/admin/                 # Pages d'administration
│   ├── layout.tsx            # Layout commun admin
│   ├── page.tsx              # Dashboard
│   ├── products/
│   │   ├── page.tsx          # Liste des produits
│   │   └── add/page.tsx      # Formulaire d'ajout
│   ├── categories/page.tsx   # Gestion des catégories
│   └── orders/page.tsx       # Gestion des commandes
│
├── app/api/admin/            # API admin sécurisées
│   ├── check-role/route.ts   # Vérification rôle
│   ├── products/route.ts     # CRUD produits
│   └── categories/route.ts   # CRUD catégories
│
└── lib/auth-admin.ts         # Middleware sécurité admin
```

## Sécurité

- Toutes les pages admin nécessitent le rôle `ADMIN`
- Redirection automatique vers `/auth` si non connecté
- Redirection vers `/` si rôle insuffisant
- Validation des données avec Zod
- Protection CSRF intégrée

## Base de données

L'interface admin utilise le schéma Prisma complet avec support :
- **Multilingue** : Traductions FR/EN pour produits et catégories
- **Variantes** : SKU, prix, stock par variante
- **Médias** : Images et vidéos par variante
- **Attributs** : Couleur, taille, matériau, etc.
- **Catégories** : Classification hiérarchique
- **Soft delete** : Suppression logique avec `deletedAt`

## API Endpoints

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/admin/check-role` | GET | Vérifier si l'utilisateur est admin |
| `/api/admin/products` | GET | Liste des produits avec pagination |
| `/api/admin/products` | POST | Créer un nouveau produit |
| `/api/admin/categories` | GET | Liste des catégories |

## Utilisation

1. **Créer un admin** : `node scripts/create-admin.js admin@test.com`
2. **Se connecter** avec cet email
3. **Accéder à `/admin`** via le lien dans la navbar
4. **Ajouter des produits** via "Gestion des Produits" > "Ajouter un produit"

Le formulaire multi-étapes guide l'utilisateur pour créer des produits complets avec traductions, variantes, et métadonnées.

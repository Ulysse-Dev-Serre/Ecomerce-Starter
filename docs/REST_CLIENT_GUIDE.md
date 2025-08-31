# 🧪 Guide REST Client pour E-commerce API

## 📋 Prérequis

1. **Installer REST Client extension** dans VS Code
2. **Lancer le serveur** : `npm run dev`
3. **Créer des données de test** : Exécuter le premier endpoint du fichier

## 📁 Fichier de tests

**Fichier principal :** [`api-tests.http`](file:///home/ulbo/Dev/ecommerce-starter/api-tests.http)

## 🚀 Comment utiliser

### 1. Ouvrir le fichier de tests
```bash
# Dans VS Code
code api-tests.http
```

### 2. Cliquer sur "Send Request" 
- Chaque `###` sépare une requête
- Cliquez sur le lien "Send Request" au-dessus de chaque requête
- Les résultats s'affichent dans un onglet séparé

### 3. Workflow recommandé
1. **Créer données de test** → `POST /test-data`
2. **Récupérer les IDs** → Noter les IDs retournés
3. **Remplacer les variables** → Modifier `@testUserId` etc.
4. **Tester le workflow** → User → Cart → Order

## 🔧 Variables disponibles

```http
@baseUrl = http://localhost:3000/api
@testUserId = cm5abc123           # ID utilisateur de test
@testVariantId = cm5var456        # ID variante de test
@workflowUserId = REMPLACER       # Workflow complet
```

## 📊 Sections de tests

### 🧪 Données de test
- Crée produits, catégories, utilisateur demo

### 👤 Users (Utilisateurs)
- Créer, récupérer, modifier utilisateur
- Ajouter adresses

### 📂 Categories (Catégories)
- Liste catégories multilingue
- Détail catégorie avec produits

### 🛍️ Products (Produits)
- Liste produits multilingue
- Recherche textuelle
- Détail produit

### 🛒 Cart (Panier)
- Récupérer panier actif
- Ajouter produits
- Gestion quantités

### 📦 Orders (Commandes)
- Créer commande depuis panier
- Récupérer commande
- Modifier statut
- Historique utilisateur

### ❌ Tests d'erreur
- Validation des données
- Gestion des cas d'erreur
- Ressources inexistantes

### 🌍 Tests multilingues
- Support EN/FR/ES/DE/IT
- Traductions produits/catégories

## 💡 Astuces REST Client

### Copier curl depuis 
```http
# Si vous avez une commande curl, convertissez-la :
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Devient :
POST http://localhost:3000/api/users
Content-Type: application/json

{
  "email": "test@example.com"
}
```

### Variables dynamiques
```http
# Utiliser le résultat d'une requête dans la suivante
@userId = {{createUser.response.body.data.id}}
```

### Environnements multiples
```http
# Variables par environnement
@baseUrl = {{$dotenv NODE_ENV=development http://localhost:3000/api}}
@baseUrl = {{$dotenv NODE_ENV=production https://myapp.com/api}}
```

## 🎯 Workflow de test complet

1. **Setup** : `POST /test-data`
2. **User** : `POST /users` → Noter l'ID
3. **Address** : `POST /users/{id}/addresses`
4. **Products** : `GET /products` → Noter un variantId
5. **Cart** : `POST /cart/{userId}` avec variantId
6. **Order** : `POST /orders` avec addresses
7. **Verify** : `GET /orders/{orderId}`

## 🔍 Debug et validation

- **Response times** visibles pour chaque requête
- **Status codes** colorés (200=vert, 400=orange, 500=rouge)
- **JSON formatting** automatique
- **Headers** complets affichés

---

**🎯 Objectif :** Tester rapidement toute l'API sans quitter VS Code !

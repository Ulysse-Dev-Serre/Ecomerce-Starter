# 🧪 Test API E-commerce

## 📋 Documentation API

**Fichier principal :** [`api-tests.http`](file:///home/ulbo/Dev/ecommerce-starter/api-tests.http)

## 🚀 Comment tester

### 1. Installer REST Client dans VS Code
```bash
# Extension VS Code
REST Client by Huachao Mao
```

### 2. Démarrer le serveur
```bash
npm run dev
```

### 3. Ouvrir et tester
```bash
# Ouvrir le fichier de tests
code api-tests.http

# Cliquer "Send Request" sur chaque endpoint
```

## 🔧 Endpoints disponibles

### 👤 Users
- `POST /api/users` - Créer utilisateur
- `GET /api/users/{id}` - Récupérer utilisateur
- `PUT /api/users/{id}` - Modifier utilisateur

### 🛍️ Products  
- `GET /api/products` - Liste produits
- `GET /api/products/{slug}` - Détail produit
- Support multilingue : `?language=FR`

### 📂 Categories
- `GET /api/categories` - Liste catégories
- `GET /api/categories/{slug}` - Catégorie avec produits

### 🛒 Cart
- `GET /api/cart/{userId}` - Récupérer panier
- `POST /api/cart/{userId}` - Ajouter au panier

### 📦 Orders
- `POST /api/orders` - Créer commande
- `GET /api/orders/{id}` - Récupérer commande
- `PATCH /api/orders/{id}` - Modifier statut

## 🧪 Workflow de test

1. **Setup** : `POST /test-data`
2. **User** : `POST /users`
3. **Cart** : `POST /cart/{userId}`
4. **Order** : `POST /orders`

## 🌍 Langues supportées

- EN (English)
- FR (Français) 
- ES (Español)
- DE (Deutsch)
- IT (Italiano)

---

**Documentation complète et testable sans interface complexe !**

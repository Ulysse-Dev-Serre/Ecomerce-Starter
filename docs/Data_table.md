# 📦 Schéma des tables — E-commerce Starter (v2.1 + correctifs)

> Liste des tables uniquement, avec colonnes, PK/FK, uniques et règles métier (sans SQL).

---

## 1) Utilisateurs & Sessions

### Table: User
- id (PK)
- email (UNIQUE, nullable autorisé selon stratégie)
- name
- password_hash
- role ∈ {USER, ADMIN}
- created_at
- updated_at

### Table: Session
- id (PK)
- user_id (FK → User.id, CASCADE)
- session_token (UNIQUE)
- expires
- created_at
- updated_at

---

## 2) Catalogue, i18n & catégorisation

### Table: Category
- id (PK)
- slug (UNIQUE)
- parent_id (FK → Category.id, SET NULL)
- created_at
- updated_at

### Table: CategoryTranslation
- category_id (FK → Category.id, CASCADE)
- language_code (CHAR(5))
- name
- (PK) (category_id, language_code)

### Table: Product
- id (PK)
- slug (UNIQUE)
- status ∈ {DRAFT, ACTIVE, ARCHIVED}
- type ∈ {PHYSICAL, DIGITAL, SERVICE}
- created_at
- updated_at
- deleted_at (soft delete)

### Table: ProductTranslation
- product_id (FK → Product.id, CASCADE)
- language_code (CHAR(5))
- title
- description
- (PK) (product_id, language_code)

### Table: ProductCategory  (relation N–N)
- product_id (FK → Product.id, CASCADE)
- category_id (FK → Category.id, CASCADE)
- (PK) (product_id, category_id)

---

## 3) Variantes, attributs & valeurs

### Table: ProductVariant
- id (PK)
- product_id (FK → Product.id, CASCADE)
- sku (UNIQUE si non NULL — contrainte métier)
- price_cents (≥ 0)
- currency (CHAR(3), ex: CAD)
- stock (NULLABLE, ≥ 0 si présent)
- created_at
- updated_at
- deleted_at (soft delete)

### Table: ProductAttribute
- id (PK)
- name (UNIQUE)

### Table: ProductAttributeValue
- id (PK)
- attribute_id (FK → ProductAttribute.id, CASCADE)
- value
- (UNIQUE) (attribute_id, value)

### Table: ProductVariantAttributeValue  (N–N)
- product_variant_id (FK → ProductVariant.id, CASCADE)
- attribute_value_id (FK → ProductAttributeValue.id, CASCADE)
- (PK) (product_variant_id, attribute_value_id)

---

## 4) Médias

### Table: Media
- id (PK)
- url
- alt_text
- type ∈ {IMAGE, VIDEO, DOCUMENT}
- created_at

### Table: ProductVariantMedia  (N–N)
- product_variant_id (FK → ProductVariant.id, CASCADE)
- media_id (FK → Media.id, CASCADE)
- is_primary (BOOLEAN)
- (PK) (product_variant_id, media_id)
- Règle métier: **au plus un** enregistrement avec `is_primary = TRUE` par `product_variant_id`.

---

## 5) Panier

### Table: Cart
- id (PK)
- user_id (FK → User.id, SET NULL)
- status ∈ {ACTIVE, CHECKED_OUT, EXPIRED}
- expires_at
- created_at
- updated_at
- Règle métier: **au plus un** panier `ACTIVE` par `user_id`.

### Table: CartItem
- id (PK)
- cart_id (FK → Cart.id, CASCADE)
- variant_id (FK → ProductVariant.id, CASCADE)
- quantity (> 0)
- created_at
- updated_at

---

## 6) Commandes

### Table: Order
- id (PK)
- user_id (FK → User.id, SET NULL)
- status ∈ {PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED, PARTIALLY_SHIPPED}
- total_cents (≥ 0)
- currency (CHAR(3))
- billing_address (SNAPSHOT JSON)
- shipping_address (SNAPSHOT JSON)
- created_at
- updated_at

### Table: OrderItem
- id (PK)
- order_id (FK → Order.id, CASCADE)
- product_id (FK optionnelle → Product.id)         ← pour reporting/jointures
- variant_id (FK optionnelle → ProductVariant.id)   ← pour reporting/jointures
- product_title (snapshot)
- product_sku (snapshot)
- quantity (> 0)
- unit_price_cents (≥ 0)
- currency (CHAR(3))
- created_at
- updated_at

---

## 7) Carnet d’adresses utilisateur (non snapshot)

### Table: Address
- id (PK)
- user_id (FK → User.id, SET NULL)
- line1
- line2
- city
- postal_code
- country (CHAR(2), ISO)
- is_default_billing (BOOL)
- is_default_shipping (BOOL)
- created_at
- updated_at

> Les adresses utilisées lors d’une commande sont **snapshottées** dans `Order.billing_address` et `Order.shipping_address`.

---

## 8) Paiements

### Table: Payment
- id (PK)
- order_id (FK → Order.id, CASCADE)
- provider (ex: STRIPE)
- status ∈ {PENDING, SUCCESS, FAILED, REFUNDED, PARTIALLY_REFUNDED}
- amount_cents (≥ 0)
- currency (CHAR(3))
- external_provider_id (ex: payment_intent)
- external_charge_id
- raw_payload (JSON, optionnel pour audit)
- created_at
- updated_at

---

## 9) Expédition (partielle possible)

### Table: Shipment
- id (PK)
- order_id (FK → Order.id, CASCADE)
- tracking_number
- carrier
- status ∈ {PROCESSING, SHIPPED, IN_TRANSIT, DELIVERED, RETURNED, CANCELLED}
- created_at
- updated_at

### Table: ShipmentItem  (répartition des items par colis)
- shipment_id (FK → Shipment.id, CASCADE)
- order_item_id (FK → OrderItem.id, CASCADE)
- quantity (> 0)
- (PK) (shipment_id, order_item_id)

---

## 10) Avis Produits

### Table: Review
- id (PK)
- user_id (FK → User.id, CASCADE)
- product_id (FK → Product.id, CASCADE)
- rating (1..5)
- comment
- status ∈ {PENDING, APPROVED, REJECTED}
- created_at
- (UNIQUE) (user_id, product_id)

---

## 11) Index & règles métier clés (rappel)
- `ProductCategory`: (PK) (product_id, category_id).
- `ProductVariant.sku`: unique **si non NULL**.
- `ProductVariantMedia`: **un seul** `is_primary=TRUE` par variante.
- `Cart`: **un seul** `ACTIVE` par `user_id`.
- `OrderItem`: conserver **snapshots** (title, sku) + **FK optionnelles** vers Product/Variant.
- Soft delete via `deleted_at` sur Product / ProductVariant.
- Timestamps: `created_at`, `updated_at` sur les entités principales.


# Résumé détaillé du schéma E-commerce en francais

Ce schéma de base de données relationnelle modélise une boutique en ligne moderne avec un haut niveau de réutilisabilité et d’intégrité.  

La partie **Utilisateurs** gère les comptes clients et administrateurs, les sessions de connexion et le carnet d’adresses. Les adresses sont séparées du cycle de commande, car chaque commande stocke un **snapshot JSON** de l’adresse au moment de l’achat afin de préserver l’historique même si l’utilisateur modifie son profil.  

Le **Catalogue produits** est construit autour de tables `Product` et `Category` reliées par une relation N–N (`ProductCategory`). Chaque entité est traduisible grâce à des tables `ProductTranslation` et `CategoryTranslation`, ce qui permet un affichage multilingue. Les produits ont des **variantes** (`ProductVariant`) qui définissent prix, devise, stock et SKU. Ces variantes peuvent recevoir des **attributs dynamiques** (taille, couleur, matériau) via les tables `ProductAttribute`, `ProductAttributeValue` et leur table de relation. Les médias (images, vidéos, documents) sont stockés séparément et liés aux variantes, avec la contrainte qu’une seule image peut être définie comme principale.

La partie **Panier** est reliée à l’utilisateur et ne permet qu’un seul panier actif à la fois. Chaque panier contient des `CartItem` qui référencent les variantes sélectionnées. Lorsqu’un panier est validé, il devient une **commande** (`Order`), qui enregistre un statut (ex. PENDING, PAID, SHIPPED) et conserve des snapshots de prix, de titres produits et d’adresses. Les `OrderItem` gardent à la fois les liens optionnels vers le catalogue et les informations figées pour assurer la cohérence historique.

Les **paiements** sont liés aux commandes avec enregistrement du montant, de la devise et des identifiants externes (par exemple Stripe). Les **expéditions** sont modélisées par `Shipment` et peuvent être partielles grâce à `ShipmentItem`, permettant de suivre plusieurs colis pour une même commande.  

Enfin, les **avis clients** (`Review`) permettent d’évaluer un produit, avec contrainte qu’un utilisateur ne peut émettre qu’un seul avis par produit.  

Ce schéma fournit une base solide, extensible et conforme aux besoins d’un site e-commerce multi-langue et multi-devise.

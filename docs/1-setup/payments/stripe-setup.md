# Configuration Stripe

## Page de Paiement Implémentée

### Fonctionnalités
- ✅ Stripe Elements intégrés (PaymentElement + AddressElement)
- ✅ Validation côté client
- ✅ Style cohérent avec la charte graphique
- ✅ UX optimisée avec états de chargement
- ✅ Sécurité : Headers SSL, certificat PCI DSS
- ✅ Responsive mobile et desktop
- ✅ Accessibilité complète

### Structure des fichiers
```
src/app/checkout/
├── page.tsx                    # Page principale checkout
└── success/page.tsx           # Page de confirmation

src/components/checkout/
├── CheckoutForm.tsx           # Formulaire Stripe Elements
└── OrderSummary.tsx          # Récapitulatif commande
```

## Configuration Requise

### Variables d'environnement
```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
```

### Obtenir les clés Stripe
1. **Compte Stripe** : [dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. **Mode test** → Récupérer les clés :
   - Clé publique : `pk_test_...` (côté client)
   - Clé secrète : `sk_test_...` (serveur uniquement)
3. **Webhooks** → Créer endpoint :
   - URL : `https://votre-domaine.com/api/webhooks/stripe`
   - Événements : `payment_intent.succeeded`, `payment_intent.payment_failed`

## Personnalisation Style

```typescript
const options = {
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#0570de',
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  },
}
```

## Workflow Utilisateur

### 1. Page panier (`/cart`)
Bouton "Procéder au paiement" → `/checkout`

### 2. Page checkout (`/checkout`)
- Vérification authentification
- Chargement panier via API
- Formulaire Stripe Elements :
  - Email client
  - Adresse de facturation
  - Informations carte
- Récapitulatif commande
- Validation avant envoi

### 3. Page succès (`/checkout/success`)
- Confirmation visuelle
- Numéro de commande
- Détails livraison

## Cartes de Test

```
# Visa - Paiement réussi
4242 4242 4242 4242

# Mastercard - Paiement réussi  
5555 5555 5555 4444

# Échec - Carte déclinée
4000 0000 0000 0002
```

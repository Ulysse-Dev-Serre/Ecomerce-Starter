# Configuration Paiements

## Vue d'Ensemble

Le système de paiement utilise **Stripe** avec Elements intégrés pour une sécurité maximale.

## Configuration Rapide

### 1. Variables Stripe requises
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 2. Pages implémentées
- `/checkout` : Formulaire de paiement sécurisé
- `/checkout/success` : Page de confirmation

## Sécurité

### Côté client
- Stripe Elements (champs en iframe)
- Validation stricte
- HTTPS requis
- PCI DSS compliant

### Messages sécurisés
- Badge "SSL sécurisé"
- Mention "Stripe certifié PCI"
- Aucune donnée carte stockée

## Test

Utiliser les [cartes de test Stripe](payments/stripe-setup.md#cartes-de-test) pour valider l'intégration.

## Guides Détaillés

- [Configuration Stripe complète](payments/stripe-setup.md)

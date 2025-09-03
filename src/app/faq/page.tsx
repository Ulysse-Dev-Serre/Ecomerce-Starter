'use client'

import { useState } from 'react'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import Link from 'next/link'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

const faqData: FAQItem[] = [
  // Paiement
  {
    id: 'paiement-methodes',
    question: 'Quelles méthodes de paiement acceptez-vous ?',
    answer: 'Nous acceptons toutes les cartes de crédit principales (Visa, Mastercard, American Express), PayPal, Apple Pay et Google Pay. Tous les paiements sont sécurisés par cryptage SSL.',
    category: 'paiement'
  },
  {
    id: 'paiement-securite',
    question: 'Mes informations de paiement sont-elles sécurisées ?',
    answer: 'Absolument. Nous utilisons le cryptage SSL 256-bit et nous ne stockons jamais vos informations de carte de crédit. Les paiements sont traités par Stripe, certifié PCI DSS niveau 1.',
    category: 'paiement'
  },
  {
    id: 'paiement-echeance',
    question: 'Quand ma carte sera-t-elle débitée ?',
    answer: 'Votre carte est débitée immédiatement lors de la validation de commande. Si un produit est en rupture, nous vous remboursons la différence sous 3-5 jours ouvrables.',
    category: 'paiement'
  },

  // Livraison
  {
    id: 'livraison-delais',
    question: 'Quels sont vos délais de livraison ?',
    answer: 'Canada : 3-7 jours ouvrables (gratuit dès 75$ CAD). Express 1-3 jours (+19.99$ CAD). États-Unis : 5-10 jours (+24.99$ CAD). Traitement sous 24h.',
    category: 'livraison'
  },
  {
    id: 'livraison-gratuite',
    question: 'Comment bénéficier de la livraison gratuite ?',
    answer: 'La livraison est gratuite pour toute commande de 75$ CAD et plus au Canada. Le montant s\'affiche automatiquement dans votre panier.',
    category: 'livraison'
  },
  {
    id: 'livraison-suivi',
    question: 'Comment suivre ma commande ?',
    answer: 'Vous recevez un email avec numéro de suivi dès l\'expédition. Utilisez ce numéro sur le site du transporteur ou dans votre espace client.',
    category: 'livraison'
  },

  // Retours
  {
    id: 'retours-delai',
    question: 'Dans quels délais puis-je retourner un produit ?',
    answer: 'Vous avez 30 jours à partir de la réception pour retourner un produit. Le produit doit être dans son état d\'origine avec étiquettes et emballage.',
    category: 'retours'
  },
  {
    id: 'retours-frais',
    question: 'Qui paie les frais de retour ?',
    answer: 'Les retours sont gratuits au Canada. Nous vous envoyons une étiquette prépayée par email. Pour les retours internationaux, frais à votre charge.',
    category: 'retours'
  },
  {
    id: 'retours-remboursement',
    question: 'Quand serai-je remboursé ?',
    answer: 'Remboursement traité sous 24h après réception. Crédit sur votre carte sous 3-5 jours ouvrables. Délai bancaire : 7-10 jours selon votre banque.',
    category: 'retours'
  },

  // Compte
  {
    id: 'compte-creation',
    question: 'Dois-je créer un compte pour commander ?',
    answer: 'Non obligatoire, mais recommandé. Un compte vous permet de suivre vos commandes, sauvegarder vos adresses et accéder à l\'historique d\'achats.',
    category: 'compte'
  },
  {
    id: 'compte-mot-de-passe',
    question: 'J\'ai oublié mon mot de passe, que faire ?',
    answer: 'Cliquez sur "Connexion par email" sur la page d\'authentification. Nous vous enverrons un lien sécurisé pour vous connecter sans mot de passe.',
    category: 'compte'
  },
  {
    id: 'compte-donnees',
    question: 'Puis-je modifier mes informations personnelles ?',
    answer: 'Oui, connectez-vous et allez dans "Mon Profil". Vous pouvez modifier votre nom, email, adresses de livraison et facturation à tout moment.',
    category: 'compte'
  },

  // Produits
  {
    id: 'produits-stock',
    question: 'Que se passe-t-il si un produit est en rupture ?',
    answer: 'Nous vous contactons dans les 24h pour proposer un produit similaire ou un remboursement intégral. Aucun débit si le produit n\'est pas disponible.',
    category: 'produits'
  },
  {
    id: 'produits-garantie',
    question: 'Vos produits ont-ils une garantie ?',
    answer: 'Tous nos produits bénéficient de la garantie fabricant. Durée variable selon le produit (6 mois à 2 ans). Détails sur chaque fiche produit.',
    category: 'produits'
  }
]

const categories = [
  { id: 'all', name: 'Toutes', icon: '📋' },
  { id: 'paiement', name: 'Paiement', icon: '💳' },
  { id: 'livraison', name: 'Livraison', icon: '🚚' },
  { id: 'retours', name: 'Retours', icon: '↩️' },
  { id: 'compte', name: 'Compte', icon: '👤' },
  { id: 'produits', name: 'Produits', icon: '📦' }
]

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [openItems, setOpenItems] = useState<string[]>([])

  const filteredFAQ = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory)

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Questions fréquentes
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Trouvez rapidement les réponses à vos questions
            </p>
          </div>

          {/* Quick Contact */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-12 text-center">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Vous ne trouvez pas la réponse ?
            </h2>
            <p className="text-blue-800 mb-4">
              Notre équipe support répond généralement sous 2 heures
            </p>
            <div className="space-x-4">
              <Link 
                href="/contact"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block"
              >
                Nous contacter
              </Link>
              <a 
                href="tel:+15141234567"
                className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition-colors inline-block"
              >
                (514) 123-4567
              </a>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFAQ.map(item => (
              <div 
                key={item.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-semibold text-gray-900 pr-4">
                    {item.question}
                  </h3>
                  <svg 
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      openItems.includes(item.id) ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {openItems.includes(item.id) && (
                  <div className="px-6 pb-4">
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-gray-600 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Still Need Help */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Vous avez encore des questions ?
            </h2>
            <p className="text-gray-600 mb-6">
              N'hésitez pas à nous contacter. Nous sommes là pour vous aider !
            </p>
            <div className="flex justify-center space-x-4">
              <Link 
                href="/contact"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Envoyer un message
              </Link>
              <Link 
                href="/shipping"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Infos livraison
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

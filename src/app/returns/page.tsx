import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import Link from 'next/link'

export default function ReturnsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Retours et remboursements
            </h1>
            <p className="text-xl text-gray-600">
              Politique de retour simple et transparente pour votre satisfaction
            </p>
          </div>

          {/* Main Policy */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-green-900 mb-2">
                30 jours pour changer d'avis
              </h2>
              <p className="text-green-800 text-lg">
                Retour gratuit et remboursement intégral si vous n'êtes pas satisfait
              </p>
            </div>
          </div>

          {/* Process Steps */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Comment retourner un produit ?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="font-bold text-blue-600">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Contactez-nous</h3>
                <p className="text-gray-600 text-sm">
                  Envoyez-nous un email avec votre numéro de commande et la raison du retour.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="font-bold text-blue-600">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Recevez l'étiquette</h3>
                <p className="text-gray-600 text-sm">
                  Nous vous envoyons une étiquette de retour prépayée par email sous 24h.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="font-bold text-blue-600">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Expédiez</h3>
                <p className="text-gray-600 text-sm">
                  Emballez le produit et collez l'étiquette. Remboursement sous 5-7 jours.
                </p>
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Produits éligibles
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✅ Tous les produits physiques</li>
                <li>✅ Produits dans leur emballage d'origine</li>
                <li>✅ Étiquettes et tags attachés</li>
                <li>✅ État neuf, non porté/utilisé</li>
                <li>✅ Retour dans les 30 jours suivant réception</li>
              </ul>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Exceptions
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>❌ Produits personnalisés/gravés</li>
                <li>❌ Sous-vêtements et maillots</li>
                <li>❌ Produits d'hygiène personnelle</li>
                <li>❌ Produits en promotion finale (-50%+)</li>
                <li>❌ Cartes cadeaux électroniques</li>
              </ul>
            </div>
          </div>

          {/* Refund Timeline */}
          <div className="bg-gray-50 rounded-xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Délais de remboursement
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">24h</div>
                <h4 className="font-semibold text-gray-900 mb-1">Traitement</h4>
                <p className="text-sm text-gray-600">
                  Validation du retour après réception
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">3-5j</div>
                <h4 className="font-semibold text-gray-900 mb-1">Remboursement</h4>
                <p className="text-sm text-gray-600">
                  Crédit sur votre méthode de paiement
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">7-10j</div>
                <h4 className="font-semibold text-gray-900 mb-1">Banque</h4>
                <p className="text-sm text-gray-600">
                  Apparition sur votre relevé bancaire
                </p>
              </div>
            </div>
          </div>

          {/* Exchanges */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Échanges de taille ou couleur
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Procédure d'échange
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Contactez-nous par email avec votre demande</li>
                  <li>Nous vérifions la disponibilité</li>
                  <li>Expédition simultanée : vous recevez le nouveau produit</li>
                  <li>Renvoyez l'ancien avec l'étiquette fournie</li>
                </ol>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Avantage échange</h4>
                <p className="text-blue-800 text-sm mb-3">
                  Plus rapide qu'un retour + nouvel achat !
                </p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Aucun délai d'attente</li>
                  <li>• Aucun frais supplémentaire</li>
                  <li>• Satisfait ou remboursé</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-4">
              Besoin d'aide avec un retour ?
            </h2>
            <p className="text-blue-100 mb-6">
              Notre équipe support est là pour vous accompagner
            </p>
            <div className="space-x-4">
              <Link 
                href="/contact"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
              >
                Nous contacter
              </Link>
              <a 
                href="mailto:support@maboutique.com"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-block"
              >
                Email direct
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

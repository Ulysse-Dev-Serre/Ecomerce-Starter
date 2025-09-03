import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'

export default function ShippingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Livraison et expédition
            </h1>
            <p className="text-xl text-gray-600">
              Tout ce que vous devez savoir sur nos délais et frais de livraison
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Shipping Info */}
            <div className="space-y-8">
              {/* Free Shipping */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-green-800">
                    Livraison gratuite dès 75$ CAD
                  </h2>
                </div>
                <p className="text-green-700">
                  Profitez de la livraison gratuite sur toutes vos commandes de 75$ et plus partout au Canada.
                </p>
              </div>

              {/* Shipping Times */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Délais de livraison
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                    <div>
                      <h4 className="font-medium text-gray-900">Canada (Standard)</h4>
                      <p className="text-sm text-gray-600">Postes Canada</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">3-7 jours</p>
                      <p className="text-sm text-gray-600">9.99$ CAD</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                    <div>
                      <h4 className="font-medium text-gray-900">Canada (Express)</h4>
                      <p className="text-sm text-gray-600">Purolator</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">1-3 jours</p>
                      <p className="text-sm text-gray-600">19.99$ CAD</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                    <div>
                      <h4 className="font-medium text-gray-900">États-Unis</h4>
                      <p className="text-sm text-gray-600">UPS Ground</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">5-10 jours</p>
                      <p className="text-sm text-gray-600">24.99$ CAD</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Processing Time */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-blue-900 mb-3">
                  Temps de traitement
                </h3>
                <p className="text-blue-800 mb-4">
                  Toutes les commandes sont traitées sous 24h (jours ouvrables).
                </p>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• <strong>Commandes avant 14h</strong> : Expédiées le jour même</p>
                  <p>• <strong>Weekend et jours fériés</strong> : Traitement le lundi suivant</p>
                  <p>• <strong>Périodes de pointe</strong> : Délais étendus communiqués</p>
                </div>
              </div>
            </div>

            {/* Coverage & Carriers */}
            <div className="space-y-8">
              {/* Coverage Map */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Zones de livraison
                </h3>
                
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">🇨🇦</span>
                      <h4 className="font-semibold text-gray-900">Canada</h4>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Toutes les provinces et territoires.
                      Livraison gratuite dès 75$ CAD.
                    </p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">🇺🇸</span>
                      <h4 className="font-semibold text-gray-900">États-Unis</h4>
                    </div>
                    <p className="text-gray-600 text-sm">
                      48 états continentaux.
                      Frais de douane à la charge du client.
                    </p>
                  </div>
                </div>
              </div>

              {/* Carriers */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Nos transporteurs
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <div className="font-semibold text-gray-900 mb-1">Postes Canada</div>
                    <div className="text-sm text-gray-600">Standard & Express</div>
                  </div>
                  
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <div className="font-semibold text-gray-900 mb-1">Purolator</div>
                    <div className="text-sm text-gray-600">Express seulement</div>
                  </div>
                  
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <div className="font-semibold text-gray-900 mb-1">UPS</div>
                    <div className="text-sm text-gray-600">International</div>
                  </div>
                  
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <div className="font-semibold text-gray-900 mb-1">FedEx</div>
                    <div className="text-sm text-gray-600">Express premium</div>
                  </div>
                </div>
              </div>

              {/* Tracking */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-purple-900">
                    Suivi de commande
                  </h3>
                </div>
                <p className="text-purple-800 mb-4">
                  Recevez un numéro de suivi par email dès l'expédition.
                </p>
                <div className="text-sm text-purple-700 space-y-1">
                  <p>• <strong>Email automatique</strong> avec lien de suivi</p>
                  <p>• <strong>Suivi temps réel</strong> sur le site du transporteur</p>
                  <p>• <strong>Notifications</strong> à chaque étape importante</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Quick */}
          <div className="mt-16 bg-gray-50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Questions fréquentes sur la livraison
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Puis-je modifier l'adresse après commande ?
                </h4>
                <p className="text-gray-600 text-sm">
                  Contactez-nous dans les 2h suivant la commande. Après expédition, modification impossible.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Que faire si ma commande est en retard ?
                </h4>
                <p className="text-gray-600 text-sm">
                  Utilisez votre numéro de suivi ou contactez-nous. Nous trouvons une solution rapidement.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Livraison le weekend ?
                </h4>
                <p className="text-gray-600 text-sm">
                  Selon le transporteur. Purolator et UPS livrent le samedi (supplément possible).
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Frais de douane international ?
                </h4>
                <p className="text-gray-600 text-sm">
                  Variables selon pays. Nous déclarons la valeur réelle. Frais à votre charge.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

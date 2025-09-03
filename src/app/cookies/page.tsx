'use client'

import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'

export default function CookiesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Politique des cookies
            </h1>
            <p className="text-gray-600">
              Comment nous utilisons les cookies pour améliorer votre expérience
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            {/* Quick Summary */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold text-green-900 mb-3">
                🍪 En bref
              </h2>
              <ul className="text-green-800 space-y-2">
                <li>✅ <strong>Cookies essentiels</strong> : Panier et connexion (obligatoires)</li>
                <li>✅ <strong>Cookies analytiques</strong> : Améliorer le site (anonymes)</li>
                <li>⚙️ <strong>Cookies marketing</strong> : Personnalisation (avec votre accord)</li>
                <li>🔧 <strong>Contrôle total</strong> : Gérez vos préférences à tout moment</li>
              </ul>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Qu'est-ce qu'un cookie ?
              </h2>
              <p className="mb-4">
                Un cookie est un petit fichier texte stocké sur votre appareil lors de votre visite 
                sur notre site. Il nous permet de reconnaître votre navigateur et de mémoriser 
                certaines informations sur vos préférences.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Types de cookies utilisés
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Essential Cookies */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-2xl">🔴</span>
                    <h3 className="font-bold text-red-900">Essentiels</h3>
                  </div>
                  <p className="text-red-800 text-sm mb-4 font-medium">
                    Obligatoires pour le fonctionnement du site
                  </p>
                  <ul className="text-red-700 text-sm space-y-1">
                    <li>• Session utilisateur</li>
                    <li>• Contenu du panier</li>
                    <li>• Authentification</li>
                    <li>• Sécurité CSRF</li>
                  </ul>
                </div>

                {/* Analytics Cookies */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-2xl">🔵</span>
                    <h3 className="font-bold text-blue-900">Analytiques</h3>
                  </div>
                  <p className="text-blue-800 text-sm mb-4 font-medium">
                    Nous aident à améliorer le site (anonymes)
                  </p>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Pages les plus visitées</li>
                    <li>• Temps passé sur le site</li>
                    <li>• Parcours utilisateur</li>
                    <li>• Erreurs techniques</li>
                  </ul>
                </div>

                {/* Marketing Cookies */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-2xl">🟣</span>
                    <h3 className="font-bold text-purple-900">Marketing</h3>
                  </div>
                  <p className="text-purple-800 text-sm mb-4 font-medium">
                    Personnalisation avec votre consentement
                  </p>
                  <ul className="text-purple-700 text-sm space-y-1">
                    <li>• Produits recommandés</li>
                    <li>• Publicités ciblées</li>
                    <li>• Retargeting</li>
                    <li>• A/B testing</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Cookies spécifiques utilisés
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Nom</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Type</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Durée</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Finalité</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-t border-gray-200">
                      <td className="px-4 py-3 font-mono text-xs">next-auth.session-token</td>
                      <td className="px-4 py-3"><span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Essentiel</span></td>
                      <td className="px-4 py-3">30 jours</td>
                      <td className="px-4 py-3">Maintient votre connexion</td>
                    </tr>
                    <tr className="border-t border-gray-200">
                      <td className="px-4 py-3 font-mono text-xs">cart-items</td>
                      <td className="px-4 py-3"><span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Essentiel</span></td>
                      <td className="px-4 py-3">7 jours</td>
                      <td className="px-4 py-3">Sauvegarde votre panier</td>
                    </tr>
                    <tr className="border-t border-gray-200">
                      <td className="px-4 py-3 font-mono text-xs">_ga</td>
                      <td className="px-4 py-3"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Analytique</span></td>
                      <td className="px-4 py-3">2 ans</td>
                      <td className="px-4 py-3">Google Analytics (anonyme)</td>
                    </tr>
                    <tr className="border-t border-gray-200">
                      <td className="px-4 py-3 font-mono text-xs">marketing-consent</td>
                      <td className="px-4 py-3"><span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">Marketing</span></td>
                      <td className="px-4 py-3">1 an</td>
                      <td className="px-4 py-3">Mémorise vos préférences pub</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Gérer vos préférences
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Dans votre navigateur
                  </h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li><strong>Chrome :</strong> Paramètres → Confidentialité → Cookies</li>
                    <li><strong>Firefox :</strong> Options → Vie privée → Cookies</li>
                    <li><strong>Safari :</strong> Préférences → Confidentialité</li>
                    <li><strong>Edge :</strong> Paramètres → Confidentialité</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-3">
                    Sur notre site
                  </h3>
                  <p className="text-blue-800 text-sm mb-4">
                    Gérez vos préférences directement ici (fonctionnalité à venir) :
                  </p>
                  <button 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    onClick={() => alert('Panneau de préférences cookies à implémenter')}
                  >
                    Gérer les cookies
                  </button>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Cookies tiers
              </h2>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Google Analytics</h4>
                  <p className="text-gray-600 text-sm mb-2">
                    Mesure d'audience anonymisée pour améliorer notre site.
                  </p>
                  <a 
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    Politique de confidentialité Google →
                  </a>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Stripe (Paiements)</h4>
                  <p className="text-gray-600 text-sm mb-2">
                    Traitement sécurisé des paiements, certifié PCI DSS niveau 1.
                  </p>
                  <a 
                    href="https://stripe.com/privacy"
                    target="_blank"
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    Politique de confidentialité Stripe →
                  </a>
                </div>
              </div>
            </section>

            {/* Contact */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Questions sur les cookies ?
              </h2>
              <p className="text-gray-700 mb-4">
                Contactez notre équipe pour toute question sur notre utilisation des cookies.
              </p>
              <div className="flex space-x-4">
                <a 
                  href="mailto:privacy@maboutique.com"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Email support
                </a>
                <a 
                  href="/contact"
                  className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Formulaire contact
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

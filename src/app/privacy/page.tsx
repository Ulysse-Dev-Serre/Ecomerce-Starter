import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Politique de confidentialité
            </h1>
            <p className="text-gray-600">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold text-blue-900 mb-3">
                En résumé
              </h2>
              <ul className="text-blue-800 space-y-2">
                <li>✅ Nous collectons uniquement les données nécessaires à votre commande</li>
                <li>✅ Vos données ne sont jamais vendues à des tiers</li>
                <li>✅ Vous pouvez demander la suppression de vos données à tout moment</li>
                <li>✅ Paiements sécurisés par Stripe (certifié PCI DSS)</li>
              </ul>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                1. Données collectées
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Informations de compte
              </h3>
              <ul className="list-disc ml-6 mb-6 space-y-1">
                <li>Nom et adresse email (obligatoires pour la commande)</li>
                <li>Photo de profil (si connexion Google/Apple)</li>
                <li>Adresses de livraison et facturation</li>
                <li>Historique des commandes et préférences</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Données de navigation
              </h3>
              <ul className="list-disc ml-6 mb-6 space-y-1">
                <li>Adresse IP et données de géolocalisation</li>
                <li>Pages visitées et temps passé sur le site</li>
                <li>Produits consultés et ajoutés au panier</li>
                <li>Appareil et navigateur utilisés (anonymisé)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. Utilisation des données
              </h2>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Traitement des commandes</strong> : Paiement, livraison, service client</li>
                <li><strong>Communication</strong> : Confirmations, suivi, support technique</li>
                <li><strong>Amélioration du service</strong> : Analyse des tendances, optimisation UX</li>
                <li><strong>Sécurité</strong> : Prévention fraude, protection des comptes</li>
                <li><strong>Marketing (optionnel)</strong> : Newsletters, promotions (désinscription facile)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. Partage des données
              </h2>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 font-semibold">
                  ❌ Nous ne vendons jamais vos données personnelles à des tiers.
                </p>
              </div>

              <p className="mb-4">Partage limité aux cas suivants :</p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Partenaires de livraison</strong> : Adresse nécessaire à l'expédition</li>
                <li><strong>Processeurs de paiement</strong> : Stripe (certifié PCI DSS)</li>
                <li><strong>Obligations légales</strong> : Sur demande des autorités compétentes</li>
                <li><strong>Fournisseurs techniques</strong> : Hébergement sécurisé (Vercel, Neon)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Vos droits (RGPD)
              </h2>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Accès</strong> : Consulter toutes vos données stockées</li>
                <li><strong>Rectification</strong> : Corriger des informations inexactes</li>
                <li><strong>Suppression</strong> : Demander l'effacement de vos données</li>
                <li><strong>Portabilité</strong> : Télécharger vos données (format JSON)</li>
                <li><strong>Opposition</strong> : Refuser le traitement pour marketing</li>
                <li><strong>Limitation</strong> : Restreindre certains usages</li>
              </ul>
              
              <div className="bg-gray-100 rounded-lg p-4 mt-4">
                <p className="text-gray-700">
                  <strong>Pour exercer vos droits :</strong> Contactez-nous à 
                  <a href="mailto:privacy@maboutique.com" className="text-blue-600 hover:text-blue-800 ml-1">
                    privacy@maboutique.com
                  </a>
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Sécurité des données
              </h2>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Cryptage SSL</strong> : Toutes les communications chiffrées</li>
                <li><strong>Stockage sécurisé</strong> : Bases de données protégées par mot de passe</li>
                <li><strong>Accès limité</strong> : Seuls les employés autorisés</li>
                <li><strong>Sauvegarde</strong> : Données dupliquées et protégées</li>
                <li><strong>Monitoring</strong> : Surveillance 24/7 des tentatives d'intrusion</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. Cookies et technologies similaires
              </h2>
              <p className="mb-4">
                Nous utilisons des cookies pour améliorer votre expérience :
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Cookies essentiels</strong> : Panier, session, sécurité (obligatoires)</li>
                <li><strong>Cookies analytiques</strong> : Mesure audience (anonymes)</li>
                <li><strong>Cookies marketing</strong> : Personnalisation pub (avec consentement)</li>
              </ul>
              
              <p className="mt-4 text-sm text-gray-600">
                Gérez vos préférences cookies dans les paramètres de votre navigateur.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                7. Contact
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="mb-4">
                  <strong>Délégué à la protection des données :</strong>
                </p>
                <div className="text-gray-700 space-y-1">
                  <p>Email : privacy@maboutique.com</p>
                  <p>Téléphone : (514) 123-4567</p>
                  <p>Adresse : 123 Rue Principale, Montréal, QC H3B 1A1</p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <strong>Autorité de contrôle :</strong> Commission d'accès à l'information du Québec (CAI)
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

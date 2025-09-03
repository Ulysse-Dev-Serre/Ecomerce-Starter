import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Conditions d'utilisation
            </h1>
            <p className="text-gray-600">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold text-blue-900 mb-3">
                Points essentiels
              </h2>
              <ul className="text-blue-800 space-y-2">
                <li>✅ Retours gratuits sous 30 jours</li>
                <li>✅ Prix en CAD, taxes incluses pour le Canada</li>
                <li>✅ Support client 7j/7 par email</li>
                <li>✅ Paiements sécurisés et conformes PCI DSS</li>
              </ul>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                1. Acceptation des conditions
              </h2>
              <p className="mb-4">
                En utilisant ce site web et en passant commande, vous acceptez d'être lié par ces 
                conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas 
                utiliser notre service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. Commandes et paiements
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Prix et disponibilité</h3>
              <ul className="list-disc ml-6 mb-6 space-y-1">
                <li>Prix affichés en dollars canadiens (CAD), taxes incluses</li>
                <li>Disponibilité des produits mise à jour en temps réel</li>
                <li>Nous nous réservons le droit de modifier les prix sans préavis</li>
                <li>En cas d'erreur de prix manifeste, nous nous réservons le droit d'annuler la commande</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Processus de commande</h3>
              <ul className="list-disc ml-6 mb-6 space-y-1">
                <li>Validation de commande = acceptation des présentes conditions</li>
                <li>Confirmation par email dans les 24 heures</li>
                <li>Paiement débité immédiatement (sauf produits en précommande)</li>
                <li>Droit de refuser une commande pour stock insuffisant ou fraud suspectée</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. Livraison
              </h2>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Délais indicatifs</strong> : 3-7 jours ouvrables au Canada, 5-10 jours aux États-Unis</li>
                <li><strong>Risque transport</strong> : À votre charge dès expédition (assurance recommandée)</li>
                <li><strong>Livraison manquée</strong> : Contactez le transporteur avec votre numéro de suivi</li>
                <li><strong>Adresse erronée</strong> : Frais de réexpédition à votre charge</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Retours et remboursements
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Conditions de retour</h3>
              <ul className="list-disc ml-6 mb-6 space-y-1">
                <li>Délai : 30 jours calendaires à partir de la réception</li>
                <li>État : Produit neuf, non utilisé, emballage d'origine</li>
                <li>Étiquettes : Toutes les étiquettes doivent être présentes</li>
                <li>Exceptions : Produits personnalisés, sous-vêtements, produits d'hygiène</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Remboursements</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Méthode : Même moyen de paiement que l'achat original</li>
                <li>Délai : 3-5 jours ouvrables après traitement du retour</li>
                <li>Frais de retour : Gratuits au Canada, à votre charge à l'international</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Propriété intellectuelle
              </h2>
              <p className="mb-4">
                Le contenu de ce site (textes, images, logos, design) est protégé par le droit d'auteur 
                et appartient à notre entreprise ou à nos partenaires. Toute reproduction non autorisée 
                est interdite.
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Usage personnel uniquement</li>
                <li>Interdiction de copie commerciale</li>
                <li>Respect des droits des marques tierces</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. Limitation de responsabilité
              </h2>
              <p className="mb-4">
                Notre responsabilité est limitée au montant de votre commande. Nous ne pouvons 
                être tenus responsables des dommages indirects, pertes de profits ou interruptions 
                d'activité.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Exclusions</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Utilisation inappropriée des produits</li>
                <li>Dommages causés par des tiers transporteurs</li>
                <li>Force majeure (pandémie, catastrophes naturelles)</li>
                <li>Problèmes techniques indépendants de notre volonté</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                7. Droit applicable et juridiction
              </h2>
              <p>
                Ces conditions sont régies par le droit canadien et québécois. Tout litige sera 
                soumis aux tribunaux compétents de Montréal, Québec, Canada.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                8. Modifications
              </h2>
              <p>
                Nous nous réservons le droit de modifier ces conditions à tout moment. 
                Les modifications prennent effet dès leur publication sur cette page. 
                Date de dernière modification affichée en haut.
              </p>
            </section>

            {/* Contact */}
            <div className="bg-gray-50 rounded-xl p-6 mt-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Questions sur ces conditions ?
              </h2>
              <p className="text-gray-700 mb-4">
                Notre équipe juridique est disponible pour clarifier ces conditions.
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Email :</strong> legal@maboutique.com</p>
                <p><strong>Téléphone :</strong> (514) 123-4567</p>
                <p><strong>Adresse :</strong> 123 Rue Principale, Montréal, QC H3B 1A1</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

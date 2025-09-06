'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderNumber, setOrderNumber] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const paymentIntentId = searchParams.get('payment_intent')

  useEffect(() => {
    if (paymentIntentId) {
      // In production, you might want to verify the payment status
      // For now, we'll just generate an order number
      setOrderNumber(`ORD-${Date.now()}`)
      setLoading(false)
    } else {
      setError('Paiement non trouvé')
      setLoading(false)
    }
  }, [paymentIntentId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification du paiement...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/cart')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Retourner au panier
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success header */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Commande confirmée !
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Merci pour votre achat. Votre commande a été reçue et sera traitée sous peu.
          </p>
        </div>

        {/* Order details card */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <div className="border-b border-gray-200 pb-4 mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Détails de la commande
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Numéro de commande
              </h3>
              <p className="text-lg font-mono text-gray-900">{orderNumber}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Statut
              </h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                En cours de traitement
              </span>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Méthode de paiement
              </h3>
              <p className="text-gray-900">Carte de crédit</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Livraison estimée
              </h3>
              <p className="text-gray-900">3-5 jours ouvrables</p>
            </div>
          </div>
        </div>

        {/* Next steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Prochaines étapes
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3"></span>
              Vous recevrez un email de confirmation avec les détails de votre commande
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3"></span>
              Nous traiterons votre commande dans les 24 heures
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3"></span>
              Un numéro de suivi vous sera envoyé dès l'expédition
            </li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/profile"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Voir mes commandes
          </Link>
          
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Continuer mes achats
          </Link>
        </div>

        {/* Support section */}
        <div className="text-center mt-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Besoin d'aide ?
          </h3>
          <p className="text-gray-600 mb-4">
            Notre équipe support est là pour vous aider
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            <Link
              href="/contact"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Nous contacter
            </Link>
            <span className="hidden sm:block text-gray-300">•</span>
            <Link
              href="/faq"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              FAQ
            </Link>
            <span className="hidden sm:block text-gray-300">•</span>
            <Link
              href="/returns"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Politique de retour
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

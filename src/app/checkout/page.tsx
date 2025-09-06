'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import CheckoutForm from '@/components/checkout/CheckoutForm'
import OrderSummary from '@/components/checkout/OrderSummary'

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return // Still loading session
    
    if (status === 'unauthenticated') {
      router.push('/auth?redirect=/checkout')
      return
    }

    if (session?.user?.id) {
      fetchCart()
    }
  }, [session, status, router])

  const fetchCart = async () => {
    try {
      const response = await fetch(`/api/cart/${session?.user?.id}`)
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du panier')
      }

      const data = await response.json()
      
      if (!data.data || !data.data.items || data.data.items.length === 0) {
        router.push('/cart')
        return
      }
      
      setCart(data.data)
    } catch (error) {
      console.error('Erreur panier:', error)
      setError('Impossible de charger votre panier. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-lg mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Erreur
                </h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                <div className="mt-4">
                  <button
                    onClick={() => router.push('/cart')}
                    className="text-sm font-medium text-red-800 underline hover:text-red-600"
                  >
                    Retourner au panier
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!cart) {
    return null
  }

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Finaliser la commande</h1>
          <p className="mt-2 text-gray-600">
            Saisissez vos informations de paiement pour finaliser votre commande.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire de paiement */}
          <div className="bg-white rounded-lg shadow-sm p-6 lg:p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Informations de paiement
            </h2>
            
            <Elements stripe={stripePromise} options={options}>
              <CheckoutForm cart={cart} />
            </Elements>
          </div>

          {/* Récapitulatif commande */}
          <div className="bg-white rounded-lg shadow-sm p-6 lg:p-8">
            <OrderSummary cart={cart} />
          </div>
        </div>
      </div>
    </div>
  )
}

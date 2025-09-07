'use client'

import { useState, FormEvent } from 'react'
import {
  useStripe,
  useElements,
  PaymentElement,
  AddressElement,
} from '@stripe/react-stripe-js'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface CheckoutFormProps {
  cart: {
    id: string
    items: Array<{
      id: string
      quantity: number
      variant: {
        id: string
        sku: string
        price: number
        currency: string
        product: {
          translations: Array<{
            name: string
          }>
        }
      }
    }>
  }
  clientSecret: string
  paymentIntentId: string
}

export default function CheckoutForm({ cart, clientSecret: providedClientSecret, paymentIntentId: providedPaymentIntentId }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { data: session } = useSession()
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [email, setEmail] = useState(session?.user?.email || '')


  // Calculate total
  const total = cart.items.reduce((sum, item) => 
    sum + (item.variant.price * item.quantity), 0
  )

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      // Validate form
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setErrorMessage(submitError.message || 'Erreur de validation du formulaire')
        setIsLoading(false)
        return
      }

      // Get address data from AddressElement
      const addressElement = elements.getElement('address')
      let addressData = null

      if (addressElement) {
        const { complete, value } = await addressElement.getValue()
        if (complete) {
          addressData = value.address
        }
      }

      if (!addressData) {
        setErrorMessage('Veuillez compléter votre adresse de facturation')
        setIsLoading(false)
        return
      }

      // Confirm payment with existing Payment Intent
      // Pass addresses directly in the confirmation
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?payment_intent=${providedPaymentIntentId}`,
          shipping: {
            name: session?.user?.name || 'Client',
            address: {
              line1: addressData.line1,
              line2: addressData.line2 || undefined,
              city: addressData.city,
              state: addressData.state || undefined,
              postal_code: addressData.postal_code,
              country: addressData.country,
            },
          },
          // Billing details will be collected automatically by PaymentElement
        },
      })

      if (confirmError) {
        setErrorMessage(confirmError.message || 'Erreur lors de la confirmation du paiement')
      } else {
        // Payment successful - user will be redirected by Stripe
        console.log('✅ Payment confirmed successfully')
      }

    } catch (error) {
      console.error('Payment error:', error)
      setErrorMessage('Une erreur est survenue lors du traitement du paiement.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Address Element */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Adresse de facturation
        </label>
        <div className="border border-gray-300 rounded-md p-3">
          <AddressElement
            options={{
              mode: 'billing',
              allowedCountries: ['CA', 'US'],
              blockPoBox: true,
              display: {
                name: 'full',
              },
            }}
          />
        </div>

      </div>

      {/* Payment Element */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Informations de paiement
        </label>
        <div className="border border-gray-300 rounded-md p-3">
          <style jsx>{`
            .p-LinkOptInWrapper,
            .FadeWrapper,
            [class*="LinkOptIn"],
            [class*="p-Link"] {
              display: none !important;
            }
          `}</style>
          <PaymentElement
            options={{
              layout: 'tabs',
              paymentMethodOrder: ['card'],
              wallets: {
                applePay: 'never',
                googlePay: 'never',
              },
              fields: {
                billingDetails: {
                  name: 'never',
                  email: 'auto',
                  phone: 'never',
                  address: 'never',
                },
              },
              business: {
                name: 'Votre Boutique',
              },
              terms: {
                card: 'never',
              },
            }}
          />
        </div>
      </div>

      {/* Error message - simplified */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={!stripe || isLoading}
        className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
          !stripe || isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Traitement en cours...
          </div>
        ) : (
          `Payer ${total.toFixed(2)} ${cart.items[0]?.variant?.currency || 'CAD'}`
        )}
      </button>

      {/* Payment methods info */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Cartes acceptées : Visa, Mastercard, American Express
        </p>
      </div>
    </form>
  )
}

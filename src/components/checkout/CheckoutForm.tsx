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
}

export default function CheckoutForm({ cart }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { data: session } = useSession()
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [email, setEmail] = useState(session?.user?.email || '')
  const [saveAddress, setSaveAddress] = useState(true)

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

      // For demo purposes, simulate payment processing
      // In production, you would create a PaymentIntent on your server
      console.log('Payment data collected:', {
        email,
        total,
        currency: cart.items[0]?.variant?.currency || 'CAD',
        items: cart.items.length,
        address: addressData,
        saveAddress
      })

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500))

      // For now, just show success message and redirect
      // TODO: Replace with actual Stripe confirmPayment() call
      console.log('✅ Payment form validated successfully')
      
      // Redirect to success page
      router.push('/checkout/success')

    } catch (error) {
      console.error('Payment error:', error)
      setErrorMessage('Une erreur est survenue lors du traitement du paiement.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Adresse email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="votre@email.com"
        />
      </div>

      {/* Address Element */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Adresse de facturation
        </label>
        <div className="border border-gray-300 rounded-md p-3">
          <AddressElement 
            options={{
              mode: 'billing',
              allowedCountries: ['CA', 'US', 'FR'],
              blockPoBox: true,
              fields: {
                phone: 'always',
              },
              validation: {
                phone: {
                  required: 'never',
                },
              },
            }}
          />
        </div>
        <div className="mt-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={saveAddress}
              onChange={(e) => setSaveAddress(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-600">
              Sauvegarder cette adresse pour mes prochaines commandes
            </span>
          </label>
        </div>
      </div>

      {/* Payment Element */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Informations de paiement
        </label>
        <div className="border border-gray-300 rounded-md p-3">
          <PaymentElement 
            options={{
              layout: 'tabs',
              defaultValues: {
                billingDetails: {
                  email: email,
                }
              }
            }}
          />
        </div>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Security notice */}
      <div className="bg-green-50 border border-green-200 rounded-md p-3">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-green-700">
              <span className="font-medium">Paiement sécurisé</span> - Vos données sont protégées par le cryptage SSL 256-bit et Stripe (certifié PCI DSS).
            </p>
          </div>
        </div>
      </div>

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

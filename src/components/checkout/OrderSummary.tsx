'use client'

interface OrderSummaryProps {
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
        media?: Array<{
          url: string
          alt: string
          isPrimary: boolean
        }>
      }
    }>
  }
}

export default function OrderSummary({ cart }: OrderSummaryProps) {
  // Calculate totals
  const subtotal = cart.items.reduce((sum, item) => 
    sum + (item.variant.price * item.quantity), 0
  )
  
  const shipping = 0 // Free shipping for now
  const taxes = subtotal * 0.15 // 15% tax (Quebec/Canada)
  const total = subtotal + shipping + taxes
  const currency = cart.items[0]?.variant?.currency || 'CAD'

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Récapitulatif de la commande
      </h2>

      {/* Items list */}
      <div className="space-y-4 mb-6">
        {cart.items.map((item) => {
          const productName = item.variant.product.translations[0]?.name || 'Produit'
          const primaryImage = item.variant.media?.find(m => m.isPrimary) || item.variant.media?.[0]

          return (
            <div key={item.id} className="flex items-start space-x-4">
              {/* Product image */}
              <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-md overflow-hidden">
                {primaryImage ? (
                  <img
                    src={primaryImage.url}
                    alt={primaryImage.alt || productName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Product details */}
              <div className="flex-grow min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {productName}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  SKU: {item.variant.sku}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600">
                    Qté: {item.quantity}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatPrice(item.variant.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Totals */}
      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Sous-total</span>
          <span className="text-gray-900">{formatPrice(subtotal)}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Expédition</span>
          <span className="text-green-600 font-medium">
            {shipping === 0 ? 'Gratuite' : formatPrice(shipping)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Taxes (TPS/TVQ)</span>
          <span className="text-gray-900">{formatPrice(taxes)}</span>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Shipping info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Livraison gratuite
            </h3>
            <p className="text-sm text-blue-600 mt-1">
              Estimée entre 3-5 jours ouvrables
            </p>
          </div>
        </div>
      </div>

      {/* Return policy */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-800">
              Retours gratuits
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              30 jours pour changer d'avis
            </p>
          </div>
        </div>
      </div>

      {/* Security badges */}
      <div className="mt-6 flex items-center justify-center space-x-4">
        <div className="flex items-center text-xs text-gray-500">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          SSL sécurisé
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <span className="font-semibold">Stripe</span>
          <span className="ml-1">certifié PCI</span>
        </div>
      </div>
    </div>
  )
}

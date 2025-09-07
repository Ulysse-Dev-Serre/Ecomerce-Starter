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
      <h2 className="text-lg font-medium text-gray-900 mb-6">
        Votre commande
      </h2>

      {/* Items list with photos and descriptions */}
      <div className="space-y-4 mb-8">
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
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  {productName}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Description du produit...
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Quantité: {item.quantity}
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
          <span className="text-gray-600">Taxes</span>
          <span className="text-gray-900">{formatPrice(taxes)}</span>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-gray-900">Total</span>
            <span className="text-base font-bold text-gray-900">
              {formatPrice(total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'

interface CartItem {
  id: string
  name: string
  price: number
  currency: string
  quantity: number
  image?: string
}

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
  items?: CartItem[]
}

export default function CartSidebar({
  isOpen,
  onClose,
  items = []
}: CartSidebarProps) {
  const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({})

  useEffect(() => {
    // Initialize local quantities when items change
    const quantities: Record<string, number> = {}
    items.forEach((item) => {
      quantities[item.id] = item.quantity
    })
    setLocalQuantities(quantities)
  }, [items])

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) return

    // Update local quantity immediately for better UX
    setLocalQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity
    }))
  }

  const total = items.reduce((sum, item) => {
    const quantity = localQuantities[item.id] || item.quantity
    return sum + (item.price * quantity)
  }, 0)

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 right-0 h-full w-96 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Votre panier ({items.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">🛒</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Votre panier est vide
              </h3>
              <p className="text-gray-500 text-sm">
                Ajoutez des produits pour commencer vos achats
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <img 
                    src={item.image || '/placeholder-product.png'} 
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-md bg-gray-100"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">
                      {item.price.toFixed(2)} {item.currency}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, (localQuantities[item.id] || item.quantity) - 1)}
                        className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center text-gray-800 hover:bg-gray-200"
                        disabled={(localQuantities[item.id] || item.quantity) <= 1}
                      >
                        -
                      </button>
                      <span className="text-sm font-medium w-8 text-center text-gray-900">
                        {localQuantities[item.id] || item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, (localQuantities[item.id] || item.quantity) + 1)}
                        className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center text-gray-800 hover:bg-gray-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button className="text-red-500 hover:text-red-700 p-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-xl font-bold text-blue-600">
                {total.toFixed(2)} CAD
              </span>
            </div>
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Procéder au checkout
            </button>
          </div>
        )}
      </div>
    </>
  )
}

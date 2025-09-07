'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import { useCart } from '../../contexts/CartContext'

interface CartItem {
  id: string
  quantity: number
  variant: {
    id: string
    sku: string
    price: string
    currency: string
    product: {
      translations: {
        name: string
      }[]
    }
    media: {
      url: string
      alt: string
      isPrimary: boolean
    }[]
  }
}

interface Cart {
  id: string
  items: CartItem[]
}

export default function CartPage() {
  const { data: session } = useSession()
  const { removeFromCart, updateQuantity } = useCart()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingItem, setProcessingItem] = useState<string | null>(null)
  const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({})

  useEffect(() => {
    if (session?.user?.id) {
      fetchCart()
    } else {
      setLoading(false)
    }
  }, [session])

  const fetchCart = async () => {
    try {
      const response = await fetch(`/api/cart/${session?.user?.id}`)
      const data = await response.json()
      setCart(data.data)

      // Initialize local quantities with server data
      if (data.data?.items) {
        const quantities: Record<string, number> = {}
        data.data.items.forEach((item: CartItem) => {
          quantities[item.id] = item.quantity
        })
        setLocalQuantities(quantities)
      }
    } catch (error) {
      console.error('Erreur chargement panier:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId)
      return
    }

    // Update local quantity immediately for better UX
    setLocalQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity
    }))
  }

  const handleBatchUpdateQuantities = async () => {
    if (!cart?.items) return true

    setProcessingItem('batch-update')

    try {
      // Update all quantities that have changed
      const updatePromises = cart.items.map(async (item) => {
        const localQuantity = localQuantities[item.id]
        if (localQuantity && localQuantity !== item.quantity) {
          return updateQuantity(item.id, localQuantity)
        }
        return true
      })

      const results = await Promise.all(updatePromises)
      const allSuccessful = results.every(result => result === true)

      if (!allSuccessful) {
        alert('Erreur lors de la mise à jour de certaines quantités')
        return false
      }

      return true
    } catch (error) {
      console.error('Erreur batch update:', error)
      alert('Erreur lors de la mise à jour des quantités')
      return false
    } finally {
      setProcessingItem(null)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article du panier ?')) {
      return
    }

    setProcessingItem(itemId)
    const success = await removeFromCart(itemId)
    
    if (success) {
      fetchCart() // Refresh local cart data
    } else {
      alert('Erreur lors de la suppression de l\'article')
    }
    setProcessingItem(null)
  }

  const total = cart?.items.reduce((sum, item) => {
    const quantity = localQuantities[item.id] || item.quantity
    return sum + (parseFloat(item.variant?.price || '0') * quantity)
  }, 0) || 0

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Connexion requise
            </h2>
            <p className="text-gray-600 mb-6">
              Vous devez être connecté pour voir votre panier
            </p>
            <Link 
              href="/auth"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du panier...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Votre panier
          </h1>

          {!cart || cart.items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🛒</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Votre panier est vide
              </h3>
              <p className="text-gray-600 mb-6">
                Ajoutez des produits pour commencer vos achats
              </p>
              <Link 
                href="/shop"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
              >
                Continuer les achats
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Items du panier */}
              <div className="lg:col-span-2 space-y-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                        {item.variant?.media?.[0] ? (
                          <img 
                            src={item.variant.media[0].url} 
                            alt={item.variant.media[0].alt}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-gray-400 text-2xl">📱</span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {item.variant?.product?.translations?.[0]?.name || 'Produit'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          SKU: {item.variant?.sku || 'N/A'}
                        </p>
                        <p className="text-lg font-bold text-blue-600 mt-1">
                          {parseFloat(item.variant?.price || '0').toFixed(2)} {item.variant?.currency || 'CAD'}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, (localQuantities[item.id] || item.quantity) - 1)}
                          className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center text-gray-800 hover:bg-gray-200 disabled:opacity-50"
                          disabled={(localQuantities[item.id] || item.quantity) <= 1}
                        >
                          -
                        </button>
                        <span className="text-lg font-medium w-8 text-center text-gray-900">
                          {localQuantities[item.id] || item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, (localQuantities[item.id] || item.quantity) + 1)}
                          className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center text-gray-800 hover:bg-gray-200 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 p-2 disabled:opacity-50 transition-colors"
                        disabled={processingItem === item.id}
                        title="Supprimer cet article"
                      >
                        {processingItem === item.id ? (
                          <div className="w-5 h-5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Résumé commande */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6 sticky top-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Résumé de la commande
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-900">Sous-total</span>
                      <span className="font-medium text-gray-900">{total.toFixed(2)} CAD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-900">Livraison</span>
                      <span className="font-medium text-gray-900">
                        {total >= 75 ? 'Gratuite' : '9.99 CAD'}
                      </span>
                    </div>
                    {total >= 75 && (
                      <div className="text-sm text-green-600">
                        ✅ Livraison gratuite activée !
                      </div>
                    )}
                    <div className="border-t pt-3 flex justify-between text-lg font-bold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-blue-600">
                        {(total + (total >= 75 ? 0 : 9.99)).toFixed(2)} CAD
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={async () => {
                      const success = await handleBatchUpdateQuantities()
                      if (success) {
                        window.location.href = '/checkout'
                      }
                    }}
                    disabled={processingItem === 'batch-update'}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingItem === 'batch-update' ? 'Mise à jour...' : 'Procéder au paiement'}
                  </button>
                  
                  <Link 
                    href="/shop"
                    className="block text-center text-gray-600 hover:text-blue-600 mt-4 transition-colors"
                  >
                    ← Continuer les achats
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

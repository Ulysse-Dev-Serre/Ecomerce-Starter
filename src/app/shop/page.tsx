'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import { useCart } from '../../contexts/CartContext'
import Toast from '../../components/ui/Toast'

interface Product {
  id: string
  slug: string
  translations: {
    name: string
    description: string
  }[]
  variants: {
    id: string
    sku: string
    price: string
    currency: string
    stock: number
    media: {
      url: string
      alt: string
      isPrimary: boolean
    }[]
  }[]
}

export default function ShopPage() {
  const { data: session } = useSession()
  const { addToCart: addToCartContext } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetch('/api/products?language=FR')
      .then(res => res.json())
      .then(data => {
        setProducts(data.data || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Erreur chargement produits:', err)
        setLoading(false)
      })
  }, [])

  const addToCart = async (variantId: string, productName: string) => {
    if (!session?.user?.id) {
      window.location.href = '/auth'
      return
    }

    setAddingToCart(variantId)
    
    const success = await addToCartContext(variantId, 1)
    
    if (success) {
      setToast({ message: `${productName} ajouté au panier !`, type: 'success' })
    } else {
      setToast({ message: 'Erreur lors de l\'ajout au panier', type: 'error' })
    }
    
    setAddingToCart(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des produits...</p>
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
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Notre boutique
            </h1>
            <p className="text-gray-600">
              Découvrez notre sélection de produits de qualité
            </p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun produit disponible
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Créez des données de test pour voir les produits
              </p>
              <button
                onClick={() => {
                  fetch('/api/test-data', { method: 'POST' })
                    .then(() => window.location.reload())
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Créer des données de test
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/products/${product.id}`}>
                    <div className="aspect-square bg-gray-200 flex items-center justify-center cursor-pointer">
                      {product.variants[0]?.media[0] ? (
                        <img 
                          src={product.variants[0].media[0].url} 
                          alt={product.variants[0].media[0].alt}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      ) : (
                        <span className="text-gray-400 text-4xl">📱</span>
                      )}
                    </div>
                  </Link>
                  
                  <div className="p-6">
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-semibold text-gray-900 mb-2 text-lg hover:text-blue-600 cursor-pointer transition-colors">
                        {product.translations[0]?.name || 'Produit'}
                      </h3>
                    </Link>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.translations[0]?.description || 'Description non disponible'}
                    </p>
                    
                    <div className="flex justify-between items-center mb-4">
                      <Link 
                        href={`/products/${product.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Voir les détails →
                      </Link>
                      <span className="text-xs text-gray-500">
                        {product.variants.length} variante{product.variants.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    {product.variants.map((variant) => (
                      <div key={variant.id} className="border-t pt-4 mt-4 first:border-t-0 first:pt-0 first:mt-0">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="text-xl font-bold text-blue-600">
                              {parseFloat(variant.price).toFixed(2)} {variant.currency}
                            </div>
                            <div className="text-sm text-gray-500">
                              SKU: {variant.sku}
                            </div>
                          </div>
                          <div className={`text-sm px-2 py-1 rounded ${
                            variant.stock > 10 
                              ? 'bg-green-100 text-green-800' 
                              : variant.stock > 0 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {variant.stock > 0 ? `${variant.stock} en stock` : 'Épuisé'}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => addToCart(variant.id, product.translations[0]?.name || 'Produit')}
                          disabled={variant.stock === 0 || addingToCart === variant.id}
                          className={`w-full py-2 rounded-lg font-medium transition-colors ${
                            variant.stock === 0 
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {addingToCart === variant.id 
                            ? 'Ajout en cours...' 
                            : variant.stock === 0 
                            ? 'Épuisé' 
                            : 'Ajouter au panier'
                          }
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      
      {/* Toast Notifications */}
      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

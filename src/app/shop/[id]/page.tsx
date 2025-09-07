'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../../../components/layout/Navbar'
import Footer from '../../../components/layout/Footer'
import ImageGallery from '../../../components/product/ImageGallery'
import { useCart } from '../../../contexts/CartContext'
import Toast from '../../../components/ui/Toast'

interface Media {
  id: string
  url: string
  alt: string
  isPrimary: boolean
}

interface Variant {
  id: string
  sku: string
  price: number | string
  currency: string
  stock: number
  media: Media[]
  attributes: Array<{
    name: string
    value: string
  }>
}

interface Product {
  id: string
  slug: string
  status: string
  createdAt: string
  translations: Array<{
    language: string
    name: string
    description: string
  }>
  variants: Variant[]
  categories: Array<{
    id: string
    name: string
  }>
}

export default function ProductDetailPage() {
  const { data: session } = useSession()
  const { addToCart: addToCartContext } = useCart()
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetchProduct()
  }, [productId])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}?language=FR`)
      const data = await response.json()

      if (response.ok) {
        setProduct(data.data)
        // Select first variant by default
        if (data.data.variants.length > 0) {
          setSelectedVariant(data.data.variants[0].id)
        }
      } else {
        setError(data.error || 'Produit non trouvé')
      }
    } catch (err) {
      setError('Erreur lors du chargement du produit')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!session?.user?.id) {
      router.push('/auth')
      return
    }

    if (!selectedVariant) {
      setToast({ message: 'Veuillez sélectionner une variante', type: 'error' })
      return
    }

    setAddingToCart(true)

    const success = await addToCartContext(selectedVariant, quantity)

    if (success) {
      setToast({
        message: `${quantity} ${product?.translations[0]?.name || 'produit'}(s) ajouté(s) au panier !`,
        type: 'success'
      })
    } else {
      setToast({ message: 'Erreur lors de l\'ajout au panier', type: 'error' })
    }

    setAddingToCart(false)
  }

  const selectedVariantData = product?.variants.find(v => v.id === selectedVariant)

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du produit...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Produit non trouvé</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/shop"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retour à la boutique
            </Link>
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
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li><Link href="/" className="hover:text-gray-700">Accueil</Link></li>
              <li>›</li>
              <li><Link href="/shop" className="hover:text-gray-700">Boutique</Link></li>
              <li>›</li>
              <li className="text-gray-900 font-medium">
                {product.translations[0]?.name || 'Produit'}
              </li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div>
              <ImageGallery
                images={selectedVariantData?.media || []}
                productName={product.translations[0]?.name || 'Produit'}
              />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Title and Price */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.translations[0]?.name || 'Produit sans nom'}
                </h1>

                {product.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.categories.map((category) => (
                      <span
                        key={category.id}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                )}

                {selectedVariantData && (
                  <div className="text-3xl font-bold text-blue-600">
                    {parseFloat(selectedVariantData.price.toString()).toFixed(2)} {selectedVariantData.currency}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {product.translations[0]?.description || 'Aucune description disponible.'}
                </p>
              </div>

              {/* Variant Selection */}
              {product.variants.length > 1 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Variantes disponibles</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {product.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedVariant === variant.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedVariant(variant.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-900">
                              SKU: {variant.sku}
                            </div>
                            {variant.attributes.length > 0 && (
                              <div className="text-sm text-gray-600 mt-1">
                                {variant.attributes.map(attr => `${attr.name}: ${attr.value}`).join(', ')}
                              </div>
                            )}
                            <div className="text-lg font-bold text-blue-600 mt-2">
                              {parseFloat(variant.price.toString()).toFixed(2)} {variant.currency}
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
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity and Add to Cart */}
              {selectedVariantData && selectedVariantData.stock > 0 && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                      Quantité
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                      >
                        −
                      </button>
                      <input
                        id="quantity"
                        type="number"
                        min="1"
                        max={selectedVariantData.stock}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Math.min(selectedVariantData.stock, parseInt(e.target.value) || 1)))}
                        className="w-20 text-center border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => setQuantity(Math.min(selectedVariantData.stock, quantity + 1))}
                        className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                      >
                        +
                      </button>
                      <span className="text-sm text-gray-500">
                        / {selectedVariantData.stock} disponible{selectedVariantData.stock > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {addingToCart ? 'Ajout en cours...' : `Ajouter ${quantity > 1 ? `${quantity} articles` : '1 article'} au panier`}
                  </button>
                </div>
              )}

              {/* Out of Stock */}
              {selectedVariantData && selectedVariantData.stock === 0 && (
                <div className="text-center py-6">
                  <div className="text-gray-400 text-2xl mb-2">📦</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Produit épuisé</h3>
                  <p className="text-gray-500 text-sm">Cette variante n'est pas disponible pour le moment</p>
                </div>
              )}

              {/* Product Details */}
              {selectedVariantData && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Détails du produit</h3>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="font-medium text-gray-700">SKU:</dt>
                      <dd className="text-gray-900">{selectedVariantData.sku}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-700">Stock:</dt>
                      <dd className="text-gray-900">{selectedVariantData.stock} unité{selectedVariantData.stock > 1 ? 's' : ''}</dd>
                    </div>
                    {selectedVariantData.attributes.map((attr, index) => (
                      <div key={index}>
                        <dt className="font-medium text-gray-700">{attr.name}:</dt>
                        <dd className="text-gray-900">{attr.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </div>
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

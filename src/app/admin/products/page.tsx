'use client'

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"

interface ProductVariant {
  id: string
  sku: string
  price: number
  currency: string
  stock: number
  media: Array<{
    id: string
    url: string
    alt: string
    isPrimary: boolean
  }>
}

interface ProductTranslation {
  language: string
  name: string
  description: string
}

interface Product {
  id: string
  slug: string
  status: string
  createdAt: string
  translations: ProductTranslation[]
  variants: ProductVariant[]
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products)
      } else {
        setError('Erreur lors du chargement des produits')
      }
    } catch (err) {
      setError('Erreur réseau')
    } finally {
      setIsLoading(false)
    }
  }

  const updateStock = async (variantId: string, newStock: number) => {
    try {
      const response = await fetch(`/api/admin/products/variants/${variantId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      })
      
      if (response.ok) {
        fetchProducts() // Refresh the list
      } else {
        setError('Erreur lors de la mise à jour du stock')
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour du stock')
    }
  }

  const toggleProductStatus = async (productId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        fetchProducts() // Refresh the list
      } else {
        setError('Erreur lors de la mise à jour du statut')
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour du statut')
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return
    
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchProducts() // Refresh the list
      } else {
        setError('Erreur lors de la suppression')
      }
    } catch (err) {
      setError('Erreur lors de la suppression')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Produits</h1>
        <Link 
          href="/admin/products/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ajouter un produit
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-500 ml-2 underline"
          >
            Fermer
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Liste des produits ({products.length})</h2>
        </div>
        
        {products.length === 0 ? (
          <div className="p-6">
            <p className="text-gray-500 text-center py-8">
              Aucun produit pour le moment. 
              <Link href="/admin/products/add" className="text-blue-600 hover:underline ml-1">
                Créez votre premier produit
              </Link>
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.translations[0]?.name || 'Sans nom'}
                        </div>
                        <div className="text-sm text-gray-500">{product.slug}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        // Find the first primary image across all variants
                        const primaryImage = product.variants
                          .flatMap(v => v.media)
                          .find(m => m.isPrimary) || 
                          product.variants.flatMap(v => v.media)[0]
                        
                        return primaryImage ? (
                          <div className="w-12 h-12 relative">
                            <Image
                              src={primaryImage.url}
                              alt={primaryImage.alt || 'Image produit'}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800'
                          : product.status === 'INACTIVE'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.variants[0] ? `${product.variants[0].price} ${product.variants[0].currency}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.variants.map((variant) => (
                        <div key={variant.id} className="flex items-center space-x-2 mb-2">
                          <span className="text-sm text-gray-500">{variant.sku}:</span>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => updateStock(variant.id, Math.max(0, variant.stock - 1))}
                              className="w-6 h-6 bg-red-100 text-red-600 rounded hover:bg-red-200 flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="w-12 text-center text-sm font-medium">{variant.stock}</span>
                            <button
                              onClick={() => updateStock(variant.id, variant.stock + 1)}
                              className="w-6 h-6 bg-green-100 text-green-600 rounded hover:bg-green-200 flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Modifier
                      </Link>
                      <button
                        onClick={() => toggleProductStatus(product.id, product.status)}
                        className={`${
                          product.status === 'ACTIVE' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {product.status === 'ACTIVE' ? 'Masquer' : 'Activer'}
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

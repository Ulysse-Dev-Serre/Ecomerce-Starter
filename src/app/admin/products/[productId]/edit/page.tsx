'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

type Language = 'FR' | 'EN'

interface Translation {
  language: Language
  name: string
  description: string
}

interface Variant {
  id: string
  sku: string
  price: number
  currency: string
  stock: number
  attributes: Array<{ attributeName: string; value: string }>
  media: Array<{ url: string; alt: string; isPrimary: boolean }>
}

interface ProductData {
  id: string
  slug: string
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  translations: Translation[]
  categories: string[]
  variants: Variant[]
}

interface ValidationErrors {
  slug?: string
  translations?: { [index: number]: { name?: string; description?: string } }
  variants?: { [index: number]: { sku?: string; price?: string } }
  general?: string
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.productId as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [formData, setFormData] = useState<ProductData | null>(null)

  useEffect(() => {
    fetchProduct()
  }, [productId])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`)
      if (response.ok) {
        const data = await response.json()
        setFormData({
          id: data.product.id,
          slug: data.product.slug,
          status: data.product.status,
          translations: data.product.translations,
          categories: data.product.categories?.map((c: any) => c.categoryId) || [],
          variants: data.product.variants
        })
      } else {
        setErrors({ general: 'Erreur lors du chargement du produit' })
      }
    } catch (error) {
      setErrors({ general: 'Erreur réseau lors du chargement' })
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}
    
    if (!formData) return false
    
    // Validate slug
    if (!formData.slug.trim()) {
      newErrors.slug = 'Le slug est obligatoire'
    }
    
    // Validate translations: each started translation must be complete
    let hasValidTranslation = false
    newErrors.translations = {}
    
    formData.translations.forEach((translation, index) => {
      const hasName = translation.name.trim()
      const hasDescription = translation.description.trim()
      
      // If either field is filled, both must be filled
      if (hasName || hasDescription) {
        if (!hasName) {
          newErrors.translations![index] = { ...newErrors.translations![index], name: 'Le nom est obligatoire' }
        }
        if (!hasDescription) {
          newErrors.translations![index] = { ...newErrors.translations![index], description: 'La description est obligatoire' }
        }
      }
      
      // Track if we have at least one complete translation
      if (hasName && hasDescription) {
        hasValidTranslation = true
      }
    })
    
    // Must have at least one complete translation
    if (!hasValidTranslation) {
      newErrors.general = 'Au moins une traduction complète (nom + description) est requise'
    }
    
    // Clean up empty translation errors
    if (Object.keys(newErrors.translations).length === 0) {
      delete newErrors.translations
    }
    
    // Validate variants
    const validVariants = formData.variants.filter(v => v.sku.trim() && v.price > 0)
    if (validVariants.length === 0) {
      newErrors.general = (newErrors.general ? newErrors.general + '. ' : '') + 'Au moins une variante complète (SKU + prix > 0) est requise'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData || !validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    setErrors({})
    
    try {
      // Create a PUT endpoint for full product updates
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/admin/products')
      } else {
        setErrors({ general: data.error || 'Erreur lors de la mise à jour du produit' })
      }
    } catch (error) {
      setErrors({ general: 'Erreur réseau lors de la mise à jour du produit' })
    }
    setIsSubmitting(false)
  }

  const updateFormData = (updates: Partial<ProductData>) => {
    if (formData) {
      setFormData(prev => ({ ...prev!, ...updates }))
    }
  }

  const updateTranslation = (index: number, field: keyof Translation, value: string) => {
    if (formData) {
      const newTranslations = [...formData.translations]
      newTranslations[index] = { ...newTranslations[index], [field]: value }
      updateFormData({ translations: newTranslations })
    }
  }

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    if (formData) {
      const newVariants = [...formData.variants]
      newVariants[index] = { ...newVariants[index], [field]: value }
      updateFormData({ variants: newVariants })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Produit non trouvé</p>
        <Link href="/admin/products" className="text-blue-600 hover:underline">
          Retour à la liste
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-2">
          <Link href="/admin/products" className="text-blue-600 hover:text-blue-800">
            ← Retour à la liste
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Modifier le produit</h1>
        <p className="text-gray-600">ID: {formData.id}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Informations du produit</h2>
        </div>
        
        <div className="p-6 space-y-6">
          {/* General Error Message */}
          {errors.general && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Erreur de validation</h3>
                  <div className="mt-2 text-sm text-red-700">{errors.general}</div>
                </div>
              </div>
            </div>
          )}

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug du produit *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => updateFormData({ slug: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                errors.slug ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
              }`}
              placeholder="mon-super-produit"
            />
            {errors.slug && (
              <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut *
            </label>
            <select
              value={formData.status}
              onChange={(e) => updateFormData({ status: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="DRAFT">Brouillon</option>
              <option value="ACTIVE">Actif</option>
              <option value="INACTIVE">Inactif</option>
              <option value="ARCHIVED">Archivé</option>
            </select>
          </div>

          {/* Translations */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Traductions</h3>
            {formData.translations.map((translation, index) => (
              <div key={translation.language} className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-3">
                  {translation.language === 'FR' ? 'Français' : 'Anglais'}
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du produit
                    </label>
                    <input
                      type="text"
                      value={translation.name}
                      onChange={(e) => updateTranslation(index, 'name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                        errors.translations?.[index]?.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nom du produit"
                    />
                    {errors.translations?.[index]?.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.translations[index].name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={translation.description}
                      onChange={(e) => updateTranslation(index, 'description', e.target.value)}
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                        errors.translations?.[index]?.description ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Description du produit"
                    />
                    {errors.translations?.[index]?.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.translations[index].description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Variants */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Variantes du produit</h3>
            {formData.variants.map((variant, index) => (
              <div key={variant.id} className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-4">Variante {index + 1}</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU *
                    </label>
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                        errors.variants?.[index]?.sku ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                      }`}
                      placeholder="SKU-123"
                    />
                    {errors.variants?.[index]?.sku && (
                      <p className="mt-1 text-sm text-red-600">{errors.variants[index].sku}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prix *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={variant.price}
                      onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                        errors.variants?.[index]?.price ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                      }`}
                      placeholder="29.99"
                    />
                    {errors.variants?.[index]?.price && (
                      <p className="mt-1 text-sm text-red-600">{errors.variants[index].price}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Devise
                    </label>
                    <select
                      value={variant.currency}
                      onChange={(e) => updateVariant(index, 'currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="CAD">CAD</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between px-6 py-4 border-t bg-gray-50">
          <Link
            href="/admin/products"
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Annuler
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Mise à jour...' : 'Mettre à jour le produit'}
          </button>
        </div>
      </form>
    </div>
  )
}

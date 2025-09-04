'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Language = 'FR' | 'EN'

interface Translation {
  language: Language
  name: string
  description: string
}

interface Variant {
  sku: string
  price: number
  currency: string
  stock: number
  attributes: Array<{ attributeName: string; value: string }>
  media: Array<{ url: string; alt: string; isPrimary: boolean }>
}

interface ProductFormData {
  slug: string
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  translations: Translation[]
  categories: string[]
  variants: Variant[]
}

const steps = [
  { id: 1, name: 'Informations de base', description: 'Nom, description et détails' },
  { id: 2, name: 'Variantes', description: 'Prix, SKU et stock' },
  { id: 3, name: 'Médias', description: 'Images et vidéos' },
  { id: 4, name: 'Catégories', description: 'Classification' },
  { id: 5, name: 'Prévisualisation', description: 'Vérification finale' }
]

export default function AddProductPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<ProductFormData>({
    slug: '',
    status: 'DRAFT',
    translations: [
      { language: 'FR', name: '', description: '' },
      { language: 'EN', name: '', description: '' }
    ],
    categories: [],
    variants: [
      {
        sku: '',
        price: 0,
        currency: 'CAD',
        stock: 0,
        attributes: [],
        media: []
      }
    ]
  })

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/admin/products')
      } else {
        console.error('Erreur lors de la création du produit')
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
    setIsSubmitting(false)
  }

  const updateFormData = (updates: Partial<ProductFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const updateTranslation = (index: number, field: keyof Translation, value: string) => {
    const newTranslations = [...formData.translations]
    newTranslations[index] = { ...newTranslations[index], [field]: value }
    updateFormData({ translations: newTranslations })
  }

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const newVariants = [...formData.variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    updateFormData({ variants: newVariants })
  }

  const addVariant = () => {
    updateFormData({
      variants: [...formData.variants, {
        sku: '',
        price: 0,
        currency: 'CAD',
        stock: 0,
        attributes: [],
        media: []
      }]
    })
  }

  const removeVariant = (index: number) => {
    if (formData.variants.length > 1) {
      const newVariants = formData.variants.filter((_, i) => i !== index)
      updateFormData({ variants: newVariants })
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ajouter un nouveau produit</h1>
        <p className="text-gray-600">Créez un nouveau produit en suivant les étapes ci-dessous</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex-1">
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                    step.id <= currentStep
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-400 border-gray-300'
                  }`}
                >
                  {step.id}
                </div>
                <div className="ml-4 min-w-0 flex-1">
                  <p className={`text-sm font-medium ${step.id <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 ml-4 ${step.id < currentStep ? 'bg-blue-600' : 'bg-gray-300'}`} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{steps[currentStep - 1].name}</h2>
        </div>
        <div className="p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug du produit
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => updateFormData({ slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="mon-super-produit"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                          placeholder="Nom du produit"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={translation.description}
                          onChange={(e) => updateTranslation(index, 'description', e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                          placeholder="Description du produit"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Variants */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Variantes du produit</h3>
                <button
                  onClick={addVariant}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Ajouter une variante
                </button>
              </div>

              {formData.variants.map((variant, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-700">Variante {index + 1}</h4>
                    {formData.variants.length > 1 && (
                      <button
                        onClick={() => removeVariant(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                        placeholder="SKU-123"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prix (CAD)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={variant.price}
                        onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                        placeholder="29.99"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock
                      </label>
                      <input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
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
          )}

          {/* Steps 3, 4, 5 - Simplified for now */}
          {currentStep === 3 && (
            <div className="text-center py-8">
              <p className="text-gray-600">Section médias - À implémenter</p>
            </div>
          )}

          {currentStep === 4 && (
            <div className="text-center py-8">
              <p className="text-gray-600">Section catégories - À implémenter</p>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Prévisualisation du produit</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium">{formData.translations[0].name || 'Sans nom'}</h4>
                <p className="text-sm text-gray-600">{formData.slug}</p>
                <p className="text-sm text-gray-600">Status: {formData.status}</p>
                <p className="text-sm text-gray-600">{formData.variants.length} variante(s)</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between px-6 py-4 border-t bg-gray-50">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="px-4 py-2 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>

          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Création...' : 'Créer le produit'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

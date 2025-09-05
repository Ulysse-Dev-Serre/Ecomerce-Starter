'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

interface Media {
  id?: string
  url: string
  alt: string
  isPrimary: boolean
}

interface MediaManagerProps {
  variantId?: string
  medias: Media[]
  onChange: (medias: Media[]) => void
  disabled?: boolean
}

export default function MediaManager({ variantId, medias, onChange, disabled = false }: MediaManagerProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Reset previous errors
    setUploadError(null)
    setIsUploading(true)

    try {
      // Upload file
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        // Add new media to list
        const newMedia: Media = {
          url: data.url,
          alt: '',
          isPrimary: medias.length === 0 // First image is primary by default
        }

        // If it's the first image, mark it as primary
        const updatedMedias = [...medias, newMedia]
        onChange(updatedMedias)

        // If we have a variantId (editing existing product), save to database
        if (variantId) {
          await saveMediaToVariant(variantId, newMedia)
        }
      } else {
        setUploadError(data.error || 'Erreur lors de l\'upload')
      }
    } catch (error) {
      setUploadError('Erreur réseau lors de l\'upload')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const saveMediaToVariant = async (variantId: string, media: Media) => {
    try {
      const response = await fetch(`/api/admin/products/variants/${variantId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(media)
      })

      if (!response.ok) {
        const data = await response.json()
        setUploadError(data.error || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      setUploadError('Erreur lors de la sauvegarde du média')
    }
  }

  const updateMedia = async (index: number, updates: Partial<Media>) => {
    const updatedMedias = [...medias]
    const media = updatedMedias[index]
    
    // If setting as primary, unset others
    if (updates.isPrimary === true) {
      updatedMedias.forEach((m, i) => {
        if (i !== index) m.isPrimary = false
      })
    }
    
    updatedMedias[index] = { ...media, ...updates }
    onChange(updatedMedias)

    // If we have a variantId and mediaId, update in database
    if (variantId && media.id) {
      try {
        const response = await fetch(`/api/admin/media/${media.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        })

        if (!response.ok) {
          const data = await response.json()
          setUploadError(data.error || 'Erreur lors de la mise à jour')
        }
      } catch (error) {
        setUploadError('Erreur lors de la mise à jour du média')
      }
    }
  }

  const deleteMedia = async (index: number) => {
    const media = medias[index]
    const updatedMedias = medias.filter((_, i) => i !== index)
    
    // If deleted media was primary and there are remaining medias, make first one primary
    if (media.isPrimary && updatedMedias.length > 0) {
      updatedMedias[0].isPrimary = true
    }
    
    onChange(updatedMedias)

    // If we have a variantId and mediaId, delete from database
    if (variantId && media.id) {
      try {
        const response = await fetch(`/api/admin/media/${media.id}`, {
          method: 'DELETE'
        })

        if (!response.ok) {
          const data = await response.json()
          setUploadError(data.error || 'Erreur lors de la suppression')
        }
      } catch (error) {
        setUploadError('Erreur lors de la suppression du média')
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-gray-700">Images du produit (JPG, PNG)</h4>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Upload...' : 'Ajouter une image'}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{uploadError}</p>
          <button 
            onClick={() => setUploadError(null)}
            className="text-red-600 hover:text-red-500 text-sm underline mt-1"
          >
            Fermer
          </button>
        </div>
      )}

      {medias.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="mt-2">Aucune image pour cette variante</p>
            <p className="text-sm">Cliquez sur "Ajouter une image" pour commencer</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {medias.map((media, index) => (
            <div key={media.url} className="border rounded-lg p-3 space-y-3">
              <div className="relative aspect-square">
                <Image
                  src={media.url}
                  alt={media.alt || `Image ${index + 1}`}
                  fill
                  className="object-cover rounded"
                />
                {media.isPrimary && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                    Principale
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <input
                  type="text"
                  value={media.alt}
                  onChange={(e) => updateMedia(index, { alt: e.target.value })}
                  placeholder="Texte alternatif"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={disabled}
                />
                
                <div className="flex justify-between items-center">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={media.isPrimary}
                      onChange={(e) => updateMedia(index, { isPrimary: e.target.checked })}
                      className="mr-2"
                      disabled={disabled}
                    />
                    Principale
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => deleteMedia(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                    disabled={disabled}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

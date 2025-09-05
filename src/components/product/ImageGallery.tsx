'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Media {
  id: string
  url: string
  alt: string
  isPrimary: boolean
}

interface ImageGalleryProps {
  images: Media[]
  productName: string
}

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)

  if (images.length === 0) {
    return (
      <div className="w-full">
        <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center mb-4">
          <div className="text-center text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Aucune image</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Main Image */}
      <div className="aspect-square relative bg-gray-100 rounded-lg mb-4 overflow-hidden">
        <Image
          src={images[selectedImage].url}
          alt={images[selectedImage].alt || productName}
          fill
          className="object-cover"
          priority
        />
        {images[selectedImage].isPrimary && (
          <div className="absolute top-3 left-3">
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
              Image principale
            </span>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedImage(index)}
              className={`aspect-square relative rounded-lg overflow-hidden border-2 transition-colors ${
                selectedImage === index 
                  ? 'border-blue-600' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Image
                src={image.url}
                alt={image.alt || `${productName} ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <p className="text-center text-sm text-gray-500 mt-2">
          {selectedImage + 1} sur {images.length} images
        </p>
      )}
    </div>
  )
}

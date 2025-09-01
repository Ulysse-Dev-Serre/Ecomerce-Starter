'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function AccountLinkingContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.475 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Compte déjà existant
        </h1>
        
        <p className="text-gray-600 mb-6">
          Un compte avec cette adresse email existe déjà. Pour des raisons de sécurité, 
          nous ne pouvons pas lier automatiquement les comptes.
        </p>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              📧 Se connecter avec le compte existant
            </h3>
            <p className="text-blue-700 text-sm mb-3">
              Utilisez la méthode de connexion par email (magic link)
            </p>
            <Link 
              href="/auth"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Connexion par email
            </Link>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">
              🔄 Créer un nouveau compte
            </h3>
            <p className="text-gray-600 text-sm mb-3">
              Utilisez une adresse email différente pour Google
            </p>
            <button
              onClick={() => window.history.back()}
              className="inline-block bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors"
            >
              Retour à la connexion
            </button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Cette protection évite la prise de contrôle de compte par des tiers.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AccountLinkingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <AccountLinkingContent />
    </Suspense>
  )
}

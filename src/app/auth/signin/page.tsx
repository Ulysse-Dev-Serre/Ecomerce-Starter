'use client'

import { signIn, getProviders } from 'next-auth/react'
import { useState, useEffect } from 'react'

interface Provider {
  id: string
  name: string
}

export default function SignInPage() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null)

  useEffect(() => {
    getProviders().then(setProviders)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Connectez-vous à votre compte
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Accédez à votre panier et à vos commandes
          </p>
        </div>

        <div className="space-y-4">
          {providers && Object.values(providers).map((provider: Provider) => {
            if (provider.id === 'email') return null
            return (
              <div key={provider.name}>
                <button
                  onClick={() => signIn(provider.id, { callbackUrl: '/' })} // ← important
                  className={`
                    w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg text-sm font-medium transition-colors
                    ${provider.id === 'google' 
                      ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50' 
                      : provider.id === 'apple'
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                    }
                  `}
                >
                  Se connecter avec {provider.name}
                </button>
              </div>
            )
          })}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">ou</span>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const email = formData.get('email') as string
              signIn('email', { email, callbackUrl: '/' }) // ← important
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Adresse email"
              />
            </div>
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                S&apos;inscrire / Se connecter par email
              </button>
            </div>
          </form>
        </div>

        <div className="text-center space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              💡 <strong>Mode développement :</strong> La connexion par email affiche
              le lien dans la console du serveur.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


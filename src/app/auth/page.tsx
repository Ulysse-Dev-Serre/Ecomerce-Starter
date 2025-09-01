'use client'

import { signIn, getProviders, useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Provider {
  id: string
  name: string
}

export default function AuthPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null)
  const [authMethod, setAuthMethod] = useState<'social' | 'email'>('social')
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    getProviders().then(setProviders)
  }, [])

  // Redirect if already signed in
  useEffect(() => {
    if (status === 'authenticated' && session) {
      window.location.href = '/'
    }
  }, [session, status])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Connexion réussie !</h2>
          <p className="text-gray-600">Redirection en cours...</p>
        </div>
      </div>
    )
  }

  const handleEmailPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        setMessage({ text: 'Email ou mot de passe incorrect', type: 'error' })
      } else if (result?.ok) {
        setMessage({ text: 'Connexion réussie !', type: 'success' })
        setTimeout(() => window.location.href = '/', 1000)
      }
    } catch (error) {
      setMessage({ text: 'Une erreur est survenue', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLink = async () => {
    if (!email) {
      setMessage({ text: 'Veuillez entrer votre email', type: 'error' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      await signIn('email', { email, redirect: false })
      setMessage({ 
        text: 'Un lien de connexion a été envoyé à votre email', 
        type: 'success' 
      })
    } catch (error) {
      setMessage({ text: 'Erreur lors de l\'envoi', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-xl">🛍️</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Se connecter ou créer un compte
            </h1>
            <p className="text-gray-600">
              La première connexion crée votre compte automatiquement
            </p>
          </div>

          {/* Social Login (Priority) */}
          <div className="space-y-3">
            {providers && Object.values(providers).map((provider: Provider) => {
              if (provider.id === 'email' || provider.id === 'credentials') return null
              
              return (
                <button
                  key={provider.id}
                  onClick={() => signIn(provider.id)}
                  disabled={isLoading}
                  className={`
                    w-full flex items-center justify-center px-6 py-4 border rounded-xl text-base font-medium transition-all
                    ${provider.id === 'google' 
                      ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-md' 
                      : 'bg-black text-white hover:bg-gray-800'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {provider.id === 'google' && (
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  Continuer avec {provider.name}
                </button>
              )
            })}
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">ou continuer avec email</span>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-4 rounded-xl ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          {/* Auth Method Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setAuthMethod('social')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                authMethod === 'social' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Lien par email
            </button>
            <button
              onClick={() => setAuthMethod('email')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                authMethod === 'email' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Email + mot de passe
            </button>
          </div>

          {/* Email Input (always visible) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="votre@email.com"
            />
          </div>

          {/* Conditional Forms */}
          {authMethod === 'email' ? (
            /* Email + Password Form */
            <form onSubmit={handleEmailPassword} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 6 caractères
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Connexion...
                  </div>
                ) : (
                  'Continuer'
                )}
              </button>
            </form>
          ) : (
            /* Magic Link */
            <div className="space-y-4">
              <button
                onClick={handleMagicLink}
                disabled={isLoading || !email}
                className="w-full py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Envoi...
                  </div>
                ) : (
                  'Recevoir un lien de connexion'
                )}
              </button>
              
              <p className="text-center text-sm text-gray-500">
                Aucun mot de passe requis • Connexion sécurisée en 1 clic
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-500 leading-relaxed">
              En continuant, vous acceptez nos{' '}
              <a href="/terms" className="text-blue-600 hover:text-blue-500 underline">
                conditions d'utilisation
              </a>{' '}
              et notre{' '}
              <a href="/privacy" className="text-blue-600 hover:text-blue-500 underline">
                politique de confidentialité
              </a>.
            </p>
            
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                <p className="text-blue-800 text-sm">
                  💡 <strong>Mode développement :</strong> 
                  Configurez EMAIL_SERVER dans .env pour l'envoi d'emails réels.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700">
        <div className="flex items-center justify-center w-full px-8">
          <div className="text-center text-white max-w-lg">
            <div className="text-7xl mb-8">🛍️</div>
            <h1 className="text-4xl font-bold mb-6">
              L'expérience d'achat<br />
              que vous méritez
            </h1>
            <p className="text-xl text-blue-100 mb-12 leading-relaxed">
              Découvrez des produits exceptionnels, livraison rapide et service client 5 étoiles
            </p>
            
            {/* Features */}
            <div className="space-y-6">
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">Connexion en 10 secondes</h3>
                  <p className="text-blue-100">Google, Apple ou email magique</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">Panier intelligent</h3>
                  <p className="text-blue-100">Synchronisé sur tous vos appareils</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🔒</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">100% sécurisé</h3>
                  <p className="text-blue-100">Vos données sont protégées</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

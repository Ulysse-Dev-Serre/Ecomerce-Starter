'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'

interface Order {
  id: string
  status: string
  totalAmount: string
  currency: string
  createdAt: string
  items: {
    productSnapshot: {
      name: string
      sku: string
    }
    quantity: number
    priceSnapshot: string
  }[]
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchOrders()
    } else {
      setLoading(false)
    }
  }, [session])

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/users/${session?.user?.id}/orders`)
      const data = await response.json()
      setOrders(data.data || [])
    } catch (error) {
      console.error('Erreur chargement commandes:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Connexion requise
            </h2>
            <p className="text-gray-600 mb-6">
              Vous devez être connecté pour voir votre profil
            </p>
            <Link 
              href="/auth/signin"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de votre profil...</p>
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
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header Profile */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center space-x-4">
              <img 
                src={session.user?.image || '/default-avatar.png'} 
                alt={session.user?.name || 'User'}
                className="w-16 h-16 rounded-full border-2 border-gray-200"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {session.user?.name || 'Utilisateur'}
                </h1>
                <p className="text-gray-600">
                  {session.user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation profil */}
          <div className="bg-white rounded-lg border border-gray-200 mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button className="py-4 border-b-2 border-blue-600 text-blue-600 font-medium">
                  Commandes
                </button>
                <button className="py-4 text-gray-500 hover:text-gray-700">
                  Adresses
                </button>
                <button className="py-4 text-gray-500 hover:text-gray-700">
                  Paramètres
                </button>
              </nav>
            </div>

            {/* Historique des commandes */}
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Historique des commandes
              </h2>

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-4xl mb-4">📦</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune commande
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Vous n'avez pas encore passé de commande
                  </p>
                  <Link 
                    href="/shop"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
                  >
                    Découvrir nos produits
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Commande #{order.id.slice(-8)}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            order.status === 'DELIVERED' 
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'SHIPPED'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </div>
                          <div className="text-lg font-bold text-gray-900 mt-1">
                            {parseFloat(order.totalAmount).toFixed(2)} {order.currency}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {item.quantity}x {item.productSnapshot.name}
                            </span>
                            <span className="text-gray-900">
                              {parseFloat(item.priceSnapshot).toFixed(2)} CAD
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

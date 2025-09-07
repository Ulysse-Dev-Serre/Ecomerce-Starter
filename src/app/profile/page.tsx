'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import Avatar from '../../components/ui/Avatar'
import { generateCustomerInvoice } from '../../lib/pdf-generator'

interface Order {
  id: string
  status: string
  totalAmount: string
  currency: string
  createdAt: string
  shippingAddress?: any
  billingAddress?: any
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)

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

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderModal(true)
  }

  const closeOrderModal = () => {
    setShowOrderModal(false)
    setSelectedOrder(null)
  }

  const generateInvoice = (order: Order) => {
    // Generate invoice PDF for customer
    const customerInfo = {
      name: session?.user?.name || 'Client',
      email: session?.user?.email || ''
    }
    generateCustomerInvoice(order, customerInfo)
  }

  const parseAddress = (address: any): any => {
    if (!address) return null
    try {
      return typeof address === 'string' ? JSON.parse(address) : address
    } catch (error) {
      console.error('Error parsing address:', error)
      return null
    }
  }

  const calculateTaxes = (subtotal: number, shippingAddress: any) => {
    // Basic tax calculation for Canada/US
    const province = shippingAddress?.state || shippingAddress?.province
    let taxRate = 0
    let taxName = ''

    if (province === 'QC') {
      // Quebec: TPS 5% + TVQ 9.975%
      taxRate = 0.05 + 0.09975
      taxName = 'TPS/TVQ'
    } else if (province && ['ON', 'BC', 'NS', 'NB', 'PE', 'NL'].includes(province)) {
      // Other Canadian provinces: GST/HST 13-15%
      taxRate = 0.13
      taxName = 'GST/HST'
    } else if (shippingAddress?.country === 'US') {
      // US: No federal tax, varies by state
      taxRate = 0 // Could be enhanced with state-specific rates
      taxName = 'Tax'
    }

    const taxAmount = subtotal * taxRate
    return { taxAmount, taxRate, taxName }
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
              href="/auth"
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
              <Avatar 
                src={session.user?.image} 
                alt={session.user?.name}
                name={session.user?.name}
                size="lg"
                className="border-2 border-gray-200"
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
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleOrderClick(order)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
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

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500 text-center">
                          Cliquez pour voir les détails et télécharger la facture
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Détails de la commande #{selectedOrder.id.slice(-8)}
                </h3>
                <button
                  onClick={closeOrderModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  &times;
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Information */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Informations commande</h4>
                    <div className="space-y-2">
                      <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR')}</p>
                      <p><strong>Statut:</strong>
                        <span className={`ml-2 inline-block px-2 py-1 rounded-full text-sm font-medium ${
                          selectedOrder.status === 'DELIVERED'
                            ? 'bg-green-100 text-green-800'
                            : selectedOrder.status === 'SHIPPED'
                            ? 'bg-blue-100 text-blue-800'
                            : selectedOrder.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedOrder.status}
                        </span>
                      </p>
                      <p><strong>Client:</strong> {session?.user?.name || 'N/A'}</p>
                      <p><strong>Email:</strong> {session?.user?.email}</p>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {(() => {
                    const shippingAddr = parseAddress(selectedOrder.shippingAddress)
                    if (shippingAddr) {
                      return (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">Adresse de livraison</h4>
                          <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                            {(shippingAddr.line1 || shippingAddr.street) && (
                              <p><strong>Rue:</strong> {shippingAddr.line1 || shippingAddr.street}</p>
                            )}
                            {shippingAddr.line2 && (
                              <p><strong>Appartement:</strong> {shippingAddr.line2}</p>
                            )}
                            {shippingAddr.city && (
                              <p><strong>Ville:</strong> {shippingAddr.city}</p>
                            )}
                            {(shippingAddr.postal_code || shippingAddr.zipCode) && (
                              <p><strong>Code postal:</strong> {shippingAddr.postal_code || shippingAddr.zipCode}</p>
                            )}
                            {shippingAddr.state && (
                              <p><strong>Province:</strong> {shippingAddr.state}</p>
                            )}
                            {shippingAddr.country && (
                              <p><strong>Pays:</strong> {shippingAddr.country}</p>
                            )}
                          </div>
                        </div>
                      )
                    }
                    return null
                  })()}
                </div>

                {/* Order Items and Total */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Articles commandés</h4>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <div>
                            <p className="font-medium text-gray-900">{item.productSnapshot.name}</p>
                            <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                            <p className="text-sm text-gray-600">SKU: {item.productSnapshot.sku}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {parseFloat(item.priceSnapshot).toFixed(2)} {selectedOrder.currency}
                            </p>
                            <p className="text-sm text-gray-600">
                              Total: {(parseFloat(item.priceSnapshot) * item.quantity).toFixed(2)} {selectedOrder.currency}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Total */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total:</span>
                      <span className="text-xl font-bold text-gray-900">
                        {parseFloat(selectedOrder.totalAmount).toFixed(2)} {selectedOrder.currency}
                      </span>
                    </div>
                  </div>

                  {/* Tax Information */}
                  {(() => {
                    const shippingAddr = parseAddress(selectedOrder.shippingAddress)
                    const subtotal = selectedOrder.items.reduce((sum, item) =>
                      sum + (parseFloat(item.priceSnapshot) * item.quantity), 0
                    )
                    const taxInfo = calculateTaxes(subtotal, shippingAddr)

                    if (taxInfo.taxRate > 0) {
                      return (
                        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                          <p><strong>Taxes incluses ({taxInfo.taxName}):</strong> {taxInfo.taxAmount.toFixed(2)} {selectedOrder.currency}</p>
                          <p><strong>Taux:</strong> {(taxInfo.taxRate * 100).toFixed(2)}%</p>
                        </div>
                      )
                    }
                    return null
                  })()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={closeOrderModal}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Fermer
                </button>
                <button
                  onClick={() => generateInvoice(selectedOrder)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Télécharger la facture</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

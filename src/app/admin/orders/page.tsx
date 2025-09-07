'use client'

import { useState, useEffect } from 'react'
import { generateDeliveryLabel } from '../../../lib/pdf-generator'

interface ShippingAddress {
  line1?: string
  line2?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  // Fallback fields
  street?: string
  zipCode?: string
}

type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

interface Order {
  id: string
  status: OrderStatus
  totalAmount: number
  currency: string
  createdAt: string
  shippingAddress?: any
  billingAddress?: any
  user: {
    id: string
    email: string
    name?: string
  }
  items: Array<{
    id: string
    quantity: number
    priceSnapshot: number
    variant: {
      product: {
        translations: Array<{
          name: string
        }>
      }
    }
  }>
  payments: Array<{
    status: string
  }>
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showAddressModal, setShowAddressModal] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)

      const response = await fetch(`/api/admin/orders?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()
      console.log('Fetched orders:', data.orders?.length || 0, 'orders')
      setOrders(Array.isArray(data.orders) ? data.orders : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handlePrintLabel = (order: Order) => {
    generateDeliveryLabel(order)
  }

  const handleViewAddress = (order: Order) => {
    setSelectedOrder(order)
    setShowAddressModal(true)
  }

  const closeAddressModal = () => {
    setShowAddressModal(false)
    setSelectedOrder(null)
  }

  const createTestOrder = async () => {
    try {
      setLoading(true)
      // Use the current admin user ID for the test order
      const sessionResponse = await fetch('/api/auth/session')
      const sessionData = await sessionResponse.json()

      if (!sessionData?.user?.id) {
        throw new Error('No user session found')
      }

      const response = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: sessionData.user.id, // Use current admin user ID
          totalAmount: 99.99,
          currency: 'CAD',
          status: 'PAID'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create test order')
      }

      const data = await response.json()
      console.log('Test order created:', data)

      // Refresh the orders list
      await fetchOrders()
    } catch (err) {
      console.error('Error creating test order:', err)
      setError(err instanceof Error ? err.message : 'Failed to create test order')
    } finally {
      setLoading(false)
    }
  }

  const parseAddress = (address: any): ShippingAddress | null => {
    if (!address) return null

    try {
      if (typeof address === 'string') {
        return JSON.parse(address)
      }
      return address
    } catch (error) {
      console.error('Error parsing address:', error)
      return null
    }
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'PAID': return 'bg-blue-100 text-blue-800'
      case 'SHIPPED': return 'bg-purple-100 text-purple-800'
      case 'DELIVERED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error: {error}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Commandes</h1>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-600 bg-white text-gray-900 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm"
        >
          <option value="">Tous les statuts</option>
          <option value="PENDING">En attente</option>
          <option value="PAID">Payé</option>
          <option value="SHIPPED">Expédié</option>
          <option value="DELIVERED">Livré</option>
          <option value="CANCELLED">Annulé</option>
        </select>

        <div className="flex space-x-2">
          <button
            onClick={createTestOrder}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Créer commande test</span>
          </button>

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Liste des commandes ({orders.length})</h2>
        </div>

        {orders.length === 0 ? (
          <div className="p-6">
            <p className="text-gray-500 text-center py-8">
              Aucune commande trouvée
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Commande
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <button
                        onClick={() => handleViewAddress(order)}
                        className="text-blue-600 hover:text-blue-900 hover:underline"
                      >
                        {order.id.slice(-8)}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{order.user.name || 'N/A'}</div>
                        <div className="text-gray-500">{order.user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate">
                        {order.items.map((item, index) => (
                          <div key={item.id}>
                            {item.quantity}x {item.variant.product.translations[0]?.name || 'Produit'}
                            {index < order.items.length - 1 && ', '}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Number(order.totalAmount).toFixed(2)} {order.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handlePrintLabel(order)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md text-sm font-medium"
                      >
                        Imprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Address Modal */}
      {showAddressModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Adresse de livraison - Commande {selectedOrder.id.slice(-8)}
                </h3>
                <button
                  onClick={closeAddressModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Client</label>
                  <p className="text-sm text-gray-900">{selectedOrder.user.name || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.user.email}</p>
                </div>

                {(() => {
                  const shippingAddr = parseAddress(selectedOrder.shippingAddress)
                  const billingAddr = parseAddress(selectedOrder.billingAddress)

                  return (
                    <>
                      {shippingAddr && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Adresse de livraison
                          </label>
                          <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded space-y-1">
                            {(shippingAddr.line1 || shippingAddr.street) && (
                              <p><strong>Rue:</strong> {shippingAddr.line1 || shippingAddr.street}</p>
                            )}
                            {shippingAddr.line2 && (
                              <p><strong>Appartement:</strong> {shippingAddr.line2}</p>
                            )}
                            {(shippingAddr.city) && (
                              <p><strong>Ville:</strong> {shippingAddr.city}</p>
                            )}
                            {(shippingAddr.postal_code || shippingAddr.zipCode) && (
                              <p><strong>Code postal:</strong> {shippingAddr.postal_code || shippingAddr.zipCode}</p>
                            )}
                            {shippingAddr.state && (
                              <p><strong>Province/État:</strong> {shippingAddr.state}</p>
                            )}
                            {shippingAddr.country && (
                              <p><strong>Pays:</strong> {shippingAddr.country}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {billingAddr && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Adresse de facturation
                          </label>
                          <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded space-y-1">
                            {(billingAddr.line1 || billingAddr.street) && (
                              <p><strong>Rue:</strong> {billingAddr.line1 || billingAddr.street}</p>
                            )}
                            {billingAddr.line2 && (
                              <p><strong>Appartement:</strong> {billingAddr.line2}</p>
                            )}
                            {(billingAddr.city) && (
                              <p><strong>Ville:</strong> {billingAddr.city}</p>
                            )}
                            {(billingAddr.postal_code || billingAddr.zipCode) && (
                              <p><strong>Code postal:</strong> {billingAddr.postal_code || billingAddr.zipCode}</p>
                            )}
                            {billingAddr.state && (
                              <p><strong>Province/État:</strong> {billingAddr.state}</p>
                            )}
                            {billingAddr.country && (
                              <p><strong>Pays:</strong> {billingAddr.country}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {!shippingAddr && !billingAddr && (
                        <div className="text-center text-gray-500 py-4">
                          Aucune adresse disponible
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={closeAddressModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

interface CartContextType {
  cartCount: number
  refreshCart: () => void
  addToCart: (variantId: string, quantity?: number) => Promise<boolean>
  removeFromCart: (itemId: string) => Promise<boolean>
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [cartCount, setCartCount] = useState(0)

  const refreshCart = async () => {
    if (!session?.user?.id) {
      setCartCount(0)
      return
    }

    try {
      const response = await fetch(`/api/cart/${session.user.id}`)
      const data = await response.json()
      const count = data.data?.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0
      setCartCount(count)
    } catch (error) {
      console.error('Erreur refresh panier:', error)
    }
  }

  const addToCart = async (variantId: string, quantity = 1): Promise<boolean> => {
    if (!session?.user?.id) return false

    try {
      const response = await fetch(`/api/cart/${session.user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, quantity })
      })

      if (response.ok) {
        refreshCart()
        return true
      }
      return false
    } catch (error) {
      console.error('Erreur ajout panier:', error)
      return false
    }
  }

  const removeFromCart = async (itemId: string): Promise<boolean> => {
    if (!session?.user?.id) return false

    try {
      const response = await fetch(`/api/cart/${session.user.id}/${itemId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        refreshCart()
        return true
      }
      return false
    } catch (error) {
      console.error('Erreur suppression panier:', error)
      return false
    }
  }

  const updateQuantity = async (itemId: string, quantity: number): Promise<boolean> => {
    if (!session?.user?.id) return false

    try {
      const response = await fetch(`/api/cart/${session.user.id}/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      })

      if (response.ok) {
        refreshCart()
        return true
      }
      return false
    } catch (error) {
      console.error('Erreur modification quantité:', error)
      return false
    }
  }

  useEffect(() => {
    refreshCart()
  }, [session])

  return (
    <CartContext.Provider value={{ cartCount, refreshCart, addToCart, removeFromCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

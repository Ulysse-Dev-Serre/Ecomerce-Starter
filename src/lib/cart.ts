import { db, safeDbOperation } from './db'
import { CartStatus, Language } from '../generated/prisma'
import { cartWithItems } from './prisma/selectors'

// Get user's active cart (or create one)
export async function getOrCreateActiveCart(userId: string, language: Language = Language.FR) {
  return safeDbOperation(async () => {
    let cart = await db.cart.findFirst({
      where: { userId, status: CartStatus.ACTIVE },
      ...cartWithItems(language)
    })

    if (!cart) {
      cart = await db.cart.create({
        data: { userId, status: CartStatus.ACTIVE },
        ...cartWithItems(language)
      })
    }

    return cart
  })
}

// Add item to cart (atomic upsert)
export async function addToCart(userId: string, variantId: string, quantity = 1) {
  return safeDbOperation(async () => {
    return db.$transaction(async (tx) => {
      // Get or create cart
      let cart = await tx.cart.findFirst({
        where: { userId, status: CartStatus.ACTIVE }
      })

      if (!cart) {
        cart = await tx.cart.create({
          data: { userId, status: CartStatus.ACTIVE }
        })
      }

      // Upsert cart item (atomic - no race condition)
      return tx.cartItem.upsert({
        where: {
          cartId_variantId: { cartId: cart.id, variantId }
        },
        update: {
          quantity: { increment: quantity }
        },
        create: {
          cartId: cart.id,
          variantId,
          quantity
        }
      })
    })
  })
}

// Convert cart to order
export async function convertCartToOrder(userId: string, shippingAddress: object, billingAddress: object) {
  return safeDbOperation(async () => {
    return db.$transaction(async (tx) => {
      const cart = await tx.cart.findFirst({
        where: { userId, status: CartStatus.ACTIVE },
        include: { 
          items: { 
            include: { 
              variant: { 
                include: { 
                  product: {
                    include: {
                      translations: {
                        where: { language: 'EN' }
                      }
                    }
                  }
                }
              } 
            } 
          } 
        }
      })

      if (!cart || cart.items.length === 0) {
        throw new Error('No active cart found')
      }

      const totalAmount = cart.items.reduce((sum, item) => 
        sum + (item.variant.price.toNumber() * item.quantity), 0
      )

      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          shippingAddress,
          billingAddress,
          items: {
            create: cart.items.map(item => ({
              productId: item.variant.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              priceSnapshot: item.variant.price,
              currency: item.variant.currency,
              productSnapshot: {
                name: item.variant.product?.translations?.[0]?.name || 'Unknown',
                sku: item.variant.sku
              }
            }))
          }
        },
        include: { items: true }
      })

      await tx.cart.update({
        where: { id: cart.id },
        data: { status: CartStatus.CONVERTED }
      })

      return order
    })
  })
}

import { db, safeDbOperation } from './db'
import { CartStatus } from '../generated/prisma'

// Get user's active cart (or create one)
export async function getOrCreateActiveCart(userId: string) {
  return safeDbOperation(async () => {
    let cart = await db.cart.findFirst({
      where: { userId, status: CartStatus.ACTIVE },
      include: { 
        items: { 
          include: { 
            variant: {
              include: {
                product: {
                  include: {
                    translations: {
                      where: { language: 'FR' }
                    }
                  }
                },
                media: true
              }
            }
          } 
        } 
      }
    })

    if (!cart) {
      cart = await db.cart.create({
        data: { userId, status: CartStatus.ACTIVE },
        include: { 
          items: { 
            include: { 
              variant: {
                include: {
                  product: {
                    include: {
                      translations: {
                        where: { language: 'FR' }
                      }
                    }
                  },
                  media: true
                }
              }
            } 
          } 
        }
      })
    }

    return cart
  })
}

// Add item to cart (handles duplicates)
export async function addToCart(userId: string, variantId: string, quantity = 1) {
  return safeDbOperation(async () => {
    const { data: cart } = await getOrCreateActiveCart(userId)
    if (!cart) throw new Error('Could not get or create cart')

    const existingItem = await db.cartItem.findUnique({
      where: {
        cartId_variantId: { cartId: cart.id, variantId }
      }
    })

    if (existingItem) {
      return db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      })
    } else {
      return db.cartItem.create({
        data: { cartId: cart.id, variantId, quantity }
      })
    }
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

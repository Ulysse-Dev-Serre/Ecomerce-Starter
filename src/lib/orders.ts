import { db, safeDbOperation } from './db'
import { convertCartToOrder } from './cart'

// Get orders for a user
export async function getUserOrders(userId: string, limit = 20, offset = 0) {
  return safeDbOperation(async () => {
    return db.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
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
        },
        payments: true,
        shipments: {
          include: {
            items: true
          }
        }
      }
    })
  })
}

// Get single order by ID
export async function getOrderById(orderId: string) {
  return safeDbOperation(async () => {
    return db.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
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
        },
        payments: true,
        shipments: {
          include: {
            items: true
          }
        }
      }
    })
  })
}

// Create order from cart
export async function createOrderFromCart(
  userId: string, 
  shippingAddress: object, 
  billingAddress: object
) {
  return convertCartToOrder(userId, shippingAddress, billingAddress)
}

// Update order status
export async function updateOrderStatus(orderId: string, status: string) {
  return safeDbOperation(async () => {
    return db.order.update({
      where: { id: orderId },
      data: { status: status as 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' }
    })
  })
}

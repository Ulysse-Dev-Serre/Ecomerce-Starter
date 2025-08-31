import { db, safeDbOperation } from './db'
import { UserRole } from '../generated/prisma'

// Get user by ID with relations
export async function getUserById(id: string) {
  return safeDbOperation(async () => {
    return db.user.findUnique({
      where: { id },
      include: {
        addresses: {
          orderBy: { isDefault: 'desc' }
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
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
        }
      }
    })
  })
}

// Create new user
export async function createUser(data: {
  email: string
  name?: string
  role?: UserRole
}) {
  return safeDbOperation(async () => {
    return db.user.create({
      data,
      include: {
        addresses: true
      }
    })
  })
}

// Update user
export async function updateUser(id: string, data: {
  name?: string
  email?: string
}) {
  return safeDbOperation(async () => {
    return db.user.update({
      where: { id },
      data,
      include: {
        addresses: true
      }
    })
  })
}

// Add address to user
export async function addUserAddress(userId: string, address: {
  street: string
  city: string
  state?: string
  zipCode: string
  country: string
  type?: 'BILLING' | 'SHIPPING' | 'BOTH'
  isDefault?: boolean
}) {
  return safeDbOperation(async () => {
    return db.address.create({
      data: {
        ...address,
        userId
      }
    })
  })
}

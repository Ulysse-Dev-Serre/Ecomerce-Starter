import { Language } from '../../generated/prisma'

// Prisma selectors pour éviter la duplication des includes
// Usage: db.product.findMany({ ...productSummary('FR') })

export const productSummary = (language: Language = Language.EN) => ({
  where: { 
    status: 'ACTIVE' as const,
    deletedAt: null 
  },
  include: {
    translations: { 
      where: { language } 
    },
    variants: {
      where: { deletedAt: null },
      take: 1,
      include: {
        media: { 
          where: { isPrimary: true } 
        }
      }
    }
  }
})

export const productDetail = (language: Language = Language.EN) => ({
  include: {
    translations: { where: { language } },
    categories: {
      include: {
        category: {
          include: {
            translations: { where: { language } }
          }
        }
      }
    },
    variants: {
      where: { deletedAt: null },
      include: {
        media: true,
        attributeValues: {
          include: {
            attributeValue: {
              include: { attribute: true }
            }
          }
        }
      }
    },
    reviews: {
      include: { 
        user: { 
          select: { 
            id: true,
            name: true 
          } 
        } 
      },
      orderBy: { createdAt: 'desc' as const },
      take: 10
    }
  }
})

export const cartWithItems = (language: Language = Language.FR) => ({
  include: { 
    items: { 
      include: { 
        variant: {
          include: {
            product: {
              include: {
                translations: {
                  where: { language }
                }
              }
            },
            media: {
              where: { isPrimary: true }
            }
          }
        }
      } 
    } 
  }
})

export const categoryWithProducts = (language: Language = Language.EN) => ({
  include: {
    translations: { where: { language } },
    products: {
      include: {
        product: {
          where: {
            status: 'ACTIVE' as const,
            deletedAt: null
          },
          include: {
            translations: { where: { language } },
            variants: {
              where: { deletedAt: null },
              take: 1,
              include: {
                media: { where: { isPrimary: true } }
              }
            }
          }
        }
      }
    }
  }
})

export const orderWithDetails = (language: Language = Language.EN) => ({
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
                  where: { language }
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

export const userWithRelations = () => ({
  include: {
    addresses: {
      orderBy: { isDefault: 'desc' as const }
    },
    orders: {
      orderBy: { createdAt: 'desc' as const },
      take: 10,
      include: {
        items: {
          select: {
            id: true,
            quantity: true,
            productSnapshot: true,
            priceSnapshot: true,
            currency: true
          }
        }
      }
    }
  }
})

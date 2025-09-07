import { NextRequest, NextResponse } from "next/server"
import { getAuthSession } from "../../../../lib/auth-session"
import { isUserAdmin } from "../../../../lib/auth-admin"
import { db, safeDbOperation } from "../../../../lib/db"

// GET /api/admin/orders - Get all orders for admin
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = await isUserAdmin(session.user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')

    const result = await safeDbOperation(async () => {
      return db.order.findMany({
        where: status ? { status: status as any } : {},
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
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
          shipments: true
        }
      })
    })

    if (result.error) {
      console.error('Database error:', result.error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    const orders = result.data || []
    console.log('API returning orders:', orders.length, 'orders for admin')

    // Log some sample order data for debugging
    if (orders.length > 0) {
      console.log('Sample order:', {
        id: orders[0].id,
        userId: orders[0].userId,
        status: orders[0].status,
        totalAmount: orders[0].totalAmount,
        createdAt: orders[0].createdAt
      })
    }

    return NextResponse.json({ orders })

  } catch (error) {
    console.error('Error fetching admin orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/orders - Create a test order (for testing purposes)
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = await isUserAdmin(session.user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, totalAmount, currency, status } = body

    if (!userId || !totalAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await safeDbOperation(async () => {
      return db.order.create({
        data: {
          userId,
          status: status || 'PAID',
          totalAmount: parseFloat(totalAmount.toString()),
          currency: currency || 'CAD',
          shippingAddress: JSON.stringify({
            street: '123 Test Street',
            city: 'Test City',
            zipCode: '12345',
            country: 'CA'
          }),
          billingAddress: JSON.stringify({
            street: '123 Test Street',
            city: 'Test City',
            zipCode: '12345',
            country: 'CA'
          }),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      })
    })

    if (result.error) {
      console.error('Database error creating test order:', result.error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    console.log('✅ TEST ORDER CREATED:', {
      orderId: result.data?.id,
      userId: result.data?.userId,
      totalAmount: result.data?.totalAmount,
      status: result.data?.status
    })

    return NextResponse.json({
      message: 'Test order created successfully',
      order: result.data
    })

  } catch (error) {
    console.error('Error creating test order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

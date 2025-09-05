export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

import NextAuth from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "../../../../lib/auth-session"
import { withRateLimit, extractEmailFromAuthBody } from "../../../../lib/rate-limit-middleware"

const originalHandler = NextAuth(authOptions)

// Wrapper avec rate limiting pour POST (signin, etc.)
async function rateLimitedPOST(request: NextRequest, context: any) {
  // Appliquer rate limiting seulement pour les actions sensibles
  const url = new URL(request.url)
  const action = url.searchParams.get('nextauth')
  
  // Rate limit pour signin, callback, etc.
  if (action && ['signin', 'callback', 'session'].includes(action)) {
    const rateLimitResponse = await withRateLimit(request, {
      type: 'auth',
      extractEmail: extractEmailFromAuthBody
    })
    
    if (rateLimitResponse) {
      return rateLimitResponse
    }
  }
  
  return originalHandler(request, context)
}

// GET n'a pas besoin de rate limiting strict
export async function GET(request: NextRequest, context: any) {
  return originalHandler(request, context)
}

export async function POST(request: NextRequest, context: any) {
  return rateLimitedPOST(request, context)
}

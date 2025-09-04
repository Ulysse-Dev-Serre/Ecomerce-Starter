import { NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth-session"
import { isUserAdmin } from "@/lib/auth-admin"

export async function GET() {
  try {
    const session = await getAuthSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ isAdmin: false })
    }

    const admin = await isUserAdmin(session.user.id)
    
    return NextResponse.json({ isAdmin: admin })

  } catch (error) {
    console.error('Check admin role error:', error)
    return NextResponse.json({ isAdmin: false })
  }
}

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { isUserAdmin } from "@/lib/auth-admin"

export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ isAdmin: false })
    }

    const admin = await isUserAdmin(session.user.email)
    
    return NextResponse.json({ isAdmin: admin })

  } catch (error) {
    console.error('Check admin role error:', error)
    return NextResponse.json({ isAdmin: false })
  }
}

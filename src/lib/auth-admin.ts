import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"

export async function requireAdmin() {
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    redirect("/auth")
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { role: true, id: true, email: true, name: true }
  })

  if (!user || user.role !== "ADMIN") {
    redirect("/")
  }

  return user
}

export async function isUserAdmin(email: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { email },
    select: { role: true }
  })
  
  return user?.role === "ADMIN"
}

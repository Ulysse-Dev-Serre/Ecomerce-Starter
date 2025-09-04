import { redirect } from "next/navigation"
import { getAuthSession } from "./auth-session"
import { db } from "@/lib/db"

export async function requireAdmin() {
  const session = await getAuthSession()
  
  if (!session?.user?.id) {
    redirect("/auth")
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, id: true, email: true, name: true }
  })

  if (!user || user.role !== "ADMIN") {
    redirect("/")
  }

  return user
}

export async function isUserAdmin(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true }
  })
  
  return user?.role === "ADMIN"
}

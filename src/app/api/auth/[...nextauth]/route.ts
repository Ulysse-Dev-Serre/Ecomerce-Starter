export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import AppleProvider from "next-auth/providers/apple"
import EmailProvider from "next-auth/providers/email"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "../../../../lib/db"

const providers = [
  // Google provider (with fallback values for development)
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID || "demo-client-id",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "demo-client-secret",
  }),
  
  // Apple provider (with fallback values for development)
  AppleProvider({
    clientId: process.env.APPLE_ID || "demo-apple-id",
    clientSecret: process.env.APPLE_SECRET || "demo-apple-secret",
  }),
  
  // Email provider (working in development)
  EmailProvider({
    server: process.env.EMAIL_SERVER || "smtp://localhost:587",
    from: process.env.EMAIL_FROM || "noreply@localhost",
    sendVerificationRequest: async ({ identifier, url }) => {
      console.log('\n🔗 MAGIC LINK de connexion pour:', identifier)
      console.log('👆 Copiez cette URL dans votre navigateur:')
      console.log(url)
      console.log('─'.repeat(100))
    },
  }),
]

const handler = NextAuth({
  adapter: PrismaAdapter(db),
  providers,
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
  },
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  session: {
    strategy: "database",
  },
  secret: process.env.NEXTAUTH_SECRET || "development-secret-change-in-production",
})

export { handler as GET, handler as POST }

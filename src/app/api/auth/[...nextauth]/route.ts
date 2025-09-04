export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
// import AppleProvider from "next-auth/providers/apple" // Temporairement désactivé
import EmailProvider from "next-auth/providers/email"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "../../../../lib/db"
import bcrypt from "bcryptjs"

const providers = [
  // Google provider (with fallback values for development)
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID || "demo-client-id",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "demo-client-secret",
  }),
  
  // Apple provider (with fallback values for development) - TEMPORAIREMENT DÉSACTIVÉ
  // AppleProvider({
  //   clientId: process.env.APPLE_ID || "demo-apple-id",
  //   clientSecret: process.env.APPLE_SECRET || "demo-apple-secret",
  // }),
  
  // Email provider (real email sending)
  EmailProvider({
    server: process.env.EMAIL_SERVER || "smtp://localhost:587",
    from: process.env.EMAIL_FROM || "noreply@localhost",
    sendVerificationRequest: async ({ identifier, url, provider }) => {
      if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_SERVER) {
        // Development fallback - show link in console
        console.log('\n🔗 MAGIC LINK de connexion pour:', identifier)
        console.log('👆 Copiez cette URL dans votre navigateur:')
        console.log(url)
        console.log('─'.repeat(100))
        return
      }

      // Production or configured email - send real email
      const { createTransport } = require('nodemailer')
      const transport = createTransport(process.env.EMAIL_SERVER)

      await transport.sendMail({
        to: identifier,
        from: process.env.EMAIL_FROM || "noreply@localhost",
        subject: `Connexion à votre boutique`,
        text: `Cliquez sur ce lien pour vous connecter: ${url}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Connexion à votre boutique</h1>
            <p>Bonjour,</p>
            <p>Cliquez sur le bouton ci-dessous pour vous connecter à votre compte :</p>
            <a href="${url}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Se connecter
            </a>
            <p style="margin-top: 20px; color: #666; font-size: 14px;">
              Ce lien expire dans 24 heures pour votre sécurité.
            </p>
            <p style="color: #666; font-size: 14px;">
              Si vous n'avez pas demandé cette connexion, ignorez cet email.
            </p>
          </div>
        `
      })
    },
  }),

  // Credentials provider for email/password
  CredentialsProvider({
    name: "Email et mot de passe",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Mot de passe", type: "password" }
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null
      }

      try {
        const user = await db.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          // Create new user with hashed password
          const hashedPassword = await bcrypt.hash(credentials.password, 12)
          const newUser = await db.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split('@')[0],
              password: hashedPassword,
            }
          })
          return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
          }
        }

        // Verify password for existing users
        if (user.password) {
          const isValidPassword = await bcrypt.compare(credentials.password, user.password)
          if (!isValidPassword) {
            return null
          }
        } else {
          // User exists but no password (created via OAuth/email) - set password
          const hashedPassword = await bcrypt.hash(credentials.password, 12)
          await db.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
          })
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      } catch (error) {
        console.error('Auth error:', error)
        return null
      }
    }
  })
]

const handler = NextAuth({
  adapter: PrismaAdapter(db),
  providers,
  pages: {
    signIn: '/auth',
    verifyRequest: '/auth/verify-request',
    error: '/auth/account-linking',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('🔐 SignIn callback:', { userEmail: user.email, provider: account?.provider })
      return true
    },
    async redirect({ url, baseUrl }) {
      console.log('🔄 Redirect callback:', { url, baseUrl })
      // Always redirect to home after successful sign in
      if (url.startsWith(baseUrl + '/auth/signin')) {
        return baseUrl
      }
      return url.startsWith(baseUrl) ? url : baseUrl
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        console.log('🎟️ JWT created for user:', user.email)
      }
      return token
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  events: {
    async linkAccount({ user, account, profile }) {
      console.log(`✅ Account ${account.provider} linked to user ${user.email}`)
    },
    async signIn({ user, account, profile, isNewUser }) {
      if (isNewUser) {
        console.log(`🆕 New user created: ${user.email}`)
      } else {
        console.log(`👋 User signed in: ${user.email}`)
      }
    },
  },
  session: {
    strategy: "jwt", // Change to JWT to avoid account linking issues
  },
  secret: process.env.NEXTAUTH_SECRET || "development-secret-change-in-production",
})

export { handler as GET, handler as POST }

import { getServerSession, NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "./db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "demo-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "demo-client-secret",
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER || "smtp://localhost:587",
      from: process.env.EMAIL_FROM || "noreply@localhost",
      sendVerificationRequest: async ({ identifier, url }) => {
        if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_SERVER) {
          console.log('\n🔗 MAGIC LINK de connexion pour:', identifier)
          console.log('👆 Copiez cette URL dans votre navigateur:')
          console.log(url)
          console.log('─'.repeat(100))
          return
        }
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
            </div>
          `
        })
      },
    }),
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
          
          // SÉCURITÉ: Ne pas créer d'utilisateur lors du sign-in
          // L'inscription doit passer par une route dédiée
          if (!user) {
            console.warn(`[SECURITY] Tentative de connexion pour email inexistant: ${credentials.email}`)
            return null
          }
          
          // SÉCURITÉ: Rejeter si l'utilisateur n'a pas de mot de passe
          // Cela empêche l'account takeover d'utilisateurs Google/Email existants
          if (!user.password) {
            console.warn(`[SECURITY] Tentative d'account takeover détectée pour: ${credentials.email}`)
            // Retourner null avec une erreur explicite pour debugging
            throw new Error('ACCOUNT_NO_PASSWORD')
          }
          
          // Vérification du mot de passe pour utilisateur avec password valide
          const isValidPassword = await bcrypt.compare(credentials.password, user.password)
          if (!isValidPassword) {
            console.warn(`[SECURITY] Mot de passe incorrect pour: ${credentials.email}`)
            return null
          }
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        } catch (error) {
          if (error instanceof Error && error.message === 'ACCOUNT_NO_PASSWORD') {
            console.error('[SECURITY] Account takeover attempt blocked:', credentials.email)
            // En production, ne pas révéler la raison exacte
            return null
          }
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/auth',
    verifyRequest: '/auth/verify-request',
    error: '/auth/account-linking',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
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
  session: {
    strategy: "jwt",
    // Durée de session : 7 jours
    maxAge: 7 * 24 * 60 * 60, // 7 jours en secondes
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true, // Empêche l'accès JS côté client
        sameSite: 'lax', // Protection CSRF tout en permettant navigation normale
        path: '/', // Disponible sur tout le site
        secure: process.env.NODE_ENV === 'production', // HTTPS seulement en production
        maxAge: 7 * 24 * 60 * 60 // 7 jours
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "development-secret-change-in-production",
}

export async function getAuthSession() {
  // Support pour tests automatisés en développement
  if (process.env.NODE_ENV === 'development') {
    const testUserId = process.env.TEST_USER_ID
    const testUserEmail = process.env.TEST_USER_EMAIL  
    const testUserRole = process.env.TEST_USER_ROLE
    
    if (testUserId && testUserEmail) {
      return {
        user: {
          id: testUserId,
          email: testUserEmail,
          name: testUserEmail.split('@')[0],
          role: testUserRole || 'CLIENT'
        }
      }
    }
  }
  
  return await getServerSession(authOptions)
}

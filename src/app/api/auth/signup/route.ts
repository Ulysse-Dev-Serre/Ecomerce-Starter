import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { z } from 'zod'

// Schema de validation pour l'inscription
const signupSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string()
    .min(8, 'Le mot de passe doit faire au moins 8 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
  name: z.string().min(2, 'Le nom doit faire au moins 2 caractères').optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation des données d'entrée
    const validatedData = signupSchema.parse(body)
    const { email, password, name } = validatedData
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      // SÉCURITÉ: Ne pas révéler si l'email existe ou non
      // Même réponse pour éviter l'enumeration d'emails
      return NextResponse.json(
        { 
          error: 'EMAIL_ALREADY_EXISTS',
          message: 'Un compte avec cet email existe déjà. Utilisez "Mot de passe oublié" si vous avez perdu vos identifiants.'
        }, 
        { status: 400 }
      )
    }
    
    // Hachage sécurisé du mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Création de l'utilisateur
    const newUser = await db.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        password: hashedPassword,
        emailVerified: null, // Nécessitera verification par email
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    })
    
    console.log(`[AUTH] Nouvel utilisateur créé: ${newUser.email}`)
    
    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès. Vous pouvez maintenant vous connecter.',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }
    })
    
  } catch (error) {
    // Gestion des erreurs de validation Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'VALIDATION_ERROR',
          message: 'Données invalides',
          details: error.issues
        }, 
        { status: 400 }
      )
    }
    
    console.error('[AUTH] Erreur lors de l\'inscription:', error)
    
    // Erreur générique pour ne pas révéler les détails internes
    return NextResponse.json(
      { 
        error: 'SIGNUP_ERROR',
        message: 'Une erreur est survenue lors de l\'inscription'
      }, 
      { status: 500 }
    )
  }
}

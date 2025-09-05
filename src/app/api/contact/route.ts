import { NextRequest, NextResponse } from "next/server"
import { createValidationMiddleware, sanitize, ValidationSchemas } from "../../../lib/validation"
import { withRateLimit } from "../../../lib/rate-limit-middleware"

export async function POST(request: NextRequest) {
  // Rate limiting pour éviter le spam
  const rateLimitResponse = await withRateLimit(request, { type: 'general' })
  if (rateLimitResponse) return rateLimitResponse
  
  try {
    // Validation stricte du formulaire de contact
    const validateContact = createValidationMiddleware('contactForm', { logErrors: true })
    const { data: validatedData, error: validationError } = await validateContact(request)
    
    if (validationError) {
      return validationError
    }
    
    if (!validatedData) {
      return NextResponse.json({ 
        error: 'Données du formulaire manquantes',
        code: 'MISSING_DATA'
      }, { status: 400 })
    }

    // Sanitization supplémentaire pour sécurité
    const sanitizedData = {
      name: sanitize.html(validatedData.name),
      email: validatedData.email, // Déjà validé comme email
      subject: sanitize.html(validatedData.subject),
      message: sanitize.html(validatedData.message),
      phone: validatedData.phone ? sanitize.alphanumeric(validatedData.phone) : undefined,
      company: validatedData.company ? sanitize.html(validatedData.company) : undefined
    }
    
    // Log sécurisé pour monitoring (pas de données sensibles)
    console.log('Contact form submission:', {
      timestamp: new Date().toISOString(),
      hasName: !!sanitizedData.name,
      hasEmail: !!sanitizedData.email,
      hasSubject: !!sanitizedData.subject,
      messageLength: sanitizedData.message.length,
      hasPhone: !!sanitizedData.phone,
      hasCompany: !!sanitizedData.company,
    })

    // TODO: Ici on pourrait envoyer un email, sauver en DB, etc.
    // Pour l'instant, on simule juste le succès
    
    return NextResponse.json({ 
      message: "Message de contact reçu avec succès",
      code: 'CONTACT_SUCCESS',
      id: `contact_${Date.now()}` // ID temporaire pour tracking
    })

  } catch (error) {
    console.error('Contact form error:', error)
    
    return NextResponse.json({ 
      error: "Erreur lors de l'envoi du message",
      code: 'CONTACT_ERROR' 
    }, { status: 500 })
  }
}

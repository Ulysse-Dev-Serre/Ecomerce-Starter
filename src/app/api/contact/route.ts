export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

// POST /api/contact - Envoyer un message de contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Nom, email et message sont requis' },
        { status: 400 }
      )
    }

    // TODO: Add email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      )
    }

    // Send email to admin
    if (process.env.EMAIL_SERVER && process.env.ADMIN_EMAIL) {
      const { createTransport } = require('nodemailer')
      const transport = createTransport(process.env.EMAIL_SERVER)

      await transport.sendMail({
        to: process.env.ADMIN_EMAIL,
        from: process.env.EMAIL_FROM || "contact@localhost",
        subject: `[Contact] ${subject || 'Nouveau message'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Nouveau message de contact</h2>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>De :</strong> ${name} (${email})</p>
              <p><strong>Sujet :</strong> ${subject || 'Aucun sujet'}</p>
            </div>
            <div style="background: white; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h3>Message :</h3>
              <p style="line-height: 1.6;">${message}</p>
            </div>
            <p style="margin-top: 20px; color: #666; font-size: 14px;">
              Message envoyé depuis votre boutique e-commerce.
            </p>
          </div>
        `,
        // Also send confirmation to customer
        replyTo: email
      })

      // Send confirmation to customer
      await transport.sendMail({
        to: email,
        from: process.env.EMAIL_FROM || "contact@localhost",
        subject: `Message reçu - Nous vous répondrons rapidement`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Message bien reçu !</h2>
            <p>Bonjour ${name},</p>
            <p>Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais (généralement sous 24h).</p>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Votre message :</strong></p>
              <p style="font-style: italic;">"${message}"</p>
            </div>
            <p>Merci pour votre confiance !</p>
            <p>L'équipe de votre boutique</p>
          </div>
        `
      })
    } else {
      // Development mode - log to console
      console.log('\n📧 CONTACT MESSAGE RECEIVED:')
      console.log(`From: ${name} (${email})`)
      console.log(`Subject: ${subject || 'No subject'}`)
      console.log(`Message: ${message}`)
      console.log('─'.repeat(50))
    }

    return NextResponse.json({ 
      message: 'Message envoyé avec succès. Nous vous répondrons rapidement.' 
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    )
  }
}

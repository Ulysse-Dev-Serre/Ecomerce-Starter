#!/usr/bin/env node
/**
 * Script simple pour créer un admin
 * Usage: npm run make-admin email@example.com
 */

const { PrismaClient } = require('@prisma/client')

async function makeAdmin() {
  const email = process.argv[2]
  
  if (!email) {
    console.error('❌ Email requis!')
    console.log('Usage: npm run make-admin email@example.com')
    process.exit(1)
  }
  
  if (!email.includes('@')) {
    console.error('❌ Email invalide:', email)
    process.exit(1)
  }
  
  const prisma = new PrismaClient()
  
  try {
    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      console.error('❌ Utilisateur non trouvé:', email)
      console.log('💡 L\'utilisateur doit se connecter au moins une fois d\'abord')
      process.exit(1)
    }
    
    if (user.role === 'ADMIN') {
      console.log('✅', email, 'est déjà admin!')
      process.exit(0)
    }
    
    // Promouvoir en admin
    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    })
    
    console.log('🎉 Utilisateur promu admin:', email)
    console.log('💡 Il devra se reconnecter pour que les permissions prennent effet')
    
  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

makeAdmin()

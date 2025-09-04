const { PrismaClient } = require('../src/generated/prisma')

const db = new PrismaClient()

async function createAdminUser() {
  const adminEmail = process.argv[2] || 'admin@test.com'
  
  try {
    const existingUser = await db.user.findUnique({
      where: { email: adminEmail }
    })

    if (existingUser) {
      // Update existing user to admin
      const updatedUser = await db.user.update({
        where: { email: adminEmail },
        data: { role: 'ADMIN' }
      })
      console.log(`✅ Utilisateur ${adminEmail} mis à jour en tant qu'ADMIN`)
    } else {
      // Create new admin user
      const newUser = await db.user.create({
        data: {
          email: adminEmail,
          name: 'Admin User',
          role: 'ADMIN'
        }
      })
      console.log(`✅ Nouvel utilisateur ADMIN créé: ${adminEmail}`)
    }
    
    console.log(`\n📧 Vous pouvez maintenant vous connecter avec: ${adminEmail}`)
    console.log('🔑 Utilisez la connexion par email magique ou configurez un mot de passe')
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error)
  } finally {
    await db.$disconnect()
  }
}

createAdminUser()

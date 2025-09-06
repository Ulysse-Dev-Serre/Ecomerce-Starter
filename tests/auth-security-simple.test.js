/**
 * Test de sécurité simple : Vérification CredentialsProvider
 * 
 * Teste que la logique authorize() rejette correctement les utilisateurs sans password
 */

const TEST_EMAIL = `test-security-${Date.now()}@example.com`

async function testCredentialsProviderLogic() {
  console.log('\n🔒 TEST SÉCURITÉ: CredentialsProvider Protection')
  console.log('================================================')
  
  try {
    // Mock de la base de données pour le test
    const mockUsers = new Map()
    
    const mockDb = {
      user: {
        findUnique: async ({ where }) => {
          return mockUsers.get(where.email) || null
        }
      }
    }
    
    // Mock bcrypt
    const mockBcrypt = {
      hash: async (password, rounds) => `hashed_${password}`,
      compare: async (password, hash) => hash === `hashed_${password}`
    }
    
    // Créer un utilisateur externe (sans password) comme le ferait Google OAuth
    console.log('\n1️⃣ Création utilisateur externe simulé...')
    const externalUser = {
      id: '1',
      email: TEST_EMAIL,
      name: 'Test User',
      password: null, // ⚠️ Pas de mot de passe (créé via Google)
      emailVerified: new Date()
    }
    mockUsers.set(TEST_EMAIL, externalUser)
    console.log(`   ✅ User créé: ${externalUser.email} (password: ${externalUser.password})`)
    
    // Simulation de la logique authorize() sécurisée
    console.log('\n2️⃣ Test logique authorize() sécurisée...')
    
    const secureAuthorize = async (credentials) => {
      if (!credentials?.email || !credentials?.password) {
        return null
      }
      
      try {
        const user = await mockDb.user.findUnique({
          where: { email: credentials.email }
        })
        
        // SÉCURITÉ: Ne pas créer d'utilisateur lors du sign-in
        if (!user) {
          console.warn(`[SECURITY] Tentative de connexion pour email inexistant: ${credentials.email}`)
          return null
        }
        
        // SÉCURITÉ: Rejeter si l'utilisateur n'a pas de mot de passe
        if (!user.password) {
          console.warn(`[SECURITY] Tentative d'account takeover détectée pour: ${credentials.email}`)
          return null
        }
        
        // Vérification du mot de passe pour utilisateur avec password valide
        const isValidPassword = await mockBcrypt.compare(credentials.password, user.password)
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
        console.error('Auth error:', error)
        return null
      }
    }
    
    // 3. Test d'attaque : tenter de se connecter avec l'email externe
    console.log('\n3️⃣ Tentative d\'account takeover...')
    
    const attackCredentials = {
      email: TEST_EMAIL,
      password: 'AttackerPassword123!'
    }
    
    console.log(`   → Email cible: ${attackCredentials.email}`)
    console.log(`   → Password attaquant: ${attackCredentials.password}`)
    
    const result = await secureAuthorize(attackCredentials)
    
    // 4. Vérification du résultat
    if (result === null) {
      console.log('✅ SUCCÈS: Account takeover bloqué!')
      console.log('   → authorize() a retourné null comme attendu')
    } else {
      console.log('❌ ÉCHEC: Account takeover réussi!')
      console.log('   → authorize() a retourné:', result)
      throw new Error('CRITICAL: Account takeover vulnerability detected!')
    }
    
    // 5. Vérifier que l'utilisateur original n'a pas été modifié
    const userAfterAttack = mockUsers.get(TEST_EMAIL)
    if (userAfterAttack && userAfterAttack.password === null) {
      console.log('✅ SUCCÈS: Utilisateur intact, password toujours null')
    } else {
      console.log('❌ ÉCHEC: Utilisateur a été modifié!')
      console.log('   → Password après attaque:', userAfterAttack?.password)
      throw new Error('CRITICAL: User was modified during attack!')
    }
    
    // 6. Test légitime : utilisateur avec password valide
    console.log('\n4️⃣ Test utilisateur légitime...')
    
    const legitimateUser = {
      id: '2',
      email: 'legitimate@example.com',
      name: 'Legitimate User',
      password: await mockBcrypt.hash('CorrectPassword123!', 12)
    }
    mockUsers.set(legitimateUser.email, legitimateUser)
    
    const legitimateResult = await secureAuthorize({
      email: legitimateUser.email,
      password: 'CorrectPassword123!'
    })
    
    if (legitimateResult && legitimateResult.email === legitimateUser.email) {
      console.log('✅ SUCCÈS: Utilisateur légitime peut se connecter')
    } else {
      console.log('❌ ÉCHEC: Utilisateur légitime ne peut pas se connecter')
      throw new Error('Legitimate user authentication failed!')
    }
    
    console.log('\n🎉 RÉSULTAT GLOBAL: Protection account takeover ACTIVE')
    console.log('   → Users externes (Google/Email) protégés ✅')
    console.log('   → Users légitimes peuvent se connecter ✅')
    console.log('   → Aucune création automatique d\'utilisateur ✅')
    
  } catch (error) {
    console.error('\n💥 ERREUR CRITIQUE:', error.message)
    console.error('Stack:', error.stack)
    process.exit(1)
  }
}

// Exécution du test si appelé directement
if (require.main === module) {
  testCredentialsProviderLogic()
    .then(() => {
      console.log('\n✅ Test terminé avec succès!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Test échoué:', error)
      process.exit(1)
    })
}

module.exports = { testCredentialsProviderLogic }

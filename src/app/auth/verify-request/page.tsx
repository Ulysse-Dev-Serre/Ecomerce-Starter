export default function VerifyRequest() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26c.3.16.67.16.97 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Vérifiez votre email
        </h1>
        
        <p className="text-gray-600 mb-6">
          Un lien de connexion a été envoyé à votre adresse email. 
          Cliquez sur le lien pour vous connecter à votre compte.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm">
            💡 <strong>Mode développement :</strong> Vérifiez les logs du serveur 
            pour voir le lien de connexion si l'email n'est pas configuré.
          </p>
        </div>
        
        <a 
          href="/auth/signin"
          className="inline-block text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Retour à la connexion
        </a>
      </div>
    </div>
  )
}

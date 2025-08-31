import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                À propos de notre boutique
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Nous sommes passionnés par la qualité et l&apos;excellence. Notre mission est de vous offrir 
                les meilleurs produits avec un service exceptionnel et une expérience d&apos;achat inoubliable.
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Notre histoire
                </h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Fondée en 2024, notre boutique a commencé avec une vision simple : 
                    rendre les produits de qualité accessibles à tous, partout au Canada.
                  </p>
                  <p>
                    Aujourd'hui, nous servons des milliers de clients satisfaits grâce à 
                    notre catalogue soigneusement sélectionné et notre service client dévoué.
                  </p>
                  <p>
                    Chaque produit que nous proposons est testé et approuvé par notre équipe 
                    pour garantir votre satisfaction.
                  </p>
                </div>
              </div>
              <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
                <span className="text-gray-400 text-lg">Image de l'équipe</span>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Nos valeurs
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Excellence</h3>
                <p className="text-gray-600">
                  Nous visons l'excellence dans chaque aspect de notre service, 
                  de la sélection des produits à l'expérience client.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Confiance</h3>
                <p className="text-gray-600">
                  La confiance de nos clients est notre priorité. Nous garantissons 
                  la transparence et l'honnêteté dans toutes nos interactions.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌱</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Durabilité</h3>
                <p className="text-gray-600">
                  Nous nous engageons à proposer des produits durables et à 
                  minimiser notre impact environnemental.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Contactez-nous
              </h2>
              <p className="text-gray-600 mb-8">
                Une question ? Notre équipe est là pour vous aider.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                  <p className="text-gray-600">contact@example.com</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Téléphone</h3>
                  <p className="text-gray-600">(514) 123-4567</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

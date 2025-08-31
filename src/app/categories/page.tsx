import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'

export default function CategoriesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Catégories
            </h1>
            <p className="text-gray-600">
              Explorez nos différentes catégories de produits
            </p>
          </div>

          {/* TODO: Connect to real categories API */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Électronique', count: 25, icon: '📱' },
              { name: 'Mode', count: 45, icon: '👕' },
              { name: 'Maison', count: 32, icon: '🏠' },
              { name: 'Sport', count: 18, icon: '⚽' },
              { name: 'Beauté', count: 28, icon: '💄' },
              { name: 'Livres', count: 15, icon: '📚' },
            ].map((category, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {category.count} produits
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

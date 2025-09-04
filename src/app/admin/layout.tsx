import { requireAdmin } from "@/lib/auth-admin"
import Link from "next/link"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await requireAdmin()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/admin" className="text-xl font-bold text-gray-900">
                Administration
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link 
                  href="/admin" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/admin/products" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Produits
                </Link>
                <Link 
                  href="/admin/categories" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Catégories
                </Link>
                <Link 
                  href="/admin/orders" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Commandes
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Connecté en tant que {admin.name || admin.email}
              </span>
              <Link 
                href="/" 
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
              >
                Voir la boutique
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

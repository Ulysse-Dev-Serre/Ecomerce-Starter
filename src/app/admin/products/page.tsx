import Link from "next/link"

export default function AdminProductsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Produits</h1>
        <Link 
          href="/admin/products/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ajouter un produit
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Liste des produits</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-500 text-center py-8">
            Aucun produit pour le moment. 
            <Link href="/admin/products/add" className="text-blue-600 hover:underline ml-1">
              Créez votre premier produit
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

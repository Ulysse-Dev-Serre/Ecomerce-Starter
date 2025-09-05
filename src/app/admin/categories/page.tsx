export default function AdminCategoriesPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Catégories</h1>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Liste des catégories</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-8 space-y-4">
            <div className="text-4xl text-gray-300 mb-4">📂</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              Catégories (Optionnel)
            </h3>
            <div className="max-w-2xl mx-auto text-left bg-gray-50 rounded-lg p-6 space-y-3">
              <p className="text-gray-600 text-sm leading-relaxed">
                <strong>Pour des boutiques &gt;10 produits</strong>, cette section permettrait de :
              </p>
              <ul className="text-gray-600 text-sm space-y-1 ml-4">
                <li>• Créer et gérer des catégories avec traductions multilingues</li>
                <li>• Organiser les produits par thématiques</li>
                <li>• Filtrer la boutique par catégories</li>
                <li>• Améliorer la navigation client</li>
              </ul>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mt-4">
                <p className="text-blue-700 text-sm font-medium">📋 Infrastructure déjà prête</p>
                <p className="text-blue-600 text-xs mt-1">
                  Base de données : <code>Category</code>, <code>CategoryTranslation</code>, <code>ProductCategory</code><br/>
                  API endpoint : <code>/api/admin/categories</code><br/>
                  Relations : Many-to-Many avec produits
                </p>
              </div>
              <div className="bg-gray-100 rounded p-3 mt-3">
                <code className="text-xs text-gray-700">
                  // TODO: Implémenter CRUD catégories si nécessaire<br/>
                  // Starter optimisé pour boutiques 6-8 produits max
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

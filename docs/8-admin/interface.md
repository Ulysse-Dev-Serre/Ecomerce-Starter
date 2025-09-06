# Interface d'Administration

## Vue d'Ensemble

Interface d'administration complète pour gérer produits, commandes, utilisateurs et analytics de l'e-commerce.

## Accès et Authentification

### Rôles et Permissions
```typescript
enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN', 
  SUPER_ADMIN = 'SUPER_ADMIN'
}

// Permissions par rôle
const rolePermissions = {
  USER: ['view_profile', 'manage_own_orders'],
  ADMIN: ['manage_products', 'manage_orders', 'view_analytics'],
  SUPER_ADMIN: ['*'] // Toutes permissions
}
```

### Protection des Routes Admin
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('next-auth.session-token')
    
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
    
    // Vérifier rôle admin
    const user = await verifyAdminToken(token)
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }
  
  return NextResponse.next()
}
```

## Dashboard Principal

### Métriques Clés
```typescript
// app/admin/dashboard/page.tsx
export default async function AdminDashboard() {
  const metrics = await getDashboardMetrics()
  
  return (
    <div className="space-y-6">
      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Ventes du jour"
          value={formatCurrency(metrics.dailySales)}
          change={metrics.dailySalesChange}
          icon={DollarSign}
        />
        <MetricCard
          title="Commandes"
          value={metrics.todayOrders}
          change={metrics.ordersChange}
          icon={ShoppingCart}
        />
        <MetricCard
          title="Nouveaux clients"
          value={metrics.newCustomers}
          change={metrics.customersChange}
          icon={Users}
        />
        <MetricCard
          title="Taux conversion"
          value={`${metrics.conversionRate}%`}
          change={metrics.conversionChange}
          icon={TrendingUp}
        />
      </div>
      
      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart data={metrics.salesChart} />
        <OrdersChart data={metrics.ordersChart} />
      </div>
      
      {/* Tables récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders orders={metrics.recentOrders} />
        <TopProducts products={metrics.topProducts} />
      </div>
    </div>
  )
}
```

### Composants Dashboard
```typescript
// components/admin/MetricCard.tsx
export function MetricCard({ title, value, change, icon: Icon }: Props) {
  const isPositive = change >= 0
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-full">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <span className={cn(
          "inline-flex items-center text-sm font-medium",
          isPositive ? "text-green-600" : "text-red-600"
        )}>
          {isPositive ? (
            <TrendingUp className="w-4 h-4 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 mr-1" />
          )}
          {Math.abs(change)}%
        </span>
        <span className="ml-2 text-sm text-gray-500">vs mois dernier</span>
      </div>
    </div>
  )
}
```

## Gestion des Produits

### Liste des Produits
```typescript
// app/admin/products/page.tsx
export default async function ProductsAdminPage({
  searchParams
}: {
  searchParams: { page?: string; search?: string; status?: string }
}) {
  const page = Number(searchParams.page) || 1
  const search = searchParams.search || ''
  const status = searchParams.status || 'all'
  
  const { products, totalPages, totalCount } = await getProductsAdmin({
    page,
    search,
    status,
    limit: 20
  })
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Produits</h1>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau produit
          </Link>
        </Button>
      </div>
      
      {/* Filtres */}
      <ProductFilters 
        defaultSearch={search}
        defaultStatus={status}
      />
      
      {/* Table produits */}
      <ProductsTable 
        products={products} 
        totalCount={totalCount}
      />
      
      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        baseUrl="/admin/products"
      />
    </div>
  )
}
```

### Formulaire Produit
```typescript
// components/admin/ProductForm.tsx
export function ProductForm({ product, onSubmit, isLoading }: Props) {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product || {
      slug: '',
      status: 'DRAFT',
      translations: [
        { language: 'FR', name: '', description: '', price: 0 }
      ]
    }
  })
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informations de base */}
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug (URL)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="mon-produit" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DRAFT">Brouillon</SelectItem>
                      <SelectItem value="ACTIVE">Actif</SelectItem>
                      <SelectItem value="INACTIVE">Inactif</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        {/* Traductions */}
        <Card>
          <CardHeader>
            <CardTitle>Traductions</CardTitle>
          </CardHeader>
          <CardContent>
            <TranslationTabs 
              languages={['FR', 'EN', 'ES']}
              translations={form.watch('translations')}
              onTranslationChange={(index, field, value) => {
                const translations = form.getValues('translations')
                translations[index] = { ...translations[index], [field]: value }
                form.setValue('translations', translations)
              }}
            />
          </CardContent>
        </Card>
        
        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUploader
              images={form.watch('images') || []}
              onImagesChange={(images) => form.setValue('images', images)}
              maxImages={5}
            />
          </CardContent>
        </Card>
        
        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/products">Annuler</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {product ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
```

## Gestion des Commandes

### Liste des Commandes
```typescript
// app/admin/orders/page.tsx  
export default async function OrdersAdminPage({
  searchParams
}: {
  searchParams: { page?: string; status?: string; search?: string }
}) {
  const page = Number(searchParams.page) || 1
  const status = searchParams.status || 'all'
  const search = searchParams.search || ''
  
  const { orders, totalPages, totalCount } = await getOrdersAdmin({
    page,
    status,
    search,
    limit: 20
  })
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Commandes</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/orders/export">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <OrderStatusCard status="PENDING" count={orders.pendingCount} />
        <OrderStatusCard status="CONFIRMED" count={orders.confirmedCount} />
        <OrderStatusCard status="SHIPPED" count={orders.shippedCount} />
        <OrderStatusCard status="DELIVERED" count={orders.deliveredCount} />
      </div>
      
      {/* Filtres */}
      <OrderFilters 
        defaultStatus={status}
        defaultSearch={search}
      />
      
      {/* Table commandes */}
      <OrdersTable orders={orders.data} />
      
      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        baseUrl="/admin/orders"
      />
    </div>
  )
}
```

### Détail Commande
```typescript
// app/admin/orders/[id]/page.tsx
export default async function OrderDetailPage({
  params
}: {
  params: { id: string }
}) {
  const order = await getOrderAdmin(params.id)
  
  if (!order) {
    notFound()
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Commande #{order.orderNumber}</h1>
          <p className="text-gray-600">
            Passée le {formatDate(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items de commande */}
          <Card>
            <CardHeader>
              <CardTitle>Articles commandés</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderItemsList items={order.items} />
            </CardContent>
          </Card>
          
          {/* Historique */}
          <Card>
            <CardHeader>
              <CardTitle>Historique</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline events={order.timeline} />
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statut et actions */}
          <Card>
            <CardHeader>
              <CardTitle>Statut</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <OrderStatusSelector
                currentStatus={order.status}
                onStatusChange={(newStatus) => 
                  updateOrderStatus(order.id, newStatus)
                }
              />
              
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Envoyer email client
                </Button>
                <Button className="w-full" variant="outline">
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimer facture
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Informations client */}
          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{order.user.name}</p>
                <p className="text-sm text-gray-600">{order.user.email}</p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">Adresse de livraison</h4>
                <AddressDisplay address={order.shippingAddress} />
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">Adresse de facturation</h4>
                <AddressDisplay address={order.billingAddress} />
              </div>
            </CardContent>
          </Card>
          
          {/* Résumé paiement */}
          <Card>
            <CardHeader>
              <CardTitle>Paiement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Livraison</span>
                <span>{formatCurrency(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes</span>
                <span>{formatCurrency(order.taxAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">
                  <strong>Paiement:</strong> {order.paymentMethod}
                </p>
                <p className="text-sm">
                  <strong>Statut:</strong> 
                  <PaymentStatusBadge status={order.paymentStatus} />
                </p>
                {order.paymentId && (
                  <p className="text-sm font-mono">
                    ID: {order.paymentId}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
```

## Analytics et Rapports

### Dashboard Analytics
```typescript
// app/admin/analytics/page.tsx
export default async function AnalyticsPage({
  searchParams
}: {
  searchParams: { period?: string; compare?: string }
}) {
  const period = searchParams.period || '30d'
  const compare = searchParams.compare === 'true'
  
  const analytics = await getAnalytics({ period, compare })
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <div className="flex gap-2">
          <PeriodSelector value={period} />
          <Button variant="outline" asChild>
            <Link href="/admin/analytics/export">
              <Download className="w-4 h-4 mr-2" />
              Exporter rapport
            </Link>
          </Button>
        </div>
      </div>
      
      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnalyticsCard
          title="Chiffre d'affaires"
          value={formatCurrency(analytics.revenue)}
          previousValue={compare ? analytics.previousRevenue : undefined}
          format="currency"
        />
        <AnalyticsCard
          title="Commandes"
          value={analytics.orders}
          previousValue={compare ? analytics.previousOrders : undefined}
          format="number"
        />
        <AnalyticsCard
          title="Taux de conversion"
          value={`${analytics.conversionRate}%`}
          previousValue={compare ? analytics.previousConversionRate : undefined}
          format="percentage"
        />
        <AnalyticsCard
          title="Panier moyen"
          value={formatCurrency(analytics.averageOrderValue)}
          previousValue={compare ? analytics.previousAverageOrderValue : undefined}
          format="currency"
        />
      </div>
      
      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Évolution du chiffre d'affaires</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={analytics.revenueChart} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Commandes par jour</CardTitle>
          </CardHeader>
          <CardContent>
            <OrdersChart data={analytics.ordersChart} />
          </CardContent>
        </Card>
      </div>
      
      {/* Analytics détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Produits</CardTitle>
          </CardHeader>
          <CardContent>
            <TopProductsList products={analytics.topProducts} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Sources de trafic</CardTitle>
          </CardHeader>
          <CardContent>
            <TrafficSourcesChart data={analytics.trafficSources} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Géographie</CardTitle>
          </CardHeader>
          <CardContent>
            <GeographyChart data={analytics.geography} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

## Gestion des Utilisateurs

### Liste Utilisateurs
```typescript
// app/admin/users/page.tsx
export default async function UsersAdminPage() {
  const { users, totalCount } = await getUsersAdmin()
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Utilisateurs</h1>
        <UserStats totalUsers={totalCount} />
      </div>
      
      <UsersTable users={users} />
    </div>
  )
}
```

Cette interface d'administration fournit tous les outils nécessaires pour gérer efficacement un e-commerce avec un design moderne et une UX optimisée pour les administrateurs.

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import DataTable from '@/components/DataTable';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { useInvoices } from '@/hooks/useInvoices';
import { useProducts } from '@/hooks/useProducts';
import { useStockMovements } from '@/hooks/useStockMovements';
import { TrendingUp, TrendingDown, ShoppingCart, DollarSign, Package, BarChart3 } from 'lucide-react';
import { PurchaseOrder, Invoice, StockMovement } from '@/lib/types';

const BusinessAnalytics = () => {
  const { purchaseOrders } = usePurchaseOrders();
  const { invoices } = useInvoices();
  const { products } = useProducts();
  const { movements } = useStockMovements();

  // Calcul des achats
  const totalPurchases = purchaseOrders
    .filter(po => po.status === 'received')
    .reduce((sum, po) => sum + po.total, 0);

  // Calcul des ventes
  const totalSales = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);

  // Bénéfice brut
  const grossProfit = totalSales - totalPurchases;
  const profitMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;

  // Achats en attente d'ajout au stock
  const pendingPurchases = purchaseOrders.filter(po => po.status === 'sent');

  // Mouvements d'achat récents
  const purchaseMovements = movements.filter(m => m.type === 'purchase');

  // Produits avec rotation
  const productRotation = products.map(product => {
    const sales = movements.filter(m => m.productId === product.id && m.type === 'sale');
    const purchases = movements.filter(m => m.productId === product.id && m.type === 'purchase');
    
    const totalSold = Math.abs(sales.reduce((sum, m) => sum + m.quantity, 0));
    const totalPurchased = purchases.reduce((sum, m) => sum + m.quantity, 0);
    
    const revenue = totalSold * product.price;
    const averagePurchasePrice = product.price * 0.6; // Estimation 60% du prix de vente
    const cost = totalPurchased * averagePurchasePrice;
    const profit = revenue - cost;

    return {
      ...product,
      totalSold,
      totalPurchased,
      revenue,
      cost,
      profit,
      profitMargin: revenue > 0 ? (profit / revenue) * 100 : 0,
    };
  }).sort((a, b) => b.totalSold - a.totalSold);

  const pendingPurchaseColumns = [
    { 
      key: 'number',
      header: 'N° Commande',
      cell: (item: PurchaseOrder) => item.number,
    },
    { 
      key: 'supplier',
      header: 'Fournisseur', 
      cell: (item: PurchaseOrder) => item.supplier.name,
    },
    { 
      key: 'date',
      header: 'Date commande', 
      cell: (item: PurchaseOrder) => new Date(item.date).toLocaleDateString('fr-FR'),
    },
    { 
      key: 'expectedDeliveryDate',
      header: 'Livraison prévue',
      cell: (item: PurchaseOrder) => item.expectedDeliveryDate 
        ? new Date(item.expectedDeliveryDate).toLocaleDateString('fr-FR') 
        : '-',
    },
    {
      key: 'total',
      header: 'Montant',
      cell: (item: PurchaseOrder) => `${item.total.toFixed(2)} €`,
    },
    {
      key: 'status',
      header: 'Statut',
      cell: (item: PurchaseOrder) => (
        <Badge variant="default">En attente</Badge>
      ),
    },
  ];

  const productAnalyticsColumns = [
    { 
      key: 'reference',
      header: 'Référence',
      cell: (item: any) => item.reference,
    },
    { 
      key: 'description',
      header: 'Produit',
      cell: (item: any) => item.description,
    },
    { 
      key: 'totalSold',
      header: 'Unités vendues',
      cell: (item: any) => item.totalSold,
    },
    { 
      key: 'revenue',
      header: 'Chiffre d\'affaires',
      cell: (item: any) => `${item.revenue.toFixed(2)} €`,
    },
    { 
      key: 'profit',
      header: 'Bénéfice estimé',
      cell: (item: any) => (
        <span className={item.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
          {item.profit.toFixed(2)} €
        </span>
      ),
    },
    { 
      key: 'profitMargin',
      header: 'Marge',
      cell: (item: any) => (
        <span className={item.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}>
          {item.profitMargin.toFixed(1)}%
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analyse d'affaires</h1>
          <p className="text-muted-foreground">
            Suivez vos achats, ventes et bénéfices
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Achats</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPurchases.toFixed(2)} €</div>
            <p className="text-xs text-muted-foreground">
              Commandes reçues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ventes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales.toFixed(2)} €</div>
            <p className="text-xs text-muted-foreground">
              Factures payées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bénéfice Brut</CardTitle>
            <TrendingUp className={`h-4 w-4 ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {grossProfit.toFixed(2)} €
            </div>
            <p className="text-xs text-muted-foreground">
              Marge: {profitMargin.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achats en attente</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPurchases.length}</div>
            <p className="text-xs text-muted-foreground">
              À recevoir
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Achats en attente</TabsTrigger>
          <TabsTrigger value="products">Analyse par produit</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commandes à recevoir</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingPurchases.length > 0 ? (
                <DataTable
                  data={pendingPurchases}
                  columns={pendingPurchaseColumns}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune commande en attente
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance par produit</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={productRotation}
                columns={productAnalyticsColumns}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessAnalytics;

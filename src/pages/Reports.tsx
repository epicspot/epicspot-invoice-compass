import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInvoices } from '@/hooks/useInvoices';
import { useQuotes } from '@/hooks/useQuotes';
import { useClients } from '@/hooks/useClients';
import { useProducts } from '@/hooks/useProducts';
import { BarChart3, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Reports = () => {
  const { invoices } = useInvoices();
  const { quotes } = useQuotes();
  const { clients } = useClients();
  const { products } = useProducts();

  // Calculs pour le mois en cours
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyInvoices = invoices.filter(inv => {
    const invDate = new Date(inv.date);
    return invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear;
  });

  const monthlyRevenue = monthlyInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  const monthlyTax = monthlyInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => {
      const taxAmount = (inv.subtotal || 0) * ((inv.tax || 0) / 100);
      return sum + taxAmount;
    }, 0);

  const pendingInvoices = invoices.filter(inv => inv.status === 'sent').length;
  const pendingAmount = invoices
    .filter(inv => inv.status === 'sent')
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  const quoteConversionRate = quotes.length > 0 
    ? (quotes.filter(q => q.status === 'accepted').length / quotes.length) * 100 
    : 0;

  // Top produits
  const productSales = new Map<string, { count: number; revenue: number; product: any }>();
  
  invoices.forEach(inv => {
    inv.items?.forEach(item => {
      const current = productSales.get(item.product.id) || { count: 0, revenue: 0, product: item.product };
      productSales.set(item.product.id, {
        count: current.count + item.quantity,
        revenue: current.revenue + item.amount,
        product: item.product
      });
    });
  });

  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Top clients
  const clientRevenue = new Map<string, { total: number; invoices: number; client: any }>();
  
  invoices.forEach(inv => {
    if (inv.client && inv.status === 'paid') {
      const current = clientRevenue.get(inv.client.id) || { total: 0, invoices: 0, client: inv.client };
      clientRevenue.set(inv.client.id, {
        total: current.total + (inv.total || 0),
        invoices: current.invoices + 1,
        client: inv.client
      });
    }
  });

  const topClients = Array.from(clientRevenue.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Rapports & Statistiques
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CA du mois</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyRevenue.toLocaleString()} FCFA</div>
            <p className="text-xs text-muted-foreground">
              {monthlyInvoices.length} factures payées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxes collectées</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyTax.toLocaleString()} FCFA</div>
            <p className="text-xs text-muted-foreground">
              Ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAmount.toLocaleString()} FCFA</div>
            <p className="text-xs text-muted-foreground">
              {pendingInvoices} factures
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux conversion</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quoteConversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Devis → Clients
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Produits</CardTitle>
            <CardDescription>Par chiffre d'affaires</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((item, idx) => (
                <div key={item.product.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{idx + 1}</Badge>
                    <div>
                      <div className="font-medium">{item.product.reference}</div>
                      <div className="text-sm text-muted-foreground">{item.product.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{item.revenue.toLocaleString()} FCFA</div>
                    <div className="text-sm text-muted-foreground">{item.count} vendus</div>
                  </div>
                </div>
              ))}
              {topProducts.length === 0 && (
                <p className="text-center text-muted-foreground py-4">Aucune donnée</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Clients</CardTitle>
            <CardDescription>Par chiffre d'affaires</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topClients.map((item, idx) => (
                <div key={item.client.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{idx + 1}</Badge>
                    <div>
                      <div className="font-medium">{item.client.name}</div>
                      <div className="text-sm text-muted-foreground">{item.client.code}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{item.total.toLocaleString()} FCFA</div>
                    <div className="text-sm text-muted-foreground">{item.invoices} factures</div>
                  </div>
                </div>
              ))}
              {topClients.length === 0 && (
                <p className="text-center text-muted-foreground py-4">Aucune donnée</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Statistiques générales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Total Clients</div>
              <div className="text-3xl font-bold">{clients.length}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Total Produits</div>
              <div className="text-3xl font-bold">{products.length}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Total Factures</div>
              <div className="text-3xl font-bold">{invoices.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;

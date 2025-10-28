import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInvoices } from '@/hooks/useInvoices';
import { useQuotes } from '@/hooks/useQuotes';
import { useClients } from '@/hooks/useClients';
import { useProducts } from '@/hooks/useProducts';
import { useCashRegisters } from '@/hooks/useCashRegisters';
import { BarChart3, TrendingUp, DollarSign, Calendar, Download, Filter, Users, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Reports = () => {
  const { invoices } = useInvoices();
  const { quotes } = useQuotes();
  const { clients } = useClients();
  const { products } = useProducts();
  const { cashRegisters, transactions } = useCashRegisters();

  // Filtres de dates
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1); // Premier jour du mois
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedRegister, setSelectedRegister] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');

  // Filtrer les données par période
  const filterByDateRange = (items: any[]) => {
    return items.filter(item => {
      const itemDate = new Date(item.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return itemDate >= start && itemDate <= end;
    });
  };

  const filteredInvoices = filterByDateRange(invoices);
  const filteredTransactions = filterByDateRange(transactions);
  const filteredQuotes = filterByDateRange(quotes);

  // Statistiques générales pour la période
  const totalRevenue = filteredInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  const totalTax = filteredInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.tax || 0), 0);

  const pendingAmount = filteredInvoices
    .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  const forecastRevenue = filteredQuotes
    .filter(q => q.status === 'sent')
    .reduce((sum, q) => sum + (q.total || 0), 0);

  // Rapport par caissier
  const salesByUser = new Map<string, { revenue: number; count: number; userName: string }>();
  
  filteredTransactions
    .filter(t => t.type === 'sale')
    .forEach(trans => {
      const current = salesByUser.get(trans.userId) || { 
        revenue: 0, 
        count: 0, 
        userName: trans.userId === 'current-user' ? 'Utilisateur actuel' : `Caissier ${trans.userId.slice(-4)}`
      };
      salesByUser.set(trans.userId, {
        revenue: current.revenue + trans.amount,
        count: current.count + 1,
        userName: current.userName
      });
    });

  const userSalesData = Array.from(salesByUser.values())
    .sort((a, b) => b.revenue - a.revenue);

  // Rapport par caisse
  const salesByRegister = new Map<string, { revenue: number; count: number; registerName: string }>();
  
  filteredTransactions
    .filter(t => t.type === 'sale')
    .forEach(trans => {
      const register = cashRegisters.find(r => r.id === trans.cashRegisterId);
      const current = salesByRegister.get(trans.cashRegisterId) || { 
        revenue: 0, 
        count: 0, 
        registerName: register?.name || 'Caisse inconnue'
      };
      salesByRegister.set(trans.cashRegisterId, {
        revenue: current.revenue + trans.amount,
        count: current.count + 1,
        registerName: current.registerName
      });
    });

  const registerSalesData = Array.from(salesByRegister.values())
    .sort((a, b) => b.revenue - a.revenue);

  // Ventes par jour
  const salesByDay = new Map<string, number>();
  filteredInvoices
    .filter(inv => inv.status === 'paid')
    .forEach(inv => {
      const day = new Date(inv.date).toLocaleDateString('fr-FR');
      salesByDay.set(day, (salesByDay.get(day) || 0) + inv.total);
    });

  const dailySalesData = Array.from(salesByDay.entries())
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .slice(-30); // 30 derniers jours max

  // Top produits vendus
  const productSales = new Map<string, { count: number; revenue: number; product: any }>();
  
  filteredInvoices.forEach(inv => {
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
    .slice(0, 10);

  // Top clients
  const clientRevenue = new Map<string, { total: number; invoices: number; client: any }>();
  
  filteredInvoices.forEach(inv => {
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
    .slice(0, 10);

  // Fonction d'export (simple CSV)
  const exportToCSV = (data: any[], filename: string) => {
    const csv = data.map(row => Object.values(row).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Rapports & Analyses
        </h1>
      </div>

      {/* Filtres globaux */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="startDate">Date début</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="endDate">Date fin</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Période rapide</Label>
              <Select 
                onValueChange={(value) => {
                  const now = new Date();
                  const end = now.toISOString().split('T')[0];
                  let start = new Date();
                  
                  switch(value) {
                    case 'today':
                      start = now;
                      break;
                    case 'week':
                      start.setDate(now.getDate() - 7);
                      break;
                    case 'month':
                      start.setMonth(now.getMonth() - 1);
                      break;
                    case 'quarter':
                      start.setMonth(now.getMonth() - 3);
                      break;
                    case 'year':
                      start.setFullYear(now.getFullYear() - 1);
                      break;
                  }
                  
                  setStartDate(start.toISOString().split('T')[0]);
                  setEndDate(end);
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="week">7 derniers jours</SelectItem>
                  <SelectItem value="month">30 derniers jours</SelectItem>
                  <SelectItem value="quarter">3 derniers mois</SelectItem>
                  <SelectItem value="year">12 derniers mois</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CA Réalisé</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalRevenue.toLocaleString()} FCFA</div>
            <p className="text-xs text-muted-foreground">
              {filteredInvoices.filter(i => i.status === 'paid').length} factures payées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CA Prévisionnel</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{forecastRevenue.toLocaleString()} FCFA</div>
            <p className="text-xs text-muted-foreground">
              {filteredQuotes.filter(q => q.status === 'sent').length} devis en attente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingAmount.toLocaleString()} FCFA</div>
            <p className="text-xs text-muted-foreground">
              {filteredInvoices.filter(i => i.status === 'sent' || i.status === 'overdue').length} factures impayées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxes collectées</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTax.toLocaleString()} FCFA</div>
            <p className="text-xs text-muted-foreground">
              Pour la période sélectionnée
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Onglets de rapports */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Ventes</TabsTrigger>
          <TabsTrigger value="cashiers">Par Caissier</TabsTrigger>
          <TabsTrigger value="registers">Par Caisse</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>

        {/* Rapport de ventes */}
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Rapport de ventes</CardTitle>
                  <CardDescription>
                    Du {new Date(startDate).toLocaleDateString('fr-FR')} au {new Date(endDate).toLocaleDateString('fr-FR')}
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportToCSV(dailySalesData.map(([date, amount]) => ({ date, amount })), 'ventes.csv')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Nombre de ventes</div>
                    <div className="text-2xl font-bold">{filteredInvoices.filter(i => i.status === 'paid').length}</div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Panier moyen</div>
                    <div className="text-2xl font-bold">
                      {filteredInvoices.filter(i => i.status === 'paid').length > 0
                        ? (totalRevenue / filteredInvoices.filter(i => i.status === 'paid').length).toLocaleString()
                        : 0} FCFA
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Articles vendus</div>
                    <div className="text-2xl font-bold">
                      {filteredInvoices.reduce((sum, inv) => 
                        sum + (inv.items?.reduce((s, item) => s + item.quantity, 0) || 0), 0
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Ventes par jour</h3>
                  <div className="space-y-2">
                    {dailySalesData.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">Aucune vente pour cette période</p>
                    ) : (
                      dailySalesData.map(([date, amount]) => (
                        <div key={date} className="flex justify-between items-center p-2 hover:bg-muted rounded">
                          <span className="text-sm">{date}</span>
                          <span className="font-semibold">{amount.toLocaleString()} FCFA</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rapport par caissier */}
        <TabsContent value="cashiers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Rapport par caissier
                  </CardTitle>
                  <CardDescription>Performance des caissiers sur la période</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportToCSV(userSalesData, 'caissiers.csv')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {userSalesData.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucune donnée pour cette période</p>
              ) : (
                <div className="space-y-3">
                  {userSalesData.map((user, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-lg px-3 py-1">#{idx + 1}</Badge>
                        <div>
                          <div className="font-semibold">{user.userName}</div>
                          <div className="text-sm text-muted-foreground">{user.count} ventes</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">{user.revenue.toLocaleString()} FCFA</div>
                        <div className="text-sm text-muted-foreground">
                          Moy: {(user.revenue / user.count).toLocaleString()} FCFA
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rapport par caisse */}
        <TabsContent value="registers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Rapport par caisse
                  </CardTitle>
                  <CardDescription>Performance des caisses sur la période</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportToCSV(registerSalesData, 'caisses.csv')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {registerSalesData.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucune donnée pour cette période</p>
              ) : (
                <div className="space-y-3">
                  {registerSalesData.map((register, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-lg px-3 py-1">#{idx + 1}</Badge>
                        <div>
                          <div className="font-semibold">{register.registerName}</div>
                          <div className="text-sm text-muted-foreground">{register.count} transactions</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">{register.revenue.toLocaleString()} FCFA</div>
                        <div className="text-sm text-muted-foreground">
                          Moy: {(register.revenue / register.count).toLocaleString()} FCFA
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rapport produits */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Top produits vendus</CardTitle>
                  <CardDescription>Classement par chiffre d'affaires</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportToCSV(topProducts.map(p => ({
                    reference: p.product.reference,
                    description: p.product.description,
                    quantite: p.count,
                    ca: p.revenue
                  })), 'produits.csv')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucune vente de produit</p>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((item, idx) => (
                    <div key={item.product.id} className="flex items-center justify-between p-3 hover:bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{idx + 1}</Badge>
                        <div>
                          <div className="font-medium">{item.product.reference}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {item.product.description}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{item.revenue.toLocaleString()} FCFA</div>
                        <div className="text-sm text-muted-foreground">{item.count} unités</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rapport clients */}
        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Top clients</CardTitle>
                  <CardDescription>Classement par chiffre d'affaires</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportToCSV(topClients.map(c => ({
                    nom: c.client.name,
                    code: c.client.code,
                    factures: c.invoices,
                    ca: c.total
                  })), 'clients.csv')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {topClients.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucun client</p>
              ) : (
                <div className="space-y-3">
                  {topClients.map((item, idx) => (
                    <div key={item.client.id} className="flex items-center justify-between p-3 hover:bg-muted rounded-lg">
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
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;

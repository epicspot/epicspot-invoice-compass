import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCollections } from '@/hooks/useCollections';
import { useVendors } from '@/hooks/useVendors';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, AlertTriangle, Calendar, ArrowUpRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

const CollectionsDashboard = () => {
  const { collections, loading: collectionsLoading } = useCollections();
  const { vendors, loading: vendorsLoading } = useVendors();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  // Calcul des statistiques
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = collections.filter(c => {
      const collectionDate = new Date(c.collectionDate);
      return isWithinInterval(collectionDate, {
        start: startOfMonth(now),
        end: endOfMonth(now)
      });
    });

    const lastMonth = collections.filter(c => {
      const collectionDate = new Date(c.collectionDate);
      return isWithinInterval(collectionDate, {
        start: startOfMonth(subMonths(now, 1)),
        end: endOfMonth(subMonths(now, 1))
      });
    });

    const totalThisMonth = thisMonth.reduce((sum, c) => sum + c.amount, 0);
    const totalLastMonth = lastMonth.reduce((sum, c) => sum + c.amount, 0);
    const percentChange = totalLastMonth > 0 
      ? ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100 
      : 100;

    // Vendeurs actifs ce mois
    const activeVendors = new Set(thisMonth.map(c => c.vendorId)).size;

    // Total à recouvrer (solde restant)
    const totalDebt = vendors.reduce((sum, v) => sum + v.remainingBalance, 0);

    // Taux de recouvrement
    const totalCollected = vendors.reduce((sum, v) => sum + v.paidAmount, 0);
    const totalCredit = vendors.reduce((sum, v) => sum + v.totalDebt, 0);
    const collectionRate = totalCredit > 0 ? (totalCollected / totalCredit) * 100 : 0;

    return {
      totalThisMonth,
      totalLastMonth,
      percentChange,
      activeVendors,
      totalDebt,
      collectionRate,
      collectionsCount: thisMonth.length
    };
  }, [collections, vendors]);

  // Données pour le graphique d'évolution mensuelle
  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i);
      return {
        month: format(date, 'MMM', { locale: fr }),
        date: date
      };
    });

    return months.map(({ month, date }) => {
      const monthCollections = collections.filter(c => {
        const collectionDate = new Date(c.collectionDate);
        return isWithinInterval(collectionDate, {
          start: startOfMonth(date),
          end: endOfMonth(date)
        });
      });

      return {
        month,
        montant: monthCollections.reduce((sum, c) => sum + c.amount, 0),
        nombre: monthCollections.length
      };
    });
  }, [collections]);

  // Top vendeurs
  const topVendors = useMemo(() => {
    const vendorStats = vendors.map(vendor => {
      const vendorCollections = collections.filter(c => c.vendorId === vendor.id);
      const totalCollected = vendorCollections.reduce((sum, c) => sum + c.amount, 0);
      
      return {
        name: vendor.name,
        totalCollected,
        remainingBalance: vendor.remainingBalance,
        collectionsCount: vendorCollections.length,
        collectionRate: vendor.totalDebt > 0 ? (vendor.paidAmount / vendor.totalDebt) * 100 : 0
      };
    }).sort((a, b) => b.totalCollected - a.totalCollected).slice(0, 10);

    return vendorStats;
  }, [vendors, collections]);

  // Répartition par mode de paiement
  const paymentMethodData = useMemo(() => {
    const methods = collections.reduce((acc, c) => {
      const method = c.paymentMethod;
      if (!acc[method]) {
        acc[method] = 0;
      }
      acc[method] += c.amount;
      return acc;
    }, {} as Record<string, number>);

    const labels = {
      cash: 'Espèces',
      check: 'Chèque',
      mobile_money: 'Mobile Money',
      bank_transfer: 'Virement'
    };

    return Object.entries(methods).map(([key, value]) => ({
      name: labels[key as keyof typeof labels] || key,
      value,
      count: collections.filter(c => c.paymentMethod === key).length
    }));
  }, [collections]);

  // Alertes vendeurs en retard
  const alertVendors = useMemo(() => {
    return vendors
      .filter(v => v.remainingBalance > 0 && v.active)
      .sort((a, b) => b.remainingBalance - a.remainingBalance)
      .slice(0, 5);
  }, [vendors]);

  const COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

  if (collectionsLoading || vendorsLoading) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord - Recouvrements</h1>
          <p className="text-muted-foreground">Vue d'ensemble des performances de recouvrement</p>
        </div>
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          Exporter le rapport
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recouvrements ce mois</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalThisMonth.toLocaleString()} FCFA</div>
            <p className="text-xs text-muted-foreground flex items-center">
              {stats.percentChange >= 0 ? (
                <>
                  <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                  <span className="text-green-600">+{stats.percentChange.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
                  <span className="text-red-600">{stats.percentChange.toFixed(1)}%</span>
                </>
              )}
              <span className="ml-1">vs mois dernier</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendeurs actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeVendors}</div>
            <p className="text-xs text-muted-foreground">
              {stats.collectionsCount} recouvrements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solde à recouvrer</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDebt.toLocaleString()} FCFA</div>
            <p className="text-xs text-muted-foreground">
              Sur {vendors.length} vendeurs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de recouvrement</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.collectionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Performance globale
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <Tabs defaultValue="evolution" className="space-y-4">
        <TabsList>
          <TabsTrigger value="evolution">Évolution</TabsTrigger>
          <TabsTrigger value="vendors">Top vendeurs</TabsTrigger>
          <TabsTrigger value="payment">Modes de paiement</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
        </TabsList>

        <TabsContent value="evolution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Évolution mensuelle des recouvrements</CardTitle>
              <CardDescription>Montants recouvrés par mois (6 derniers mois)</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
                  <Legend />
                  <Line type="monotone" dataKey="montant" stroke="#0ea5e9" strokeWidth={2} name="Montant" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 vendeurs - Performances</CardTitle>
              <CardDescription>Classement par montant total recouvré</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topVendors}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
                  <Legend />
                  <Bar dataKey="totalCollected" fill="#0ea5e9" name="Recouvré" />
                  <Bar dataKey="remainingBalance" fill="#f59e0b" name="Restant" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Répartition par mode de paiement</CardTitle>
              <CardDescription>Distribution des montants recouvrés</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertes - Vendeurs avec soldes impayés</CardTitle>
              <CardDescription>Top 5 des vendeurs nécessitant un suivi prioritaire</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alertVendors.map((vendor, index) => (
                  <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="destructive" className="h-8 w-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{vendor.name}</p>
                        <p className="text-sm text-muted-foreground">{vendor.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">
                        {vendor.remainingBalance.toLocaleString()} FCFA
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Dette totale: {vendor.totalDebt.toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>
                ))}
                {alertVendors.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Aucun vendeur avec solde impayé</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CollectionsDashboard;

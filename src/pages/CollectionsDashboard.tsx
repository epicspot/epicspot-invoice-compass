import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCollections } from '@/hooks/useCollections';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, FileText, Calendar, FileDown } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { exportCollectionsPDF, exportCollectionsExcel } from '@/lib/utils/exportCollectionsUtils';
import { LoadingState } from '@/components/LoadingState';
import { toast } from '@/hooks/use-toast';

const CollectionsDashboard = () => {
  const { collections, loading: collectionsLoading } = useCollections();
  const { companyInfo } = useCompanyInfo();

  const handleExportPDF = () => {
    try {
      exportCollectionsPDF({ collections, stats }, companyInfo);
      toast({
        title: "Export réussi",
        description: "Le rapport PDF a été téléchargé avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible de générer le rapport PDF.",
        variant: "destructive",
      });
    }
  };

  const handleExportExcel = () => {
    try {
      exportCollectionsExcel({ collections, stats });
      toast({
        title: "Export réussi",
        description: "Le rapport Excel a été téléchargé avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible de générer le rapport Excel.",
        variant: "destructive",
      });
    }
  };

  // Calcul des statistiques
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = collections.filter(c => {
      const collectionDate = new Date(c.createdAt);
      return isWithinInterval(collectionDate, {
        start: startOfMonth(now),
        end: endOfMonth(now)
      });
    });

    const lastMonth = collections.filter(c => {
      const collectionDate = new Date(c.createdAt);
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

    return {
      totalThisMonth,
      totalLastMonth,
      percentChange,
      collectionRate: 85, // Placeholder
      collectionsCount: thisMonth.length
    };
  }, [collections]);

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
        const collectionDate = new Date(c.createdAt);
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

  const COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

  if (collectionsLoading) {
    return <LoadingState variant="dashboard" message="Chargement du tableau de bord..." />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord - Recouvrements</h1>
          <p className="text-muted-foreground">Vue d'ensemble des performances de recouvrement</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportPDF} variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" />
            Export PDF
          </Button>
          <Button onClick={handleExportExcel} className="gap-2">
            <FileDown className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            <CardTitle className="text-sm font-medium">Nombre de recouvrements</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.collectionsCount}</div>
            <p className="text-xs text-muted-foreground">
              Ce mois-ci
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de recouvrement</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
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
          <TabsTrigger value="payment">Modes de paiement</TabsTrigger>
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
      </Tabs>
    </div>
  );
};

export default CollectionsDashboard;

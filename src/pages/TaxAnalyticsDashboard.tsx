import { useState, useMemo } from 'react';
import { useTaxDeclarations } from '@/hooks/useTaxDeclarations';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, FileText, Calendar, BarChart3, Download, FileSpreadsheet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { exportTaxAnalyticsToExcel, exportQuickTaxSummary } from '@/lib/utils/taxAnalyticsExcelUtils';
import { toast } from 'sonner';

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#ca8a04', '#7c3aed', '#ea580c'];

export default function TaxAnalyticsDashboard() {
  const { declarations, loading } = useTaxDeclarations();
  const { companyInfo } = useCompanyInfo();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [comparisonYear, setComparisonYear] = useState(selectedYear - 1);

  const handleExportComplete = () => {
    try {
      exportTaxAnalyticsToExcel(
        monthlyData,
        vatRateDistribution,
        yearSummary,
        selectedYear,
        comparisonYear,
        companyInfo
      );
      toast.success('Rapport Excel exporté avec succès');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export Excel');
    }
  };

  const handleQuickExport = () => {
    try {
      exportQuickTaxSummary(monthlyData, selectedYear, companyInfo);
      toast.success('Résumé Excel exporté avec succès');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export');
    }
  };

  // Get available years from declarations
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    declarations.forEach(d => {
      years.add(new Date(d.period_start).getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [declarations]);

  // Monthly evolution data
  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => i);
    
    return months.map(month => {
      const currentYearDecls = declarations.filter(d => {
        const date = new Date(d.period_start);
        return date.getFullYear() === selectedYear && date.getMonth() === month;
      });

      const previousYearDecls = declarations.filter(d => {
        const date = new Date(d.period_start);
        return date.getFullYear() === comparisonYear && date.getMonth() === month;
      });

      const currentVatCollected = currentYearDecls.reduce((sum, d) => sum + Number(d.vat_collected), 0);
      const currentVatPaid = currentYearDecls.reduce((sum, d) => sum + Number(d.vat_paid), 0);
      const currentVatDue = currentYearDecls.reduce((sum, d) => sum + Number(d.vat_due), 0);

      const previousVatDue = previousYearDecls.reduce((sum, d) => sum + Number(d.vat_due), 0);

      return {
        month: format(new Date(selectedYear, month, 1), 'MMM', { locale: fr }),
        vatCollected: currentVatCollected,
        vatPaid: currentVatPaid,
        vatDue: currentVatDue,
        previousYearVatDue: previousVatDue
      };
    });
  }, [declarations, selectedYear, comparisonYear]);

  // Distribution by VAT rate
  const vatRateDistribution = useMemo(() => {
    const rateMap = new Map<number, { collected: number; paid: number }>();

    declarations
      .filter(d => new Date(d.period_start).getFullYear() === selectedYear)
      .forEach(d => {
        if (d.details?.sales_by_rate) {
          Object.entries(d.details.sales_by_rate).forEach(([rate, data]: [string, any]) => {
            const numRate = Number(rate);
            const current = rateMap.get(numRate) || { collected: 0, paid: 0 };
            current.collected += Number(data.vat);
            rateMap.set(numRate, current);
          });
        }

        if (d.details?.purchases_by_rate) {
          Object.entries(d.details.purchases_by_rate).forEach(([rate, data]: [string, any]) => {
            const numRate = Number(rate);
            const current = rateMap.get(numRate) || { collected: 0, paid: 0 };
            current.paid += Number(data.vat);
            rateMap.set(numRate, current);
          });
        }
      });

    return Array.from(rateMap.entries()).map(([rate, data]) => ({
      rate: `${rate}%`,
      vatCollected: data.collected,
      vatPaid: data.paid,
      net: data.collected - data.paid
    }));
  }, [declarations, selectedYear]);

  // Year summary statistics
  const yearSummary = useMemo(() => {
    const currentDecls = declarations.filter(d => 
      new Date(d.period_start).getFullYear() === selectedYear
    );
    const previousDecls = declarations.filter(d => 
      new Date(d.period_start).getFullYear() === comparisonYear
    );

    const current = {
      totalSales: currentDecls.reduce((sum, d) => sum + Number(d.total_sales), 0),
      totalPurchases: currentDecls.reduce((sum, d) => sum + Number(d.total_purchases), 0),
      vatCollected: currentDecls.reduce((sum, d) => sum + Number(d.vat_collected), 0),
      vatPaid: currentDecls.reduce((sum, d) => sum + Number(d.vat_paid), 0),
      vatDue: currentDecls.reduce((sum, d) => sum + Number(d.vat_due), 0),
      declarationsCount: currentDecls.length
    };

    const previous = {
      vatDue: previousDecls.reduce((sum, d) => sum + Number(d.vat_due), 0)
    };

    const vatDueChange = previous.vatDue > 0 
      ? ((current.vatDue - previous.vatDue) / previous.vatDue) * 100 
      : 0;

    return { current, previous, vatDueChange };
  }, [declarations, selectedYear, comparisonYear]);

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tableau de Bord TVA</h1>
          <p className="text-muted-foreground">Analyses et statistiques détaillées de vos déclarations fiscales</p>
        </div>
        <div className="flex gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Exporter Excel
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportComplete}>
                <Download className="h-4 w-4 mr-2" />
                Rapport complet
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleQuickExport}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Résumé rapide
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(Number(v))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Année" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={comparisonYear.toString()} onValueChange={(v) => setComparisonYear(Number(v))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Comparer à" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()}>vs {year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TVA à Payer ({selectedYear})</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(yearSummary.current.vatDue)}</div>
            <div className={`flex items-center text-xs ${yearSummary.vatDueChange >= 0 ? 'text-red-500' : 'text-green-500'}`}>
              {yearSummary.vatDueChange >= 0 ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {Math.abs(yearSummary.vatDueChange).toFixed(1)}% vs {comparisonYear}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TVA Collectée</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(yearSummary.current.vatCollected)}</div>
            <p className="text-xs text-muted-foreground">Sur ventes de {formatCurrency(yearSummary.current.totalSales)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TVA Déductible</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(yearSummary.current.vatPaid)}</div>
            <p className="text-xs text-muted-foreground">Sur achats de {formatCurrency(yearSummary.current.totalPurchases)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Déclarations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{yearSummary.current.declarationsCount}</div>
            <p className="text-xs text-muted-foreground">En {selectedYear}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="evolution" className="space-y-4">
        <TabsList>
          <TabsTrigger value="evolution">Évolution Mensuelle</TabsTrigger>
          <TabsTrigger value="rates">Répartition par Taux</TabsTrigger>
          <TabsTrigger value="comparison">Comparaison Annuelle</TabsTrigger>
        </TabsList>

        <TabsContent value="evolution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Évolution de la TVA en {selectedYear}</CardTitle>
              <CardDescription>Comparaison mensuelle de la TVA collectée, déductible et à payer</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="vatCollected" stroke="#16a34a" name="TVA Collectée" strokeWidth={2} />
                  <Line type="monotone" dataKey="vatPaid" stroke="#dc2626" name="TVA Déductible" strokeWidth={2} />
                  <Line type="monotone" dataKey="vatDue" stroke="#2563eb" name="TVA à Payer" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Détail Mensuel par Type de TVA</CardTitle>
              <CardDescription>Vue détaillée des montants mensuels</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="vatCollected" fill="#16a34a" name="TVA Collectée" />
                  <Bar dataKey="vatPaid" fill="#dc2626" name="TVA Déductible" />
                  <Bar dataKey="vatDue" fill="#2563eb" name="TVA à Payer" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Répartition de la TVA Collectée par Taux</CardTitle>
                <CardDescription>Distribution des montants selon les taux appliqués</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={vatRateDistribution}
                      dataKey="vatCollected"
                      nameKey="rate"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={(entry) => `${entry.rate}: ${formatCurrency(entry.vatCollected)}`}
                    >
                      {vatRateDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analyse par Taux de TVA</CardTitle>
                <CardDescription>Comparaison collectée vs déductible</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={vatRateDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                    <YAxis type="category" dataKey="rate" />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="vatCollected" fill="#16a34a" name="Collectée" />
                    <Bar dataKey="vatPaid" fill="#dc2626" name="Déductible" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Solde Net par Taux</CardTitle>
              <CardDescription>TVA collectée moins TVA déductible pour chaque taux</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={vatRateDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rate" />
                  <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="net" fill="#2563eb" name="Solde Net">
                    {vatRateDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.net >= 0 ? '#16a34a' : '#dc2626'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparaison {selectedYear} vs {comparisonYear}</CardTitle>
              <CardDescription>Évolution mensuelle de la TVA à payer entre les deux années</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="vatDue" 
                    stroke="#2563eb" 
                    name={`TVA ${selectedYear}`} 
                    strokeWidth={3} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="previousYearVatDue" 
                    stroke="#94a3b8" 
                    name={`TVA ${comparisonYear}`} 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Moyenne Mensuelle {selectedYear}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(yearSummary.current.vatDue / 12)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Moyenne Mensuelle {comparisonYear}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(yearSummary.previous.vatDue / 12)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Variation Annuelle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${yearSummary.vatDueChange >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {yearSummary.vatDueChange >= 0 ? '+' : ''}{yearSummary.vatDueChange.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CashForecastWidget } from '@/components/analytics/CashForecastWidget';
import { DashboardBuilder } from '@/components/analytics/DashboardBuilder';
import { ReportBuilder } from '@/components/analytics/ReportBuilder';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, LayoutDashboard, FileText, BarChart3 } from 'lucide-react';

export default function AdvancedAnalytics() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Analytics & Business Intelligence
        </h1>
        <p className="text-muted-foreground mt-2">
          Analyses avancées, prévisions IA et rapports personnalisés
        </p>
      </div>

      <Tabs defaultValue="forecast" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="forecast" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Prévisions IA
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <FileText className="h-4 w-4" />
            Rapports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="mt-6">
          <CashForecastWidget />
        </TabsContent>

        <TabsContent value="dashboard" className="mt-6">
          <DashboardBuilder />
        </TabsContent>

        <TabsContent value="reports" className="mt-6 space-y-6">
          <ReportBuilder />
          
          <Card>
            <CardHeader>
              <CardTitle>Comparaisons périodiques</CardTitle>
              <CardDescription>
                Analysez l'évolution de vos performances dans le temps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Mois vs Mois</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-500">+12.5%</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Croissance par rapport au mois dernier
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Trimestre vs Trimestre</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-500">+8.3%</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Croissance trimestrielle
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Année vs Année</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-500">+23.7%</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Croissance annuelle
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

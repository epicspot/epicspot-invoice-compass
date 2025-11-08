import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useLogger } from '@/hooks/useLogger';
import { useRetryMonitoring } from '@/hooks/useRetryMonitoring';
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';
import { PerformanceMetrics } from './PerformanceMetrics';
import { RetryCharts } from './RetryCharts';
import { SupervisionWidgets } from './supervision/SupervisionWidgets';
import { ReportGenerator } from './supervision/ReportGenerator';
import { 
  Activity, 
  AlertCircle, 
  RefreshCw, 
  FileText,
  TrendingUp,
  Settings,
  Download,
  Trash2,
  LayoutGrid
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function SupervisionDashboard() {
  const [selectedWidget, setSelectedWidget] = useState<string[]>([
    'logs',
    'retry',
    'performance'
  ]);

  const logger = useLogger();
  const retryMonitoring = useRetryMonitoring();
  const performanceMetrics = usePerformanceMetrics();

  const logStats = logger.getLogStats();
  const retryStats = retryMonitoring.getSuccessRate();

  const handleExportAll = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      logs: logger.logs,
      retryStats: retryMonitoring.stats,
      performanceMetrics: performanceMetrics.metrics
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `supervision-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    logger.info('system', 'Supervision data exported', { fileName: exportFileDefaultName });
  };

  const handleClearAll = () => {
    if (confirm('Êtes-vous sûr de vouloir effacer toutes les données de supervision ?')) {
      logger.clearLogs();
      retryMonitoring.clearStats();
      performanceMetrics.clearMetrics();
      logger.success('system', 'All supervision data cleared');
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supervision Globale</h1>
          <p className="text-muted-foreground">
            Monitoring centralisé des logs, retries et performances
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportAll} className="gap-2">
            <Download className="h-4 w-4" />
            Exporter tout
          </Button>
          <Button variant="destructive" onClick={handleClearAll} className="gap-2">
            <Trash2 className="h-4 w-4" />
            Tout effacer
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logStats.total}</div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {logStats.byLevel.error > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {logStats.byLevel.error} erreurs
                </Badge>
              )}
              {logStats.byLevel.warn > 0 && (
                <Badge variant="outline" className="text-xs">
                  {logStats.byLevel.warn} warnings
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taux Retry</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {retryStats.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {retryMonitoring.stats.totalAttempts} tentatives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceMetrics.metrics.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              métriques enregistrées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">État Système</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium">Opérationnel</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tous les services actifs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Critical Events */}
      {logStats.byLevel.error > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreurs critiques détectées</AlertTitle>
          <AlertDescription>
            {logStats.byLevel.error} erreur(s) enregistrée(s) récemment. Consultez l'onglet Logs pour plus de détails.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="widgets" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="widgets" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            Widgets
          </TabsTrigger>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="retry">Retry</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="widgets" className="space-y-4">
          <SupervisionWidgets />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <ReportGenerator />
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Logs Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Résumé des Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 rounded border">
                      <span className="text-sm">Total</span>
                      <Badge>{logStats.total}</Badge>
                    </div>
                    <div className="flex justify-between p-2 rounded border">
                      <span className="text-sm">Dernières 24h</span>
                      <Badge variant="outline">{logStats.last24h}</Badge>
                    </div>
                    <div className="flex justify-between p-2 rounded border">
                      <span className="text-sm">Derniers 7 jours</span>
                      <Badge variant="outline">{logStats.last7d}</Badge>
                    </div>
                    {Object.entries(logStats.byLevel).map(([level, count]) => (
                      count > 0 && (
                        <div key={level} className="flex justify-between p-2 rounded border">
                          <span className="text-sm capitalize">{level}</span>
                          <Badge variant={level === 'error' ? 'destructive' : 'secondary'}>
                            {count}
                          </Badge>
                        </div>
                      )
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Retry Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Statistiques Retry
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 rounded border">
                      <span className="text-sm">Taux de succès</span>
                      <Badge variant="outline">{retryStats.toFixed(1)}%</Badge>
                    </div>
                    <div className="flex justify-between p-2 rounded border">
                      <span className="text-sm">Total tentatives</span>
                      <Badge>{retryMonitoring.stats.totalAttempts}</Badge>
                    </div>
                    <div className="flex justify-between p-2 rounded border">
                      <span className="text-sm">Succès</span>
                      <Badge variant="outline">{retryMonitoring.stats.successfulRetries}</Badge>
                    </div>
                    <div className="flex justify-between p-2 rounded border">
                      <span className="text-sm">Échecs</span>
                      <Badge variant="destructive">{retryMonitoring.stats.failedRetries}</Badge>
                    </div>
                    {retryMonitoring.stats.averageDuration > 0 && (
                      <div className="flex justify-between p-2 rounded border">
                        <span className="text-sm">Durée moyenne</span>
                        <Badge variant="secondary">
                          {Math.round(retryMonitoring.stats.averageDuration)}ms
                        </Badge>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Journal Système Détaillé</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {logger.logs.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    Aucun log enregistré
                  </div>
                ) : (
                  <div className="space-y-2">
                    {logger.logs.slice(0, 50).map((log) => (
                      <div
                        key={log.id}
                        className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={
                                log.level === 'error' ? 'destructive' :
                                log.level === 'warn' ? 'outline' :
                                log.level === 'success' ? 'default' : 'secondary'
                              }>
                                {log.level}
                              </Badge>
                              <Badge variant="outline">{log.category}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(log.timestamp).toLocaleString('fr-FR')}
                              </span>
                            </div>
                            <p className="text-sm font-medium">{log.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retry">
          <RetryCharts stats={retryMonitoring.stats} />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceMetrics />
        </TabsContent>
      </Tabs>
    </div>
  );
}

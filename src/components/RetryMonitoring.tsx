import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  Trash2,
  BarChart3,
  LineChart
} from 'lucide-react';
import { useRetryMonitoring } from '@/hooks/useRetryMonitoring';
import { RetryCharts } from './RetryCharts';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const RetryMonitoring = () => {
  const {
    stats,
    isEnabled,
    clearStats,
    toggleMonitoring,
    getSuccessRate,
    getTopErrors,
    getOperationStats,
  } = useRetryMonitoring();

  const successRate = getSuccessRate();
  const topErrors = getTopErrors(5);
  const operationStats = getOperationStats();

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getErrorMessage = (code: string) => {
    const errorMessages: Record<string, string> = {
      'PGRST116': 'Aucune donnée trouvée',
      '23505': 'Entrée dupliquée',
      '23503': 'Référence invalide',
      '42501': 'Permission refusée',
      'NETWORK_ERROR': 'Erreur réseau',
      'TIMEOUT': 'Délai dépassé',
    };
    return errorMessages[code] || code;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Monitoring des Retries</h2>
          <p className="text-muted-foreground mt-1">
            Statistiques et métriques de performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="monitoring"
              checked={isEnabled}
              onCheckedChange={toggleMonitoring}
            />
            <Label htmlFor="monitoring">
              {isEnabled ? 'Activé' : 'Désactivé'}
            </Label>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearStats}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Réinitialiser
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="charts" className="gap-2">
            <LineChart className="h-4 w-4" />
            Graphiques
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Succès</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            <Progress value={successRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {stats.successfulRetries} succès / {stats.failedRetries} échecs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tentatives</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAttempts}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Toutes opérations confondues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps Moyen</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(stats.averageDuration)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Par opération
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opérations</CardTitle>
            <BarChart3 className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(stats.errorsByOperation).length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Types d'opérations
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Errors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Erreurs Fréquentes
            </CardTitle>
            <CardDescription>
              Les codes d'erreur les plus rencontrés
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topErrors.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucune erreur enregistrée
              </p>
            ) : (
              <div className="space-y-3">
                {topErrors.map((error, index) => (
                  <div key={error.code} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">
                        #{index + 1}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">{error.code}</p>
                        <p className="text-xs text-muted-foreground">
                          {getErrorMessage(error.code)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="destructive">{error.count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Operations Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Statistiques par Opération
            </CardTitle>
            <CardDescription>
              Performance des différentes opérations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {operationStats.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Aucune opération enregistrée
                </p>
              ) : (
                <div className="space-y-4">
                  {operationStats.map((op) => (
                    <div key={op.operation} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{op.operation}</p>
                        <Badge variant={op.successRate > 80 ? 'default' : 'destructive'}>
                          {op.successRate.toFixed(0)}%
                        </Badge>
                      </div>
                      <Progress value={op.successRate} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{op.attempts} tentatives</span>
                        <span>{formatDuration(op.avgDuration)} moy.</span>
                      </div>
                      <Separator />
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Recent Retries */}
      <Card>
        <CardHeader>
          <CardTitle>Historique Récent</CardTitle>
          <CardDescription>
            Les {Math.min(stats.recentRetries.length, 20)} dernières tentatives de retry
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {stats.recentRetries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucun retry enregistré
              </p>
            ) : (
              <div className="space-y-2">
                {stats.recentRetries.slice(0, 20).map((retry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {retry.success ? (
                        <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{retry.operation}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(retry.timestamp, { addSuffix: true, locale: fr })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge variant="outline" className="font-mono text-xs">
                        {retry.attempts}x
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {formatDuration(retry.duration)}
                      </Badge>
                      {retry.errorCode && (
                        <Badge variant="destructive" className="text-xs font-mono">
                          {retry.errorCode}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <RetryCharts stats={stats} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

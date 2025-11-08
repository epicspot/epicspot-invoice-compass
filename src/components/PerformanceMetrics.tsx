import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';
import { Activity, Zap, TrendingUp, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

export function PerformanceMetrics() {
  const { getStats } = usePerformanceMetrics();
  const stats = getStats();

  const getPerformanceLevel = (time: number): { level: string; color: string } => {
    if (time < 1000) return { level: 'Excellent', color: 'text-green-500' };
    if (time < 2000) return { level: 'Bon', color: 'text-blue-500' };
    if (time < 3000) return { level: 'Moyen', color: 'text-yellow-500' };
    return { level: 'Lent', color: 'text-red-500' };
  };

  const navPerf = getPerformanceLevel(stats.avgNavigationTime);
  const apiPerf = getPerformanceLevel(stats.avgApiTime);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Temps Navigation</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgNavigationTime > 0 ? `${Math.round(stats.avgNavigationTime)}ms` : 'N/A'}
            </div>
            <p className={`text-xs ${navPerf.color}`}>
              {navPerf.level}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Temps API Moyen</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgApiTime > 0 ? `${Math.round(stats.avgApiTime)}ms` : 'N/A'}
            </div>
            <p className={`text-xs ${apiPerf.color}`}>
              {apiPerf.level}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Appels API</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApiCalls}</div>
            <p className="text-xs text-muted-foreground">
              Total enregistrés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taux d'Erreur API</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalApiCalls > 0 
                ? `${((stats.failedApiCalls / stats.totalApiCalls) * 100).toFixed(1)}%`
                : '0%'
              }
            </div>
            <Progress 
              value={stats.totalApiCalls > 0 ? (stats.failedApiCalls / stats.totalApiCalls) * 100 : 0} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Opérations les plus lentes</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            {stats.slowestOperations.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Aucune métrique enregistrée
              </div>
            ) : (
              <div className="space-y-2">
                {stats.slowestOperations.map((op, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{op.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{op.type}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm">{Math.round(op.duration)}ms</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

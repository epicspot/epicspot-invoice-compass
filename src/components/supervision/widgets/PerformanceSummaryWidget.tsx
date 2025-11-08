import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, TrendingUp } from 'lucide-react';

export function PerformanceSummaryWidget() {
  const { getStats } = usePerformanceMetrics();
  const stats = getStats();

  const getStatusColor = (time: number) => {
    if (time < 1000) return 'text-success';
    if (time < 2000) return 'text-blue-500';
    if (time < 3000) return 'text-yellow-500';
    return 'text-destructive';
  };

  const getStatusLabel = (time: number) => {
    if (time < 1000) return 'Excellent';
    if (time < 2000) return 'Bon';
    if (time < 3000) return 'Moyen';
    return 'Lent';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-2 rounded bg-muted/50">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Navigation</p>
            <p className="text-sm font-bold">
              {stats.avgNavigationTime > 0 ? `${Math.round(stats.avgNavigationTime)}ms` : 'N/A'}
            </p>
          </div>
        </div>
        {stats.avgNavigationTime > 0 && (
          <Badge variant="outline" className={getStatusColor(stats.avgNavigationTime)}>
            {getStatusLabel(stats.avgNavigationTime)}
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between p-2 rounded bg-muted/50">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">API Moyen</p>
            <p className="text-sm font-bold">
              {stats.avgApiTime > 0 ? `${Math.round(stats.avgApiTime)}ms` : 'N/A'}
            </p>
          </div>
        </div>
        {stats.avgApiTime > 0 && (
          <Badge variant="outline" className={getStatusColor(stats.avgApiTime)}>
            {getStatusLabel(stats.avgApiTime)}
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between p-2 rounded bg-muted/50">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Appels API</span>
        </div>
        <Badge>{stats.totalApiCalls}</Badge>
      </div>
    </div>
  );
}

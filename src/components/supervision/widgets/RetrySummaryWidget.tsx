import { useRetryMonitoring } from '@/hooks/useRetryMonitoring';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

export function RetrySummaryWidget() {
  const { stats, getSuccessRate } = useRetryMonitoring();
  const successRate = getSuccessRate();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Taux de succès</span>
          <Badge variant={successRate > 80 ? 'default' : successRate > 50 ? 'secondary' : 'destructive'}>
            {successRate.toFixed(1)}%
          </Badge>
        </div>
        <Progress value={successRate} className="h-2" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Tentatives</p>
            <p className="text-lg font-bold">{stats.totalAttempts}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded bg-success/10">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <div>
            <p className="text-xs text-muted-foreground">Succès</p>
            <p className="text-lg font-bold">{stats.successfulRetries}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded bg-destructive/10">
          <XCircle className="h-4 w-4 text-destructive" />
          <div>
            <p className="text-xs text-muted-foreground">Échecs</p>
            <p className="text-lg font-bold">{stats.failedRetries}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
          <div>
            <p className="text-xs text-muted-foreground">Durée moy.</p>
            <p className="text-lg font-bold">{Math.round(stats.averageDuration)}ms</p>
          </div>
        </div>
      </div>
    </div>
  );
}

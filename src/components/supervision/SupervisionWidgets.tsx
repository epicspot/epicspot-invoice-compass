import { WidgetGrid, WidgetConfig } from './WidgetGrid';
import { LogsSummaryWidget } from './widgets/LogsSummaryWidget';
import { RetrySummaryWidget } from './widgets/RetrySummaryWidget';
import { PerformanceSummaryWidget } from './widgets/PerformanceSummaryWidget';
import { RecentLogsWidget } from './widgets/RecentLogsWidget';
import { RetryCharts } from '../RetryCharts';
import { useRetryMonitoring } from '@/hooks/useRetryMonitoring';
import { useLogger } from '@/hooks/useLogger';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { AlertCircle } from 'lucide-react';

export function SupervisionWidgets() {
  const retryMonitoring = useRetryMonitoring();
  const logger = useLogger();

  const renderWidget = (widget: WidgetConfig) => {
    switch (widget.type) {
      case 'logs-summary':
        return <LogsSummaryWidget key={widget.id} />;
      
      case 'retry-summary':
        return <RetrySummaryWidget key={widget.id} />;
      
      case 'performance-summary':
        return <PerformanceSummaryWidget key={widget.id} />;
      
      case 'error-rate':
        const logStats = logger.getLogStats();
        const errorRate = logStats.total > 0 ? (logStats.byLevel.error || 0) / logStats.total * 100 : 0;
        return (
          <div key={widget.id} className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {errorRate.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Taux d'erreur global</p>
            </div>
            <Progress value={errorRate} className="h-2" />
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 rounded bg-muted/50">
                <p className="text-muted-foreground">Total logs</p>
                <p className="font-bold">{logStats.total}</p>
              </div>
              <div className="text-center p-2 rounded bg-destructive/10">
                <p className="text-muted-foreground">Erreurs</p>
                <p className="font-bold text-destructive">{logStats.byLevel.error || 0}</p>
              </div>
            </div>
          </div>
        );
      
      case 'recent-logs':
        return <RecentLogsWidget key={widget.id} />;
      
      case 'retry-chart':
        return (
          <div key={widget.id} className="h-[400px]">
            <RetryCharts stats={retryMonitoring.stats} />
          </div>
        );
      
      case 'alerts':
        const criticalLogs = logger.logs.filter(log => 
          log.level === 'error' && 
          (log.message.toLowerCase().includes('critical') || log.category === 'security')
        ).slice(0, 5);
        
        return (
          <ScrollArea key={widget.id} className="h-[250px]">
            {criticalLogs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 text-sm">
                Aucune alerte active
              </div>
            ) : (
              <div className="space-y-2">
                {criticalLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg border border-destructive/20 bg-destructive/5 animate-fade-in"
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="destructive" className="text-xs">
                            {log.category}
                          </Badge>
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
        );
      
      case 'operations':
        const opStats = retryMonitoring.getOperationStats().slice(0, 5);
        
        return (
          <ScrollArea key={widget.id} className="h-[250px]">
            {opStats.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 text-sm">
                Aucune opération enregistrée
              </div>
            ) : (
              <div className="space-y-2">
                {opStats.map((op) => (
                  <div
                    key={op.operation}
                    className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium truncate">{op.operation}</span>
                      <Badge variant={op.successRate > 80 ? 'default' : 'destructive'}>
                        {op.successRate.toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-1 rounded bg-muted/50">
                        <p className="text-muted-foreground">Tentatives</p>
                        <p className="font-bold">{op.attempts}</p>
                      </div>
                      <div className="text-center p-1 rounded bg-success/10">
                        <p className="text-muted-foreground">Succès</p>
                        <p className="font-bold text-success">{op.successes}</p>
                      </div>
                      <div className="text-center p-1 rounded bg-destructive/10">
                        <p className="text-muted-foreground">Échecs</p>
                        <p className="font-bold text-destructive">{op.failures}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        );
      
      default:
        return <div key={widget.id}>Widget non implémenté</div>;
    }
  };

  return (
    <WidgetGrid>
      {(widgets) => widgets.map(renderWidget)}
    </WidgetGrid>
  );
}

import { useLogger } from '@/hooks/useLogger';
import { Badge } from '@/components/ui/badge';
import { FileText, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export function LogsSummaryWidget() {
  const logger = useLogger();
  const stats = logger.getLogStats();

  return (
    <ScrollArea className="h-[200px]">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Total</span>
          </div>
          <Badge variant="outline">{stats.total}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Dernières 24h</span>
          <Badge variant="secondary">{stats.last24h}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Derniers 7 jours</span>
          <Badge variant="secondary">{stats.last7d}</Badge>
        </div>

        {stats.byLevel.error > 0 && (
          <div className="flex items-center justify-between p-2 rounded bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium">Erreurs</span>
            </div>
            <Badge variant="destructive">{stats.byLevel.error}</Badge>
          </div>
        )}

        {Object.entries(stats.byCategory).map(([category, count]) => (
          count > 0 && (
            <div key={category} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground capitalize">{category}</span>
              <Badge variant="outline">{count}</Badge>
            </div>
          )
        ))}
      </div>
    </ScrollArea>
  );
}

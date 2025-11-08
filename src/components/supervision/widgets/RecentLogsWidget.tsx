import { useLogger } from '@/hooks/useLogger';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export function RecentLogsWidget() {
  const logger = useLogger();
  const recentLogs = logger.logs.slice(0, 10);

  return (
    <ScrollArea className="h-[400px]">
      {recentLogs.length === 0 ? (
        <div className="text-center text-muted-foreground py-8 text-sm">
          Aucun log récent
        </div>
      ) : (
        <div className="space-y-2">
          {recentLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors animate-fade-in"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge
                      variant={
                        log.level === 'error' ? 'destructive' :
                        log.level === 'warn' ? 'outline' :
                        log.level === 'success' ? 'default' : 'secondary'
                      }
                      className="text-xs"
                    >
                      {log.level}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{log.category}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleTimeString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate">{log.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  );
}

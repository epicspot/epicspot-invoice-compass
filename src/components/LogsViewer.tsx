import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLogger, LogLevel, LogCategory } from '@/hooks/useLogger';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Bug,
  Info,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Search,
  Trash2,
  Download,
  Filter,
  Activity,
  Database,
  Lock,
  Zap,
  Code,
  ShieldAlert,
  BarChart3
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const levelIcons = {
  debug: Bug,
  info: Info,
  warn: AlertTriangle,
  error: XCircle,
  success: CheckCircle
};

const levelColors = {
  debug: 'bg-muted text-muted-foreground',
  info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  warn: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  error: 'bg-destructive/10 text-destructive border-destructive/20',
  success: 'bg-green-500/10 text-green-500 border-green-500/20'
};

const categoryIcons = {
  system: Activity,
  auth: Lock,
  api: Zap,
  database: Database,
  ui: Code,
  business: BarChart3,
  security: ShieldAlert
};

export function LogsViewer() {
  const { logs, enabled, clearLogs, exportLogs, getLogStats, toggleLogging } = useLogger();
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<LogCategory | 'all'>('all');

  const stats = getLogStats();

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = searchTerm === '' || 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
      const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;

      return matchesSearch && matchesLevel && matchesCategory;
    });
  }, [logs, searchTerm, levelFilter, categoryFilter]);

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total des logs</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Dernières 24h</CardDescription>
            <CardTitle className="text-3xl">{stats.last24h}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Erreurs</CardDescription>
            <CardTitle className="text-3xl text-destructive">
              {stats.byLevel.error || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avertissements</CardDescription>
            <CardTitle className="text-3xl text-yellow-500">
              {stats.byLevel.warn || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Contrôles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Journal système</CardTitle>
              <CardDescription>
                Historique complet des événements de l'application
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="logging-enabled">Activer les logs</Label>
              <Switch
                id="logging-enabled"
                checked={enabled}
                onCheckedChange={toggleLogging}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Rechercher</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Message, source, détails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Niveau</Label>
              <Select value={levelFilter} onValueChange={(value) => setLevelFilter(value as LogLevel | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les niveaux</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warn">Avertissement</SelectItem>
                  <SelectItem value="error">Erreur</SelectItem>
                  <SelectItem value="success">Succès</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as LogCategory | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  <SelectItem value="system">Système</SelectItem>
                  <SelectItem value="auth">Authentification</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="database">Base de données</SelectItem>
                  <SelectItem value="ui">Interface</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="security">Sécurité</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Actions</Label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportLogs(levelFilter === 'all' ? undefined : levelFilter, categoryFilter === 'all' ? undefined : categoryFilter)}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearLogs}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Effacer
                </Button>
              </div>
            </div>
          </div>

          {/* Résultats */}
          <div className="text-sm text-muted-foreground">
            {filteredLogs.length} log(s) affiché(s) sur {stats.total}
          </div>

          {/* Liste des logs */}
          <ScrollArea className="h-[600px] rounded-md border">
            <div className="p-4 space-y-2">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun log à afficher</p>
                </div>
              ) : (
                filteredLogs.map((log) => {
                  const LevelIcon = levelIcons[log.level];
                  const CategoryIcon = categoryIcons[log.category];

                  return (
                    <Card key={log.id} className="border-l-4" style={{
                      borderLeftColor: log.level === 'error' ? 'hsl(var(--destructive))' :
                                      log.level === 'warn' ? 'hsl(var(--warning) / 0.8)' :
                                      log.level === 'success' ? 'hsl(var(--success) / 0.8)' :
                                      log.level === 'info' ? 'hsl(var(--primary))' :
                                      'hsl(var(--muted))'
                    }}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-muted">
                            <LevelIcon className="h-4 w-4" />
                          </div>
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className={levelColors[log.level]}>
                                {log.level}
                              </Badge>
                              <Badge variant="outline" className="gap-1">
                                <CategoryIcon className="h-3 w-3" />
                                {log.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(log.timestamp), "d MMM yyyy 'à' HH:mm:ss", { locale: fr })}
                              </span>
                              {log.source && (
                                <Badge variant="secondary" className="text-xs">
                                  {log.source}
                                </Badge>
                              )}
                            </div>

                            <p className="text-sm font-medium">{log.message}</p>

                            {log.details && (
                              <details className="text-xs">
                                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                  Détails techniques
                                </summary>
                                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </details>
                            )}

                            {log.stackTrace && (
                              <details className="text-xs">
                                <summary className="cursor-pointer text-destructive hover:opacity-80">
                                  Stack trace
                                </summary>
                                <pre className="mt-2 p-2 bg-destructive/5 border border-destructive/20 rounded text-xs overflow-auto">
                                  {log.stackTrace}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuditLog, AuditAction } from '@/hooks/useAuditLog';
import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  FileText, 
  Edit, 
  Trash2, 
  LogIn, 
  LogOut, 
  Download, 
  Printer, 
  FileSignature,
  Search,
  Filter
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const actionIcons = {
  CREATE: FileText,
  UPDATE: Edit,
  DELETE: Trash2,
  LOGIN: LogIn,
  LOGOUT: LogOut,
  EXPORT: Download,
  PRINT: Printer,
  SIGN: FileSignature
};

const actionColors = {
  CREATE: 'bg-green-500',
  UPDATE: 'bg-blue-500',
  DELETE: 'bg-red-500',
  LOGIN: 'bg-purple-500',
  LOGOUT: 'bg-gray-500',
  EXPORT: 'bg-orange-500',
  PRINT: 'bg-yellow-500',
  SIGN: 'bg-indigo-500'
};

export function AuditTrail() {
  const { logs, loading, fetchLogs } = useAuditLog();
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    action: '',
    tableName: '',
    search: ''
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    fetchLogs({
      action: (newFilters.action && newFilters.action !== 'all') ? newFilters.action as AuditAction : undefined,
      tableName: newFilters.tableName || undefined
    });
  };

  const filteredLogs = logs.filter(log => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        log.user_email?.toLowerCase().includes(searchLower) ||
        log.table_name.toLowerCase().includes(searchLower) ||
        log.description?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des modifications</CardTitle>
        <CardDescription>
          Traçabilité complète de toutes les actions effectuées dans le système
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Rechercher</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Email, table, description..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Type d'action</Label>
            <Select 
              value={filters.action} 
              onValueChange={(value) => handleFilterChange('action', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes les actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="CREATE">Création</SelectItem>
                <SelectItem value="UPDATE">Modification</SelectItem>
                <SelectItem value="DELETE">Suppression</SelectItem>
                <SelectItem value="LOGIN">Connexion</SelectItem>
                <SelectItem value="LOGOUT">Déconnexion</SelectItem>
                <SelectItem value="EXPORT">Export</SelectItem>
                <SelectItem value="PRINT">Impression</SelectItem>
                <SelectItem value="SIGN">Signature</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Table</Label>
            <Input
              placeholder="Nom de la table"
              value={filters.tableName}
              onChange={(e) => handleFilterChange('tableName', e.target.value)}
            />
          </div>
        </div>

        {/* Liste des logs */}
        <ScrollArea className="h-[600px] rounded-md border p-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun historique trouvé
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => {
                const Icon = actionIcons[log.action];
                const colorClass = actionColors[log.action];
                
                return (
                  <div
                    key={log.id}
                    className="flex gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className={`flex-shrink-0 ${colorClass} text-white p-2 rounded-lg`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{log.action}</Badge>
                            <span className="text-sm font-medium">{log.table_name}</span>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {log.description || `Action ${log.action} sur ${log.table_name}`}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span>👤 {log.user_email || 'Système'}</span>
                            <span>•</span>
                            <span>
                              📅 {format(new Date(log.created_at), 'PPp', { locale: fr })}
                            </span>
                            {log.record_id && (
                              <>
                                <span>•</span>
                                <span>ID: {log.record_id}</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {(log.old_values || log.new_values) && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-primary">
                              Détails
                            </summary>
                            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-w-md">
                              {JSON.stringify({ old: log.old_values, new: log.new_values }, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

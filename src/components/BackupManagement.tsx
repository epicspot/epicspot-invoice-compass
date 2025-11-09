import React, { useState } from 'react';
import { useBackups } from '@/hooks/useBackups';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Download, 
  Trash2, 
  RefreshCw, 
  Clock, 
  HardDrive,
  Archive,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

export const BackupManagement: React.FC = () => {
  const { 
    backups, 
    loading, 
    createBackup, 
    deleteBackup, 
    downloadBackup,
    refreshBackups 
  } = useBackups();
  const [creating, setCreating] = useState(false);

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      await createBackup('manual');
    } finally {
      setCreating(false);
    }
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(2)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Gestion des Sauvegardes
              </CardTitle>
              <CardDescription>
                Créez et gérez les sauvegardes de votre base de données
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshBackups}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              <Button
                onClick={handleCreateBackup}
                disabled={creating}
              >
                {creating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Archive className="h-4 w-4 mr-2" />
                    Nouvelle Sauvegarde
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 mb-6 md:grid-cols-3">
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Sauvegardes</p>
                    <p className="text-2xl font-bold">{backups.length}</p>
                  </div>
                  <Database className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Automatiques</p>
                    <p className="text-2xl font-bold">
                      {backups.filter(b => b.backup_type === 'auto').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Manuelles</p>
                    <p className="text-2xl font-bold">
                      {backups.filter(b => b.backup_type === 'manual').length}
                    </p>
                  </div>
                  <Archive className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Aucune sauvegarde disponible</p>
              <p className="text-sm">Créez votre première sauvegarde pour commencer</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Tables</TableHead>
                    <TableHead>Taille</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell>
                        <Badge variant={backup.backup_type === 'auto' ? 'secondary' : 'default'}>
                          {backup.backup_type === 'auto' ? (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              Auto
                            </>
                          ) : (
                            <>
                              <Archive className="h-3 w-3 mr-1" />
                              Manuel
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(backup.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {backup.description || 'Aucune description'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {backup.tables_count || 0} tables
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <HardDrive className="h-4 w-4 text-muted-foreground" />
                          {formatSize(backup.size_bytes)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadBackup(backup)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer cette sauvegarde ? Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteBackup(backup.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration de la Planification</CardTitle>
          <CardDescription>
            Les sauvegardes automatiques sont planifiées quotidiennement à minuit (UTC)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Sauvegarde Quotidienne</p>
                  <p className="text-sm text-muted-foreground">Tous les jours à 00:00 UTC</p>
                </div>
              </div>
              <Badge variant="secondary">Actif</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Archive className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Rétention des Sauvegardes</p>
                  <p className="text-sm text-muted-foreground">Conservation pendant 30 jours</p>
                </div>
              </div>
              <Badge variant="outline">30 jours</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <HardDrive className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Stockage Cloud</p>
                  <p className="text-sm text-muted-foreground">Sauvegardes chiffrées dans le cloud</p>
                </div>
              </div>
              <Badge variant="secondary">Sécurisé</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

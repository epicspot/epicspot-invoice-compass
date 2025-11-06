import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuditTrail } from '@/components/AuditTrail';
import { RoleManagement } from '@/components/RoleManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, History, Users, Download, Database } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoles } from '@/hooks/useRoles';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState } from 'react';

export default function SecurityAudit() {
  const { user } = useAuth();
  const { isAdmin } = useRoles();
  const [loading, setLoading] = useState(false);

  const handleBackup = async () => {
    if (!isAdmin) {
      toast.error('Seuls les administrateurs peuvent créer des backups');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-backup', {
        body: { backup_type: 'manual' }
      });

      if (error) throw error;
      
      toast.success('Backup créé avec succès');
    } catch (error) {
      console.error('Backup error:', error);
      toast.error('Erreur lors de la création du backup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Sécurité & Audit
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestion des permissions, historique et sauvegardes
          </p>
        </div>

        {isAdmin && (
          <Button onClick={handleBackup} disabled={loading} className="gap-2">
            <Database className="h-4 w-4" />
            {loading ? 'Création backup...' : 'Créer un backup'}
          </Button>
        )}
      </div>

      <Tabs defaultValue="audit" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="audit" className="gap-2">
            <History className="h-4 w-4" />
            Historique
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2" disabled={!isAdmin}>
            <Users className="h-4 w-4" />
            Rôles & Permissions
          </TabsTrigger>
          <TabsTrigger value="backups" className="gap-2" disabled={!isAdmin}>
            <Download className="h-4 w-4" />
            Sauvegardes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="mt-6">
          <AuditTrail />
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          {user && (
            <RoleManagement userId={user.id} userEmail={user.email} />
          )}
        </TabsContent>

        <TabsContent value="backups" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des sauvegardes</CardTitle>
              <CardDescription>
                Sauvegardes automatiques et manuelles de vos données
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Backup automatique</CardTitle>
                    <CardDescription>Sauvegarde quotidienne à 2h du matin</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-green-500">✓ Activé</div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Dernière sauvegarde: Aujourd'hui à 02:00
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Rétention</CardTitle>
                    <CardDescription>Durée de conservation des backups</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <div className="text-2xl font-bold">30 jours</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Les backups sont conservés pendant 30 jours
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">📋 Informations</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Les backups incluent toutes les données de l'application</li>
                  <li>• Les sauvegardes sont chiffrées et stockées en sécurité</li>
                  <li>• Restauration possible en moins de 24h sur demande</li>
                  <li>• Les backups manuels ne sont pas comptés dans la rétention</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

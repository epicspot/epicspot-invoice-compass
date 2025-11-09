import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuditTrail } from '@/components/AuditTrail';
import { RoleManagement } from '@/components/RoleManagement';
import { BackupManagement } from '@/components/BackupManagement';
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
          <BackupManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}

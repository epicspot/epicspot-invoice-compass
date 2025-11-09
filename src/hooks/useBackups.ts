import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type BackupRow = Database['public']['Tables']['system_backups']['Row'];

export interface Backup {
  id: string;
  backup_type: 'auto' | 'manual';
  backup_data: any;
  created_by: string;
  created_at: string;
  description: string | null;
  size_bytes: number | null;
  tables_count: number | null;
}

export const useBackups = () => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_backups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBackups((data || []) as Backup[]);
      console.log('[Backups] Backups récupérées avec succès');
    } catch (error: any) {
      console.error('Error fetching backups:', error);
      console.log('[Backups] Erreur lors de la récupération des backups', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les sauvegardes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async (type: 'auto' | 'manual' = 'manual') => {
    try {
      console.log(`[Backups] Création d'une sauvegarde ${type}...`);
      
      const { data, error } = await supabase.functions.invoke('create-backup', {
        body: { backup_type: type }
      });

      if (error) throw error;

      toast({
        title: 'Succès',
        description: `Sauvegarde ${type === 'auto' ? 'automatique' : 'manuelle'} créée avec succès`,
      });

      console.log(`[Backups] Sauvegarde ${type} créée`, data);
      await fetchBackups();
      
      return data;
    } catch (error: any) {
      console.error('Error creating backup:', error);
      console.log('[Backups] Erreur lors de la création de la sauvegarde', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer la sauvegarde',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteBackup = async (id: string) => {
    try {
      console.log(`[Backups] Suppression de la sauvegarde ${id}...`);
      
      const { error } = await supabase
        .from('system_backups')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Sauvegarde supprimée avec succès',
      });

      console.log('[Backups] Sauvegarde supprimée', { id });
      await fetchBackups();
    } catch (error: any) {
      console.error('Error deleting backup:', error);
      console.log('[Backups] Erreur lors de la suppression de la sauvegarde', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer la sauvegarde',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const restoreBackup = async (backup: Backup) => {
    try {
      console.log(`[Backups] Restauration de la sauvegarde ${backup.id}...`);
      
      // This would require a restore edge function
      // For now, we'll just show a warning
      toast({
        title: 'Attention',
        description: 'La restauration complète des données nécessite une intervention manuelle pour éviter les pertes de données. Veuillez contacter l\'administrateur système.',
        variant: 'destructive',
      });

      console.log('[Backups] Tentative de restauration manuelle', { backup_id: backup.id });
    } catch (error: any) {
      console.error('Error restoring backup:', error);
      console.log('[Backups] Erreur lors de la restauration', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de restaurer la sauvegarde',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const downloadBackup = (backup: Backup) => {
    try {
      const dataStr = JSON.stringify(backup.backup_data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-${backup.id}-${new Date(backup.created_at).toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('[Backups] Sauvegarde téléchargée', { backup_id: backup.id });
      toast({
        title: 'Succès',
        description: 'Sauvegarde téléchargée avec succès',
      });
    } catch (error: any) {
      console.error('Error downloading backup:', error);
      console.log('[Backups] Erreur lors du téléchargement', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de télécharger la sauvegarde',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  return {
    backups,
    loading,
    createBackup,
    deleteBackup,
    restoreBackup,
    downloadBackup,
    refreshBackups: fetchBackups,
  };
};

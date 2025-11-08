import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DocumentTemplate, TemplateLayout, TemplateSection, TemplateStyles } from './useDocumentTemplates';
import { toast } from 'sonner';

export interface TemplateVersion {
  id: string;
  template_id: string;
  version_number: number;
  name: string;
  sections: TemplateSection[];
  layout: TemplateLayout;
  styles: TemplateStyles;
  logo_url?: string;
  change_summary?: string;
  created_by?: string;
  created_at: string;
  tags?: string[];
}

export interface ComparisonResult {
  version1: TemplateVersion;
  version2: TemplateVersion;
  differences: {
    name: boolean;
    sections: boolean;
    layout: boolean;
    styles: boolean;
    logo_url: boolean;
  };
  hasChanges: boolean;
}

export function useTemplateVersions(templateId?: string) {
  const [versions, setVersions] = useState<TemplateVersion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVersions = async () => {
    if (!templateId) {
      setVersions([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('template_versions')
        .select('*')
        .eq('template_id', templateId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      setVersions((data || []) as any);
    } catch (error) {
      console.error('Error fetching versions:', error);
      toast.error('Erreur lors du chargement des versions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();

    if (!templateId) return;

    // Subscribe to realtime updates
    const channel = supabase
      .channel('template-versions-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'template_versions',
          filter: `template_id=eq.${templateId}`
        },
        () => {
          fetchVersions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [templateId]);

  const createManualVersion = async (
    templateId: string,
    currentData: Partial<DocumentTemplate>,
    changeSummary: string
  ) => {
    try {
      const { data: user } = await supabase.auth.getUser();

      // Get next version number
      const { data: maxVersion } = await supabase
        .from('template_versions')
        .select('version_number')
        .eq('template_id', templateId)
        .order('version_number', { ascending: false })
        .limit(1)
        .single();

      const nextVersion = (maxVersion?.version_number || 0) + 1;

      const { error } = await supabase
        .from('template_versions')
        .insert({
          template_id: templateId,
          version_number: nextVersion,
          name: currentData.name || '',
          sections: currentData.sections as any || [],
          layout: currentData.layout as any || {},
          styles: currentData.styles as any || {},
          logo_url: currentData.logo_url,
          change_summary: changeSummary,
          created_by: user.user?.id
        });

      if (error) throw error;

      toast.success('Version sauvegardée');
      await fetchVersions();
      return { success: true };
    } catch (error) {
      console.error('Error creating version:', error);
      toast.error('Erreur lors de la sauvegarde de la version');
      return { success: false, error };
    }
  };

  const restoreVersion = async (version: TemplateVersion, templateId: string) => {
    try {
      const { error } = await supabase
        .from('document_templates')
        .update({
          name: version.name,
          sections: version.sections as any,
          layout: version.layout as any,
          styles: version.styles as any,
          logo_url: version.logo_url
        })
        .eq('id', templateId);

      if (error) throw error;

      toast.success('Version restaurée avec succès');
      return { success: true };
    } catch (error) {
      console.error('Error restoring version:', error);
      toast.error('Erreur lors de la restauration');
      return { success: false, error };
    }
  };

  const compareVersions = (version1Id: string, version2Id: string): ComparisonResult | null => {
    const v1 = versions.find(v => v.id === version1Id);
    const v2 = versions.find(v => v.id === version2Id);

    if (!v1 || !v2) return null;

    const differences = {
      name: v1.name !== v2.name,
      sections: JSON.stringify(v1.sections) !== JSON.stringify(v2.sections),
      layout: JSON.stringify(v1.layout) !== JSON.stringify(v2.layout),
      styles: JSON.stringify(v1.styles) !== JSON.stringify(v2.styles),
      logo_url: v1.logo_url !== v2.logo_url
    };

    return {
      version1: v1,
      version2: v2,
      differences,
      hasChanges: Object.values(differences).some(d => d)
    };
  };

  const addTagToVersion = async (versionId: string, tag: string) => {
    try {
      const version = versions.find(v => v.id === versionId);
      if (!version) throw new Error('Version non trouvée');

      const tags = version.tags || [];
      if (tags.includes(tag)) {
        toast.error('Ce tag existe déjà');
        return { success: false };
      }

      const { error } = await supabase
        .from('template_versions')
        .update({ tags: [...tags, tag] })
        .eq('id', versionId);

      if (error) throw error;

      toast.success('Tag ajouté');
      await fetchVersions();
      return { success: true };
    } catch (error) {
      console.error('Error adding tag:', error);
      toast.error('Erreur lors de l\'ajout du tag');
      return { success: false, error };
    }
  };

  const removeTagFromVersion = async (versionId: string, tag: string) => {
    try {
      const version = versions.find(v => v.id === versionId);
      if (!version) throw new Error('Version non trouvée');

      const tags = (version.tags || []).filter(t => t !== tag);

      const { error } = await supabase
        .from('template_versions')
        .update({ tags })
        .eq('id', versionId);

      if (error) throw error;

      toast.success('Tag retiré');
      await fetchVersions();
      return { success: true };
    } catch (error) {
      console.error('Error removing tag:', error);
      toast.error('Erreur lors du retrait du tag');
      return { success: false, error };
    }
  };

  return {
    versions,
    loading,
    createManualVersion,
    restoreVersion,
    compareVersions,
    addTagToVersion,
    removeTagFromVersion,
    refetch: fetchVersions
  };
}

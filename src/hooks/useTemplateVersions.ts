import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TemplateSection, TemplateLayout, TemplateStyles } from './useDocumentTemplates';

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
          event: '*',
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
    templateData: {
      name: string;
      sections: TemplateSection[];
      layout: TemplateLayout;
      styles: TemplateStyles;
      logo_url?: string;
    },
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

      const versionNumber = (maxVersion?.version_number || 0) + 1;

      const { data, error } = await supabase
        .from('template_versions')
        .insert({
          template_id: templateId,
          version_number: versionNumber,
          name: templateData.name,
          sections: templateData.sections as any,
          layout: templateData.layout as any,
          styles: templateData.styles as any,
          logo_url: templateData.logo_url,
          change_summary: changeSummary,
          created_by: user.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Version sauvegardée');
      await fetchVersions();
      return { success: true, data };
    } catch (error) {
      console.error('Error creating version:', error);
      toast.error('Erreur lors de la création de la version');
      return { success: false, error };
    }
  };

  const restoreVersion = async (versionId: string, templateId: string) => {
    try {
      // Get the version data
      const { data: version, error: fetchError } = await supabase
        .from('template_versions')
        .select('*')
        .eq('id', versionId)
        .single();

      if (fetchError) throw fetchError;

      // Update the template with the version data
      const { error: updateError } = await supabase
        .from('document_templates')
        .update({
          name: version.name,
          sections: version.sections,
          layout: version.layout,
          styles: version.styles,
          logo_url: version.logo_url
        })
        .eq('id', templateId);

      if (updateError) throw updateError;

      toast.success('Version restaurée avec succès');
      return { success: true };
    } catch (error) {
      console.error('Error restoring version:', error);
      toast.error('Erreur lors de la restauration');
      return { success: false, error };
    }
  };

  const compareVersions = (version1: TemplateVersion, version2: TemplateVersion) => {
    const changes: string[] = [];

    if (version1.name !== version2.name) {
      changes.push(`Nom modifié: "${version1.name}" → "${version2.name}"`);
    }

    const sections1Enabled = version1.sections.filter(s => s.enabled).length;
    const sections2Enabled = version2.sections.filter(s => s.enabled).length;
    if (sections1Enabled !== sections2Enabled) {
      changes.push(`Sections actives: ${sections1Enabled} → ${sections2Enabled}`);
    }

    if (JSON.stringify(version1.layout) !== JSON.stringify(version2.layout)) {
      changes.push('Mise en page modifiée');
    }

    if (JSON.stringify(version1.styles) !== JSON.stringify(version2.styles)) {
      changes.push('Styles modifiés');
    }

    if (version1.logo_url !== version2.logo_url) {
      changes.push('Logo modifié');
    }

    return changes;
  };

  return {
    versions,
    loading,
    createManualVersion,
    restoreVersion,
    compareVersions,
    refetch: fetchVersions
  };
}

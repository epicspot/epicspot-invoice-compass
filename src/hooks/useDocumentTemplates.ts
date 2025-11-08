import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TemplateSection {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

export interface TemplateLayout {
  pageSize: 'A4' | 'Letter';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  orientation: 'portrait' | 'landscape';
}

export interface TemplateStyles {
  primaryColor: string;
  secondaryColor: string;
  titleFontSize: number;
  headingFontSize: number;
  bodyFontSize: number;
  fontFamily: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: 'contract' | 'amendment' | 'reception' | 'invoice' | 'quote';
  sections: TemplateSection[];
  layout: TemplateLayout;
  styles: TemplateStyles;
  logo_url?: string;
  is_default: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export function useDocumentTemplates(type?: string) {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    try {
      let query = supabase.from('document_templates').select('*').order('created_at', { ascending: false });
      
      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTemplates((data || []) as any);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Erreur lors du chargement des templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [type]);

  const createTemplate = async (template: Omit<DocumentTemplate, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      const { data: user } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('document_templates')
        .insert({
          name: template.name,
          type: template.type,
          sections: template.sections as any,
          layout: template.layout as any,
          styles: template.styles as any,
          logo_url: template.logo_url,
          is_default: template.is_default,
          created_by: user.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Template créé avec succès');
      await fetchTemplates();
      return { success: true, data };
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Erreur lors de la création du template');
      return { success: false, error };
    }
  };

  const updateTemplate = async (id: string, updates: Partial<DocumentTemplate>) => {
    try {
      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.sections !== undefined) updateData.sections = updates.sections;
      if (updates.layout !== undefined) updateData.layout = updates.layout;
      if (updates.styles !== undefined) updateData.styles = updates.styles;
      if (updates.logo_url !== undefined) updateData.logo_url = updates.logo_url;
      if (updates.is_default !== undefined) updateData.is_default = updates.is_default;

      const { error } = await supabase
        .from('document_templates')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast.success('Template mis à jour');
      await fetchTemplates();
      return { success: true };
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Erreur lors de la mise à jour');
      return { success: false, error };
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('document_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Template supprimé');
      await fetchTemplates();
      return { success: true };
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Erreur lors de la suppression');
      return { success: false, error };
    }
  };

  const getDefaultTemplate = (templateType: string) => {
    return templates.find(t => t.type === templateType && t.is_default);
  };

  const exportTemplate = (template: DocumentTemplate) => {
    const dataStr = JSON.stringify(template, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `template-${template.name}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Template exporté');
  };

  const importTemplate = async (file: File) => {
    try {
      const text = await file.text();
      const templateData = JSON.parse(text);
      
      // Remove id and timestamps to create a new template
      const { id, created_at, updated_at, created_by, ...newTemplateData } = templateData;
      
      const result = await createTemplate({
        ...newTemplateData,
        name: `${newTemplateData.name} (importé)`,
        is_default: false
      });

      if (result.success) {
        toast.success('Template importé avec succès');
      }
      return result;
    } catch (error) {
      console.error('Error importing template:', error);
      toast.error('Erreur lors de l\'import du template');
      return { success: false, error };
    }
  };

  return {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getDefaultTemplate,
    exportTemplate,
    importTemplate,
    refetch: fetchTemplates
  };
}

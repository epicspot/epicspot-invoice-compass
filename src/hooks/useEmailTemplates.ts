import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface EmailTemplate {
  id: string;
  name: string;
  type: 'invoice_reminder' | 'quote_reminder' | 'payment_confirmation';
  subject: string;
  body_html: string;
  is_default: boolean;
  variables: string[];
  created_at: string;
  updated_at: string;
}

export interface TemplateVariables {
  client_name?: string;
  invoice_number?: string;
  amount?: string;
  due_date?: string;
  email_title?: string;
  email_message?: string;
  signature?: string;
  footer_text?: string;
  [key: string]: string | undefined;
}

export function useEmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTemplates((data || []).map(t => ({
        ...t,
        variables: Array.isArray(t.variables) ? t.variables as string[] : [],
      })) as EmailTemplate[]);
    } catch (error) {
      console.error('Error fetching email templates:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les templates d'email",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const getTemplate = async (type: string, isDefault = true): Promise<EmailTemplate | null> => {
    try {
      const query = supabase
        .from('email_templates')
        .select('*')
        .eq('type', type);

      if (isDefault) {
        query.eq('is_default', true);
      }

      const { data, error } = await query.single();

      if (error) throw error;
      
      return data ? {
        ...data,
        variables: Array.isArray(data.variables) ? data.variables as string[] : [],
      } as EmailTemplate : null;
    } catch (error) {
      console.error('Error fetching template:', error);
      return null;
    }
  };

  const createTemplate = async (template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .insert([template])
        .select()
        .single();

      if (error) throw error;

      await fetchTemplates();
      
      toast({
        title: "Template créé",
        description: "Le template d'email a été créé avec succès"
      });

      return data;
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le template",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<EmailTemplate>) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchTemplates();
      
      toast({
        title: "Template mis à jour",
        description: "Le template d'email a été mis à jour avec succès"
      });
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le template",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchTemplates();
      
      toast({
        title: "Template supprimé",
        description: "Le template d'email a été supprimé avec succès"
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le template",
        variant: "destructive"
      });
      throw error;
    }
  };

  const renderTemplate = (template: EmailTemplate, variables: TemplateVariables): { subject: string; body: string } => {
    let subject = template.subject;
    let body = template.body_html;

    // Remplacer toutes les variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, value || '');
      body = body.replace(regex, value || '');
    });

    return { subject, body };
  };

  return {
    templates,
    loading,
    fetchTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    renderTemplate,
  };
}

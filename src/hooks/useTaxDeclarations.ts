import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TaxDeclaration {
  id: string;
  period_start: string;
  period_end: string;
  total_sales: number;
  total_purchases: number;
  vat_collected: number;
  vat_paid: number;
  vat_due: number;
  status: 'draft' | 'submitted' | 'validated';
  details?: any;
  created_by?: string;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
}

export function useTaxDeclarations() {
  const [declarations, setDeclarations] = useState<TaxDeclaration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeclarations = async () => {
    try {
      const { data, error } = await supabase
        .from('tax_declarations')
        .select('*')
        .order('period_start', { ascending: false });

      if (error) throw error;
      setDeclarations((data || []) as TaxDeclaration[]);
    } catch (error) {
      console.error('Error fetching tax declarations:', error);
      toast.error('Erreur lors du chargement des déclarations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeclarations();
  }, []);

  const generateDeclaration = async (periodStart: string, periodEnd: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-tax-declaration', {
        body: { periodStart, periodEnd }
      });

      if (error) throw error;
      
      toast.success('Déclaration de TVA générée avec succès');
      await fetchDeclarations();
      return { success: true, data };
    } catch (error) {
      console.error('Error generating tax declaration:', error);
      toast.error('Erreur lors de la génération de la déclaration');
      return { success: false, error };
    }
  };

  const updateDeclaration = async (id: string, updates: Partial<TaxDeclaration>) => {
    try {
      const { error } = await supabase
        .from('tax_declarations')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Déclaration mise à jour');
      await fetchDeclarations();
      return { success: true };
    } catch (error) {
      console.error('Error updating tax declaration:', error);
      toast.error('Erreur lors de la mise à jour');
      return { success: false, error };
    }
  };

  const deleteDeclaration = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tax_declarations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Déclaration supprimée');
      await fetchDeclarations();
      return { success: true };
    } catch (error) {
      console.error('Error deleting tax declaration:', error);
      toast.error('Erreur lors de la suppression');
      return { success: false, error };
    }
  };

  return {
    declarations,
    loading,
    generateDeclaration,
    updateDeclaration,
    deleteDeclaration,
    refetch: fetchDeclarations
  };
}
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Market {
  id: string;
  reference: string;
  title: string;
  description?: string;
  client_id?: string;
  type: 'public' | 'private' | 'framework';
  status: 'draft' | 'submitted' | 'awarded' | 'in_progress' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  estimated_amount: number;
  actual_amount: number;
  deposit_percentage?: number;
  deposit_amount?: number;
  payment_terms?: string;
  delivery_terms?: string;
  specifications?: any;
  documents?: any;
  site_id?: string;
  responsible_user_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  clients?: {
    name: string;
    code?: string;
  };
}

export interface MarketMilestone {
  id: string;
  market_id: string;
  title: string;
  description?: string;
  due_date?: string;
  completion_date?: string;
  amount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  percentage?: number;
  invoice_id?: string;
  created_at: string;
  updated_at: string;
}

export function useMarkets() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMarkets = async () => {
    try {
      const { data, error } = await supabase
        .from('markets')
        .select(`
          *,
          clients (
            name,
            code
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMarkets((data || []) as Market[]);
    } catch (error) {
      console.error('Error fetching markets:', error);
      toast.error('Erreur lors du chargement des marchés');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  const createMarket = async (market: Omit<Market, 'id' | 'reference' | 'created_at' | 'updated_at'>) => {
    try {
      // Generate reference
      const reference = `MKT-${Date.now().toString().slice(-6)}`;

      const { data: user } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('markets')
        .insert({
          ...market,
          reference,
          created_by: user.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Marché créé avec succès');
      await fetchMarkets();
      return { success: true, data };
    } catch (error) {
      console.error('Error creating market:', error);
      toast.error('Erreur lors de la création du marché');
      return { success: false, error };
    }
  };

  const updateMarket = async (id: string, updates: Partial<Market>) => {
    try {
      const { error } = await supabase
        .from('markets')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Marché mis à jour');
      await fetchMarkets();
      return { success: true };
    } catch (error) {
      console.error('Error updating market:', error);
      toast.error('Erreur lors de la mise à jour');
      return { success: false, error };
    }
  };

  const deleteMarket = async (id: string) => {
    try {
      const { error } = await supabase
        .from('markets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Marché supprimé');
      await fetchMarkets();
      return { success: true };
    } catch (error) {
      console.error('Error deleting market:', error);
      toast.error('Erreur lors de la suppression');
      return { success: false, error };
    }
  };

  return {
    markets,
    loading,
    createMarket,
    updateMarket,
    deleteMarket,
    refetch: fetchMarkets
  };
}

export function useMarketMilestones(marketId: string) {
  const [milestones, setMilestones] = useState<MarketMilestone[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMilestones = async () => {
    try {
      const { data, error } = await supabase
        .from('market_milestones')
        .select('*')
        .eq('market_id', marketId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setMilestones((data || []) as MarketMilestone[]);
    } catch (error) {
      console.error('Error fetching milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (marketId) {
      fetchMilestones();
    }
  }, [marketId]);

  const createMilestone = async (milestone: Omit<MarketMilestone, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('market_milestones')
        .insert(milestone);

      if (error) throw error;

      toast.success('Jalon créé');
      await fetchMilestones();
      return { success: true };
    } catch (error) {
      console.error('Error creating milestone:', error);
      toast.error('Erreur lors de la création');
      return { success: false, error };
    }
  };

  const updateMilestone = async (id: string, updates: Partial<MarketMilestone>) => {
    try {
      const { error } = await supabase
        .from('market_milestones')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Jalon mis à jour');
      await fetchMilestones();
      return { success: true };
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast.error('Erreur lors de la mise à jour');
      return { success: false, error };
    }
  };

  const deleteMilestone = async (id: string) => {
    try {
      const { error } = await supabase
        .from('market_milestones')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Jalon supprimé');
      await fetchMilestones();
      return { success: true };
    } catch (error) {
      console.error('Error deleting milestone:', error);
      toast.error('Erreur lors de la suppression');
      return { success: false, error };
    }
  };

  return {
    milestones,
    loading,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    refetch: fetchMilestones
  };
}
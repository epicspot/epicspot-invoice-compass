import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/lib/types';

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedLeads: Lead[] = (data || []).map((lead: any) => ({
        id: lead.id,
        name: lead.name,
        company: lead.company,
        phone: lead.phone,
        email: lead.email,
        source: lead.source,
        status: lead.status,
        estimatedValue: lead.value,
        notes: lead.notes,
        assignedTo: lead.assigned_to,
        createdAt: lead.created_at,
      }));

      setLeads(formattedLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads'
        },
        () => {
          fetchLeads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createLead = async (lead: Omit<Lead, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert({
          name: lead.name,
          company: lead.company,
          phone: lead.phone,
          email: lead.email,
          source: lead.source,
          status: lead.status,
          value: lead.estimatedValue,
          notes: lead.notes,
          assigned_to: lead.assignedTo,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchLeads();
      return data;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({
          name: updates.name,
          company: updates.company,
          phone: updates.phone,
          email: updates.email,
          source: updates.source,
          status: updates.status,
          value: updates.estimatedValue,
          notes: updates.notes,
          assigned_to: updates.assignedTo,
        })
        .eq('id', id);

      if (error) throw error;

      await fetchLeads();
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  };

  const deleteLead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchLeads();
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  };

  const getLead = (id: string) => {
    return leads.find(l => l.id === id);
  };

  const convertLeadToClient = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return null;
    
    return {
      name: lead.name,
      address: lead.address || '',
      phone: lead.phone,
      email: lead.email,
      code: `CLI${Date.now().toString().slice(-6)}`,
    };
  };

  return {
    leads,
    loading,
    createLead,
    updateLead,
    deleteLead,
    getLead,
    convertLeadToClient,
    refetch: fetchLeads,
  };
}

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/lib/types';
import { useErrorHandler } from './useErrorHandler';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { handleError } = useErrorHandler();

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedClients: Client[] = (data || []).map((client: any) => ({
        id: client.id,
        code: client.code,
        name: client.name,
        address: client.address,
        phone: client.phone,
        email: client.email,
        taxInfo: client.tax_info,
        taxCenter: client.tax_center,
        siteId: client.site_id,
      }));

      setClients(formattedClients);
    } catch (error) {
      handleError(error, {
        severity: 'warning',
        title: 'Erreur de chargement des clients',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('clients-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients'
        },
        () => {
          fetchClients();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createClient = async (client: Omit<Client, 'id' | 'code'>) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          name: client.name,
          address: client.address,
          phone: client.phone,
          email: client.email,
          tax_info: client.taxInfo,
          tax_center: client.taxCenter,
          site_id: client.siteId,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchClients();
      return data;
    } catch (error) {
      handleError(error, {
        severity: 'error',
        title: 'Erreur de création du client',
      });
      throw error;
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          name: updates.name,
          address: updates.address,
          phone: updates.phone,
          email: updates.email,
          tax_info: updates.taxInfo,
          tax_center: updates.taxCenter,
          site_id: updates.siteId,
        })
        .eq('id', id);

      if (error) throw error;

      await fetchClients();
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  };

  const getClient = (id: string) => {
    return clients.find(c => c.id === id);
  };

  return {
    clients,
    loading,
    createClient,
    updateClient,
    deleteClient,
    getClient,
    refetch: fetchClients,
  };
}

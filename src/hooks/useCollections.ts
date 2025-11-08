import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Collection } from '@/lib/types';
import { useErrorHandler } from './useErrorHandler';
import { useRetry } from './useRetry';

interface CollectionWithDetails extends Collection {
  invoiceNumber?: string;
  clientName?: string;
  collectorName?: string;
}

export function useCollections() {
  const [collections, setCollections] = useState<CollectionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { handleError } = useErrorHandler();
  const { executeWithRetry } = useRetry();

  const fetchCollections = async () => {
    try {
      const formattedCollections = await executeWithRetry(async () => {
        const { data, error } = await supabase
          .from('collections')
          .select(`
            *,
            invoices:invoice_id (
              number,
              clients:client_id (
                name
              )
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((c: any) => ({
          id: c.id,
          invoiceId: c.invoice_id,
          clientId: c.client_id,
          amount: c.amount,
          paymentMethod: c.payment_method,
          reference: c.reference,
          notes: c.notes,
          collectedBy: c.collected_by,
          createdAt: c.created_at,
          invoiceNumber: c.invoices?.number,
          clientName: c.invoices?.clients?.name,
          collectorName: undefined,
        }));
      }, {
        maxAttempts: 3,
        initialDelay: 1000,
      });

      setCollections(formattedCollections);
    } catch (error) {
      handleError(error, {
        severity: 'warning',
        title: 'Erreur de chargement',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const createCollection = async (collection: Omit<Collection, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .insert({
          invoice_id: collection.invoiceId,
          client_id: collection.clientId,
          amount: collection.amount,
          payment_method: collection.paymentMethod,
          reference: collection.reference,
          notes: collection.notes,
          collected_by: collection.collectedBy,
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      await fetchCollections();
      return data;
    } catch (error) {
      handleError(error, {
        severity: 'error',
        title: 'Erreur de création',
      });
      throw error;
    }
  };

  const updateCollection = async (id: string, updates: Partial<Collection>) => {
    try {
      const { error } = await supabase
        .from('collections')
        .update({
          invoice_id: updates.invoiceId,
          client_id: updates.clientId,
          amount: updates.amount,
          payment_method: updates.paymentMethod,
          reference: updates.reference,
          notes: updates.notes,
        })
        .eq('id', id);

      if (error) throw error;
      await fetchCollections();
    } catch (error) {
      handleError(error, {
        severity: 'error',
        title: 'Erreur de mise à jour',
      });
      throw error;
    }
  };

  const deleteCollection = async (id: string) => {
    try {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchCollections();
    } catch (error) {
      handleError(error, {
        severity: 'error',
        title: 'Erreur de suppression',
      });
      throw error;
    }
  };

  return {
    collections,
    loading,
    createCollection,
    updateCollection,
    deleteCollection,
    refetch: fetchCollections,
  };
}

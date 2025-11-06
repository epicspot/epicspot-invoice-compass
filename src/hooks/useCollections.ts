import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Collection } from '@/lib/types';

interface CollectionWithDetails extends Collection {
  invoiceNumber?: string;
  clientName?: string;
  collectorName?: string;
}

export function useCollections() {
  const [collections, setCollections] = useState<CollectionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select(`
          *,
          invoices:invoice_id (
            number,
            clients:client_id (
              name
            )
          ),
          profiles:collected_by (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedCollections: CollectionWithDetails[] = (data || []).map((c: any) => ({
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
        collectorName: c.profiles?.name,
      }));
      setCollections(formattedCollections);
    } catch (error) {
      console.error('Error fetching collections:', error);
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
      console.error('Error creating collection:', error);
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
      console.error('Error updating collection:', error);
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
      console.error('Error deleting collection:', error);
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

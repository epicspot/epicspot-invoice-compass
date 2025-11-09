import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Quote } from '@/lib/types';

export function useQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*, clients(*), quote_items(*, products(*))')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedQuotes: Quote[] = (data || []).map(q => ({
        id: q.id,
        number: q.number,
        date: q.date,
        client: q.clients,
        items: (q.quote_items || []).map((item: any) => ({
          id: item.id,
          product: item.products,
          quantity: item.quantity,
          amount: item.amount,
        })),
        subtotal: q.subtotal,
        total: q.total,
        status: q.status as 'draft' | 'sent' | 'accepted' | 'rejected',
        siteId: q.site_id,
      }));

      setQuotes(mappedQuotes);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('quotes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quotes'
        },
        () => {
          fetchQuotes();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quote_items'
        },
        () => {
          fetchQuotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createQuote = async (quote: Omit<Quote, 'id' | 'number'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const quoteNumber = `QUO-${Date.now()}`;
      
      const clientId = quote.client?.id;
      
      const { data: quoteData, error: quoteError } = await supabase
        .from('quotes')
        .insert([{
          number: quoteNumber,
          client_id: clientId,
          date: quote.date,
          subtotal: quote.subtotal,
          tax: 0,
          discount: quote.discount || 0,
          total: quote.total,
          status: quote.status,
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          created_by: user?.id,
        }])
        .select()
        .single();

      if (quoteError) throw quoteError;

      const itemsToInsert = quote.items
        .filter(item => item.product && item.product.id)
        .map(item => ({
          quote_id: quoteData.id,
          product_id: item.product.id,
          quantity: item.quantity,
          amount: item.amount,
        }));

      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      await fetchQuotes();
      return quoteData;
    } catch (error) {
      console.error('Error creating quote:', error);
      throw error;
    }
  };

  const updateQuote = async (id: string, updates: Partial<Quote>) => {
    try {
      const { error } = await supabase
        .from('quotes')
        .update({
          client_id: updates.client?.id,
          date: updates.date,
          subtotal: updates.total,
          total: updates.total,
          status: updates.status,
        })
        .eq('id', id);

      if (error) throw error;
      await fetchQuotes();
    } catch (error) {
      console.error('Error updating quote:', error);
      throw error;
    }
  };

  const deleteQuote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchQuotes();
    } catch (error) {
      console.error('Error deleting quote:', error);
      throw error;
    }
  };

  const getQuote = (id: string) => {
    return quotes.find(q => q.id === id);
  };

  return {
    quotes,
    loading,
    createQuote,
    updateQuote,
    deleteQuote,
    getQuote,
    refetch: fetchQuotes,
  };
}

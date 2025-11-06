import { useState, useEffect } from 'react';
import { Quote } from '@/lib/types';

const API_URL = 'http://localhost:3001/api';

export function useQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotes = async () => {
    try {
      const response = await fetch(`${API_URL}/quotes`);
      const data = await response.json();
      setQuotes(data);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const createQuote = async (quote: Omit<Quote, 'id' | 'number'>) => {
    try {
      const response = await fetch(`${API_URL}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: quote.client.id,
          date: quote.date,
          items: quote.items,
          total: quote.total,
          tax: 0,
          status: quote.status,
        }),
      });
      const newQuote = await response.json();
      await fetchQuotes();
      return newQuote;
    } catch (error) {
      console.error('Error creating quote:', error);
      throw error;
    }
  };

  const updateQuote = async (id: string, updates: Partial<Quote>) => {
    try {
      await fetch(`${API_URL}/quotes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: updates.client?.id,
          date: updates.date,
          items: updates.items,
          total: updates.total,
          tax: 0,
          status: updates.status,
        }),
      });
      await fetchQuotes();
    } catch (error) {
      console.error('Error updating quote:', error);
      throw error;
    }
  };

  const deleteQuote = async (id: string) => {
    try {
      await fetch(`${API_URL}/quotes/${id}`, {
        method: 'DELETE',
      });
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

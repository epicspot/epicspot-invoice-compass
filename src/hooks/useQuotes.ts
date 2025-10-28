import { useLocalStorage } from './useLocalStorage';
import { Quote } from '@/lib/types';

export function useQuotes() {
  const [quotes, setQuotes] = useLocalStorage<Quote[]>('quotes', []);

  const createQuote = (quote: Omit<Quote, 'id'>) => {
    const newQuote: Quote = {
      ...quote,
      id: `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setQuotes([...quotes, newQuote]);
    return newQuote;
  };

  const updateQuote = (id: string, updates: Partial<Quote>) => {
    setQuotes(quotes.map(q => 
      q.id === id ? { ...q, ...updates } : q
    ));
  };

  const deleteQuote = (id: string) => {
    setQuotes(quotes.filter(q => q.id !== id));
  };

  const getQuote = (id: string) => {
    return quotes.find(q => q.id === id);
  };

  return {
    quotes,
    createQuote,
    updateQuote,
    deleteQuote,
    getQuote,
  };
}

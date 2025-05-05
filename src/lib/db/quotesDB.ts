
import { dbPromise } from './index';
import { Quote } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const quotesDB = {
  getAll: async (siteId?: string): Promise<Quote[]> => {
    const db = await dbPromise;
    if (siteId) {
      return db.getAllFromIndex('quotes', 'by-siteId', siteId);
    }
    return db.getAll('quotes');
  },
  
  get: async (id: string): Promise<Quote | undefined> => {
    const db = await dbPromise;
    return db.get('quotes', id);
  },
  
  add: async (quote: Omit<Quote, 'id'>): Promise<Quote> => {
    const db = await dbPromise;
    const newQuote: Quote = {
      ...quote,
      id: uuidv4()
    };
    await db.add('quotes', newQuote);
    return newQuote;
  },
  
  update: async (quote: Quote): Promise<Quote> => {
    const db = await dbPromise;
    await db.put('quotes', quote);
    return quote;
  },
  
  delete: async (id: string): Promise<void> => {
    const db = await dbPromise;
    await db.delete('quotes', id);
  },
  
  getByClient: async (clientId: string): Promise<Quote[]> => {
    const db = await dbPromise;
    return db.getAllFromIndex('quotes', 'by-client', clientId);
  },
  
  getByStatus: async (status: Quote['status'], siteId?: string): Promise<Quote[]> => {
    const db = await dbPromise;
    const quotes = await db.getAllFromIndex('quotes', 'by-status', status);
    if (siteId) {
      return quotes.filter(quote => quote.siteId === siteId);
    }
    return quotes;
  },
  
  getNextQuoteNumber: async (siteId: string): Promise<string> => {
    const db = await dbPromise;
    const quotes = await db.getAllFromIndex('quotes', 'by-siteId', siteId);
    
    // Format: DEVIS-YYYY-XXXX
    const currentYear = new Date().getFullYear();
    const prefix = `DEVIS-${currentYear}-`;
    
    // Find the highest number
    let max = 0;
    quotes.forEach(quote => {
      if (quote.number.startsWith(prefix)) {
        const num = parseInt(quote.number.substring(prefix.length), 10);
        if (!isNaN(num) && num > max) {
          max = num;
        }
      }
    });
    
    // Format with leading zeros (4 digits)
    return `${prefix}${String(max + 1).padStart(4, '0')}`;
  }
};

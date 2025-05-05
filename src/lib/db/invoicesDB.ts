
import { dbPromise } from './index';
import { Invoice } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const invoicesDB = {
  getAll: async (siteId?: string): Promise<Invoice[]> => {
    const db = await dbPromise;
    if (siteId) {
      return db.getAllFromIndex('invoices', 'by-siteId', siteId);
    }
    return db.getAll('invoices');
  },
  
  get: async (id: string): Promise<Invoice | undefined> => {
    const db = await dbPromise;
    return db.get('invoices', id);
  },
  
  add: async (invoice: Omit<Invoice, 'id'>): Promise<Invoice> => {
    const db = await dbPromise;
    const newInvoice: Invoice = {
      ...invoice,
      id: uuidv4()
    };
    await db.add('invoices', newInvoice);
    return newInvoice;
  },
  
  update: async (invoice: Invoice): Promise<Invoice> => {
    const db = await dbPromise;
    await db.put('invoices', invoice);
    return invoice;
  },
  
  delete: async (id: string): Promise<void> => {
    const db = await dbPromise;
    await db.delete('invoices', id);
  },
  
  getByClient: async (clientId: string): Promise<Invoice[]> => {
    const db = await dbPromise;
    return db.getAllFromIndex('invoices', 'by-client', clientId);
  },
  
  getByStatus: async (status: Invoice['status'], siteId?: string): Promise<Invoice[]> => {
    const db = await dbPromise;
    const invoices = await db.getAllFromIndex('invoices', 'by-status', status);
    if (siteId) {
      return invoices.filter(invoice => invoice.siteId === siteId);
    }
    return invoices;
  },
  
  getNextInvoiceNumber: async (siteId: string): Promise<string> => {
    const db = await dbPromise;
    const invoices = await db.getAllFromIndex('invoices', 'by-siteId', siteId);
    
    // Format: FACT-YYYY-XXXX
    const currentYear = new Date().getFullYear();
    const prefix = `FACT-${currentYear}-`;
    
    // Find the highest number
    let max = 0;
    invoices.forEach(invoice => {
      if (invoice.number.startsWith(prefix)) {
        const num = parseInt(invoice.number.substring(prefix.length), 10);
        if (!isNaN(num) && num > max) {
          max = num;
        }
      }
    });
    
    // Format with leading zeros (4 digits)
    return `${prefix}${String(max + 1).padStart(4, '0')}`;
  }
};

import { useLocalStorage } from './useLocalStorage';
import { Invoice } from '@/lib/types';
import { generateDocumentNumber } from '@/lib/utils/documentUtils';

export function useInvoices() {
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('invoices', []);

  const createInvoice = (invoice: Omit<Invoice, 'id' | 'number'>) => {
    const newInvoice: Invoice = {
      ...invoice,
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      number: generateDocumentNumber('invoice', invoices),
    };
    setInvoices([...invoices, newInvoice]);
    return newInvoice;
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices(invoices.map(inv => 
      inv.id === id ? { ...inv, ...updates } : inv
    ));
  };

  const deleteInvoice = (id: string) => {
    setInvoices(invoices.filter(inv => inv.id !== id));
  };

  const getInvoice = (id: string) => {
    return invoices.find(inv => inv.id === id);
  };

  return {
    invoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoice,
  };
}

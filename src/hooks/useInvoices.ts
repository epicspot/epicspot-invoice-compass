import { useState, useEffect } from 'react';
import { Invoice } from '@/lib/types';

const API_URL = 'http://localhost:3001/api';

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      const response = await fetch(`${API_URL}/invoices`);
      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const createInvoice = async (invoice: Omit<Invoice, 'id' | 'number'>) => {
    try {
      const response = await fetch(`${API_URL}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: invoice.client.id,
          date: invoice.date,
          items: invoice.items,
          total: invoice.total,
          tax: invoice.tax,
          status: invoice.status,
          paid_amount: 0,
        }),
      });
      const newInvoice = await response.json();
      await fetchInvoices();
      return newInvoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    try {
      await fetch(`${API_URL}/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: updates.client?.id,
          date: updates.date,
          items: updates.items,
          total: updates.total,
          tax: updates.tax,
          status: updates.status,
          paid_amount: 0,
        }),
      });
      await fetchInvoices();
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      await fetch(`${API_URL}/invoices/${id}`, {
        method: 'DELETE',
      });
      await fetchInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  };

  const getInvoice = (id: string) => {
    return invoices.find(inv => inv.id === id);
  };

  return {
    invoices,
    loading,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoice,
    refetch: fetchInvoices,
  };
}

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Invoice } from '@/lib/types';
import { useErrorHandler } from './useErrorHandler';

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { handleError } = useErrorHandler();

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, clients(*), invoice_items(*, products(*))')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedInvoices: Invoice[] = (data || []).map(inv => ({
        id: inv.id,
        number: inv.number,
        date: inv.date,
        client: inv.clients,
        items: (inv.invoice_items || []).map((item: any) => ({
          id: item.id,
          product: item.products,
          quantity: item.quantity,
          amount: item.amount,
        })),
        subtotal: inv.subtotal,
        total: inv.total,
        tax: inv.tax,
        status: inv.status as 'draft' | 'sent' | 'paid' | 'overdue',
        paidAmount: inv.paid_amount,
        siteId: inv.site_id,
      }));

      setInvoices(mappedInvoices);
    } catch (error) {
      handleError(error, {
        severity: 'warning',
        title: 'Erreur de chargement des factures',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('invoices-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices'
        },
        () => {
          fetchInvoices();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoice_items'
        },
        () => {
          fetchInvoices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createInvoice = async (invoice: Omit<Invoice, 'id' | 'number'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const invoiceNumber = `INV-${Date.now()}`;
      
      const clientId = invoice.clientId || invoice.client?.id;
      const vendorId = invoice.vendorId || invoice.vendor?.id;
      
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
          number: invoiceNumber,
          client_id: clientId || null,
          vendor_id: vendorId || null,
          date: invoice.date,
          subtotal: invoice.subtotal,
          tax: invoice.tax || 0,
          discount: invoice.discount || 0,
          total: invoice.total,
          status: invoice.status,
          paid_amount: 0,
          created_by: user?.id,
        }])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      const itemsToInsert = invoice.items
        .filter(item => item.product && item.product.id)
        .map(item => ({
          invoice_id: invoiceData.id,
          product_id: item.product.id,
          quantity: item.quantity,
          amount: item.amount,
        }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      await fetchInvoices();
      return invoiceData;
    } catch (error) {
      handleError(error, {
        severity: 'error',
        title: 'Erreur de création de facture',
      });
      throw error;
    }
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({
          client_id: updates.client?.id,
          date: updates.date,
          subtotal: updates.total,
          tax: updates.tax,
          total: updates.total,
          status: updates.status,
        })
        .eq('id', id);

      if (error) throw error;
      await fetchInvoices();
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;
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

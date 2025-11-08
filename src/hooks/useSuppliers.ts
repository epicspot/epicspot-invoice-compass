import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Supplier } from '@/lib/types';

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedSuppliers: Supplier[] = (data || []).map(s => ({
        id: s.id,
        name: s.name,
        email: s.email || '',
        phone: s.phone || '',
        address: s.address || '',
        contactPerson: s.contact_person || '',
        taxInfo: s.tax_info || '',
        createdAt: s.created_at,
        active: true,
      }));

      setSuppliers(mappedSuppliers);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('suppliers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'suppliers'
        },
        () => {
          fetchSuppliers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addSupplier = async (supplier: Omit<Supplier, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert({
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address,
          contact_person: supplier.contactPerson,
          tax_info: supplier.taxInfo,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchSuppliers();
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la création' 
      };
    }
  };

  const updateSupplier = async (id: string, updatedSupplier: Partial<Supplier>) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .update({
          name: updatedSupplier.name,
          email: updatedSupplier.email,
          phone: updatedSupplier.phone,
          address: updatedSupplier.address,
          contact_person: updatedSupplier.contactPerson,
          tax_info: updatedSupplier.taxInfo,
        })
        .eq('id', id);

      if (error) throw error;

      await fetchSuppliers();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la modification' 
      };
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchSuppliers();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression' 
      };
    }
  };

  return {
    suppliers,
    loading,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    refetch: fetchSuppliers,
  };
}

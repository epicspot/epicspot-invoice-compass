import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Vendor } from '@/lib/types';

export function useVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedVendors: Vendor[] = (data || []).map((v: any) => ({
        id: v.id,
        code: v.code,
        name: v.name,
        phone: v.phone,
        email: v.email,
        address: v.address,
        siteId: v.site_id,
        totalDebt: v.total_debt,
        paidAmount: v.paid_amount,
        remainingBalance: v.remaining_balance,
        active: v.active,
        createdAt: v.created_at,
      }));
      setVendors(formattedVendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('vendors-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vendors'
        },
        () => {
          fetchVendors();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createVendor = async (vendor: Omit<Vendor, 'id' | 'totalDebt' | 'paidAmount' | 'remainingBalance' | 'active'>) => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .insert({
          code: vendor.code,
          name: vendor.name,
          phone: vendor.phone,
          email: vendor.email,
          address: vendor.address,
          site_id: vendor.siteId || null,
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      await fetchVendors();
      return data;
    } catch (error) {
      console.error('Error creating vendor:', error);
      throw error;
    }
  };

  const updateVendor = async (id: string, updates: Partial<Vendor>) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({
          code: updates.code,
          name: updates.name,
          phone: updates.phone,
          email: updates.email,
          address: updates.address,
          site_id: updates.siteId === '' ? null : updates.siteId,
          total_debt: updates.totalDebt,
          paid_amount: updates.paidAmount,
          remaining_balance: updates.remainingBalance,
          active: updates.active,
        })
        .eq('id', id);

      if (error) throw error;
      await fetchVendors();
    } catch (error) {
      console.error('Error updating vendor:', error);
      throw error;
    }
  };

  const deleteVendor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchVendors();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      throw error;
    }
  };

  const addCredit = async (vendorId: string, amount: number) => {
    try {
      const vendor = vendors.find(v => v.id === vendorId);
      if (!vendor) throw new Error('Vendor not found');

      const { error } = await supabase
        .from('vendors')
        .update({
          total_debt: (vendor.totalDebt || 0) + amount,
          remaining_balance: (vendor.remainingBalance || 0) + amount,
        })
        .eq('id', vendorId);

      if (error) throw error;
      await fetchVendors();
    } catch (error) {
      console.error('Error adding credit:', error);
      throw error;
    }
  };

  return {
    vendors,
    loading,
    createVendor,
    updateVendor,
    deleteVendor,
    addCredit,
    refetch: fetchVendors,
  };
}

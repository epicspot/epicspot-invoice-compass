import { useState, useEffect } from 'react';
import { Vendor } from '@/lib/types';

const API_URL = 'http://localhost:3001/api';

export function useVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVendors = async () => {
    try {
      const response = await fetch(`${API_URL}/vendors`);
      const data = await response.json();
      const formattedVendors = data.map((v: any) => ({
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
        active: v.active === 1,
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
  }, []);

  const createVendor = async (vendor: Omit<Vendor, 'id' | 'totalDebt' | 'paidAmount' | 'remainingBalance' | 'active'>) => {
    try {
      const response = await fetch(`${API_URL}/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: vendor.code,
          name: vendor.name,
          phone: vendor.phone,
          email: vendor.email,
          address: vendor.address,
          siteId: vendor.siteId,
        }),
      });
      await fetchVendors();
      return await response.json();
    } catch (error) {
      console.error('Error creating vendor:', error);
      throw error;
    }
  };

  const updateVendor = async (id: string, updates: Partial<Vendor>) => {
    try {
      await fetch(`${API_URL}/vendors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: updates.code,
          name: updates.name,
          phone: updates.phone,
          email: updates.email,
          address: updates.address,
          siteId: updates.siteId,
          totalDebt: updates.totalDebt,
          paidAmount: updates.paidAmount,
          remainingBalance: updates.remainingBalance,
          active: updates.active ? 1 : 0,
        }),
      });
      await fetchVendors();
    } catch (error) {
      console.error('Error updating vendor:', error);
      throw error;
    }
  };

  const deleteVendor = async (id: string) => {
    try {
      await fetch(`${API_URL}/vendors/${id}`, {
        method: 'DELETE',
      });
      await fetchVendors();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      throw error;
    }
  };

  const addCredit = async (vendorId: string, amount: number) => {
    try {
      await fetch(`${API_URL}/vendors/${vendorId}/add-credit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
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

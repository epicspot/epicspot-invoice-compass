import { useState, useEffect } from 'react';
import { Supplier } from '@/lib/types';

const API_URL = 'http://localhost:3001/api';

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`${API_URL}/suppliers`);
      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const addSupplier = async (supplier: Omit<Supplier, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch(`${API_URL}/suppliers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplier),
      });
      
      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error || 'Erreur lors de la création' };
      }
      
      const newSupplier = await response.json();
      await fetchSuppliers();
      return { success: true, data: newSupplier };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur lors de la création' };
    }
  };

  const updateSupplier = async (id: string, updatedSupplier: Partial<Supplier>) => {
    try {
      const response = await fetch(`${API_URL}/suppliers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSupplier),
      });
      
      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error || 'Erreur lors de la modification' };
      }
      
      await fetchSuppliers();
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur lors de la modification' };
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/suppliers/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error || 'Erreur lors de la suppression' };
      }
      
      await fetchSuppliers();
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur lors de la suppression' };
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

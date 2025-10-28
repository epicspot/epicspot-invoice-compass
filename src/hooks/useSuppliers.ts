import { useLocalStorage } from './useLocalStorage';
import { Supplier } from '@/lib/types';

export function useSuppliers() {
  const [suppliers, setSuppliers] = useLocalStorage<Supplier[]>('suppliers', []);

  const addSupplier = (supplier: Omit<Supplier, 'id' | 'createdAt'>) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setSuppliers([...suppliers, newSupplier]);
  };

  const updateSupplier = (id: string, updatedSupplier: Partial<Supplier>) => {
    setSuppliers(suppliers.map(s => s.id === id ? { ...s, ...updatedSupplier } : s));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
  };

  return {
    suppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
  };
}

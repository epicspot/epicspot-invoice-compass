import { useLocalStorage } from './useLocalStorage';
import { Supplier } from '@/lib/types';

export function useSuppliers() {
  const [suppliers, setSuppliers] = useLocalStorage<Supplier[]>('suppliers', [
    {
      id: '1',
      name: 'TechSupply France',
      code: 'TECH001',
      address: '15 Avenue de la République, 75011 Paris',
      phone: '01 23 45 67 89',
      email: 'contact@techsupply.fr',
      contactPerson: 'Marie Dubois',
      taxInfo: 'FR12345678901',
      bankAccount: 'FR76 1234 5678 9012 3456 7890 123',
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Global Electronics',
      code: 'GLOB001',
      address: '45 Rue de la Paix, 69003 Lyon',
      phone: '04 56 78 90 12',
      email: 'info@globalelec.fr',
      contactPerson: 'Jean Martin',
      taxInfo: 'FR98765432109',
      active: true,
      createdAt: new Date().toISOString(),
    }
  ]);

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

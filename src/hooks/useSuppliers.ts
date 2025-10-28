import { useLocalStorage } from './useLocalStorage';
import { Supplier } from '@/lib/types';

export function useSuppliers() {
  const [suppliers, setSuppliers] = useLocalStorage<Supplier[]>('suppliers', []);

  const addSupplier = (supplier: Omit<Supplier, 'id' | 'createdAt'>) => {
    try {
      // Vérifier les doublons par code
      if (supplier.code && suppliers.some(s => s.code === supplier.code)) {
        throw new Error('Un fournisseur avec ce code existe déjà');
      }
      
      const newSupplier: Supplier = {
        ...supplier,
        id: `sup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      };
      setSuppliers([...suppliers, newSupplier]);
      return { success: true, data: newSupplier };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur lors de la création' };
    }
  };

  const updateSupplier = (id: string, updatedSupplier: Partial<Supplier>) => {
    try {
      // Vérifier les doublons par code (sauf pour le fournisseur actuel)
      if (updatedSupplier.code && suppliers.some(s => s.id !== id && s.code === updatedSupplier.code)) {
        throw new Error('Un autre fournisseur utilise déjà ce code');
      }
      
      const supplier = suppliers.find(s => s.id === id);
      if (!supplier) {
        throw new Error('Fournisseur introuvable');
      }
      
      setSuppliers(suppliers.map(s => s.id === id ? { ...s, ...updatedSupplier } : s));
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur lors de la modification' };
    }
  };

  const deleteSupplier = (id: string) => {
    try {
      const supplier = suppliers.find(s => s.id === id);
      if (!supplier) {
        throw new Error('Fournisseur introuvable');
      }
      
      setSuppliers(suppliers.filter(s => s.id !== id));
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur lors de la suppression' };
    }
  };

  return {
    suppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
  };
}

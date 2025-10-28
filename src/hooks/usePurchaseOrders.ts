import { useLocalStorage } from './useLocalStorage';
import { PurchaseOrder } from '@/lib/types';

export function usePurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useLocalStorage<PurchaseOrder[]>('purchaseOrders', []);

  const addPurchaseOrder = (order: Omit<PurchaseOrder, 'id'>) => {
    try {
      // Vérifier les doublons par numéro
      if (purchaseOrders.some(o => o.number === order.number)) {
        throw new Error('Une commande avec ce numéro existe déjà');
      }
      
      const newOrder: PurchaseOrder = {
        ...order,
        id: `po_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      setPurchaseOrders([...purchaseOrders, newOrder]);
      return { success: true, data: newOrder };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur lors de la création' };
    }
  };

  const updatePurchaseOrder = (id: string, updatedOrder: Partial<PurchaseOrder>) => {
    try {
      // Vérifier les doublons par numéro (sauf pour la commande actuelle)
      if (updatedOrder.number && purchaseOrders.some(o => o.id !== id && o.number === updatedOrder.number)) {
        throw new Error('Une autre commande utilise déjà ce numéro');
      }
      
      const order = purchaseOrders.find(o => o.id === id);
      if (!order) {
        throw new Error('Commande introuvable');
      }
      
      setPurchaseOrders(purchaseOrders.map(o => o.id === id ? { ...o, ...updatedOrder } : o));
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur lors de la modification' };
    }
  };

  const deletePurchaseOrder = (id: string) => {
    try {
      const order = purchaseOrders.find(o => o.id === id);
      if (!order) {
        throw new Error('Commande introuvable');
      }
      
      setPurchaseOrders(purchaseOrders.filter(o => o.id !== id));
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur lors de la suppression' };
    }
  };

  return {
    purchaseOrders,
    addPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
  };
}

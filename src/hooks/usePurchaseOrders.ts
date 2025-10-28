import { useLocalStorage } from './useLocalStorage';
import { PurchaseOrder } from '@/lib/types';

export function usePurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useLocalStorage<PurchaseOrder[]>('purchaseOrders', []);

  const addPurchaseOrder = (order: Omit<PurchaseOrder, 'id'>) => {
    const newOrder: PurchaseOrder = {
      ...order,
      id: Date.now().toString(),
    };
    setPurchaseOrders([...purchaseOrders, newOrder]);
  };

  const updatePurchaseOrder = (id: string, updatedOrder: Partial<PurchaseOrder>) => {
    setPurchaseOrders(purchaseOrders.map(o => o.id === id ? { ...o, ...updatedOrder } : o));
  };

  const deletePurchaseOrder = (id: string) => {
    setPurchaseOrders(purchaseOrders.filter(o => o.id !== id));
  };

  return {
    purchaseOrders,
    addPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
  };
}

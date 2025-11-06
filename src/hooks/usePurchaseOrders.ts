import { useState, useEffect } from 'react';
import { PurchaseOrder } from '@/lib/types';

const API_URL = 'http://localhost:3001/api';

export function usePurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchaseOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/purchase-orders`);
      const data = await response.json();
      setPurchaseOrders(data);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const addPurchaseOrder = async (order: Omit<PurchaseOrder, 'id'>) => {
    try {
      const response = await fetch(`${API_URL}/purchase-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: order.number,
          supplier_id: order.supplier.id,
          order_date: order.date,
          expected_delivery_date: order.expectedDeliveryDate,
          items: order.items,
          total: order.total,
          status: order.status,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error || 'Erreur lors de la création' };
      }
      
      const newOrder = await response.json();
      await fetchPurchaseOrders();
      return { success: true, data: newOrder };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur lors de la création' };
    }
  };

  const updatePurchaseOrder = async (id: string, updatedOrder: Partial<PurchaseOrder>) => {
    try {
      const response = await fetch(`${API_URL}/purchase-orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: updatedOrder.number,
          supplier_id: updatedOrder.supplier?.id,
          order_date: updatedOrder.date,
          expected_delivery_date: updatedOrder.expectedDeliveryDate,
          items: updatedOrder.items,
          total: updatedOrder.total,
          status: updatedOrder.status,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error || 'Erreur lors de la modification' };
      }
      
      await fetchPurchaseOrders();
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur lors de la modification' };
    }
  };

  const deletePurchaseOrder = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/purchase-orders/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error || 'Erreur lors de la suppression' };
      }
      
      await fetchPurchaseOrders();
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur lors de la suppression' };
    }
  };

  return {
    purchaseOrders,
    loading,
    addPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    refetch: fetchPurchaseOrders,
  };
}

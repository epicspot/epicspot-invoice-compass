import { useState, useEffect } from 'react';
import { StockMovement } from '@/lib/types';

const API_URL = 'http://localhost:3001/api';

export function useStockMovements() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMovements = async () => {
    try {
      const response = await fetch(`${API_URL}/stock-movements`);
      const data = await response.json();
      setMovements(data);
    } catch (error) {
      console.error('Error fetching stock movements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  const createMovement = async (movement: Omit<StockMovement, 'id' | 'date'>) => {
    try {
      const response = await fetch(`${API_URL}/stock-movements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: movement.productId,
          site_id: movement.siteId,
          quantity: movement.quantity,
          type: movement.type,
          reference: movement.reference,
          notes: movement.notes,
        }),
      });
      const newMovement = await response.json();
      await fetchMovements();
      return { success: true, data: newMovement };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur lors de la création' };
    }
  };

  const getMovementsByProduct = (productId: string) => {
    return movements.filter(m => m.productId === productId);
  };

  const getMovementsBySite = (siteId: string) => {
    return movements.filter(m => m.siteId === siteId);
  };

  const getCurrentStock = (productId: string, siteId: string) => {
    return movements
      .filter(m => m.productId === productId && m.siteId === siteId)
      .reduce((total, m) => total + m.quantity, 0);
  };

  return {
    movements,
    loading,
    createMovement,
    getMovementsByProduct,
    getMovementsBySite,
    getCurrentStock,
    refetch: fetchMovements,
  };
}

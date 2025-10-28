import { useLocalStorage } from './useLocalStorage';
import { StockMovement } from '@/lib/types';

export function useStockMovements() {
  const [movements, setMovements] = useLocalStorage<StockMovement[]>('stockMovements', []);

  const createMovement = (movement: Omit<StockMovement, 'id' | 'date'>) => {
    const newMovement: StockMovement = {
      ...movement,
      id: `mov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString(),
    };
    setMovements([...movements, newMovement]);
    return newMovement;
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
    createMovement,
    getMovementsByProduct,
    getMovementsBySite,
    getCurrentStock,
  };
}

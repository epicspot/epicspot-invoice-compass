import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StockMovement } from '@/lib/types';

export function useStockMovements() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMovements = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          products:product_id (
            id,
            reference,
            description,
            price
          ),
          sites:site_id (
            id,
            name
          ),
          from_sites:from_site_id (
            id,
            name
          ),
          to_sites:to_site_id (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedMovements: StockMovement[] = (data || []).map((movement: any) => ({
        id: movement.id,
        productId: movement.product_id,
        siteId: movement.site_id,
        quantity: movement.quantity,
        type: movement.type,
        reference: movement.reference,
        date: movement.created_at,
        notes: movement.notes,
        userId: movement.created_by,
      }));

      setMovements(formattedMovements);
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
      const { data, error } = await supabase
        .from('stock_movements')
        .insert({
          product_id: movement.productId,
          site_id: movement.siteId,
          quantity: movement.quantity,
          type: movement.type,
          reference: movement.reference,
          notes: movement.notes,
          created_by: movement.userId,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchMovements();
      return { success: true, data };
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

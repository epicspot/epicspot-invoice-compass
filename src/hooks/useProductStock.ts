import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProductStockInfo {
  productId: string;
  siteId: string;
  quantity: number;
  product?: {
    reference: string;
    description: string;
    price: number;
    minStock?: number;
  };
}

export function useProductStock(siteId?: string) {
  const [stockData, setStockData] = useState<ProductStockInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStock = async () => {
    try {
      let query = supabase
        .from('product_stock')
        .select(`
          *,
          products:product_id (
            id,
            reference,
            description,
            price,
            min_stock
          )
        `);

      if (siteId) {
        query = query.eq('site_id', siteId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const mappedStock: ProductStockInfo[] = (data || []).map((item: any) => ({
        productId: item.product_id,
        siteId: item.site_id,
        quantity: item.quantity,
        product: item.products ? {
          reference: item.products.reference,
          description: item.products.description,
          price: Number(item.products.price),
          minStock: item.products.min_stock || undefined,
        } : undefined,
      }));

      setStockData(mappedStock);
    } catch (error) {
      console.error('Error fetching product stock:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [siteId]);

  const getStock = (productId: string, targetSiteId: string) => {
    const stock = stockData.find(
      s => s.productId === productId && s.siteId === targetSiteId
    );
    return stock?.quantity || 0;
  };

  const getLowStockProducts = (targetSiteId: string) => {
    return stockData.filter(item => {
      if (item.siteId !== targetSiteId || !item.product?.minStock) return false;
      return item.quantity <= item.product.minStock;
    });
  };

  const updateStock = async (productId: string, targetSiteId: string, quantity: number) => {
    try {
      const { error } = await supabase
        .from('product_stock')
        .upsert({
          product_id: productId,
          site_id: targetSiteId,
          quantity,
        }, {
          onConflict: 'product_id,site_id',
        });

      if (error) throw error;
      await fetchStock();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du stock' 
      };
    }
  };

  return {
    stockData,
    loading,
    getStock,
    getLowStockProducts,
    updateStock,
    refetch: fetchStock,
  };
}

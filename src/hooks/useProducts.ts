import { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedProducts: Product[] = (data || []).map(p => ({
        id: p.id,
        reference: p.reference,
        description: p.description,
        price: Number(p.price),
        category: p.category_id || '',
        taxRate: p.tax_rate ? Number(p.tax_rate) : undefined,
        minStock: p.min_stock || undefined,
      }));

      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createProduct = async (product: Omit<Product, 'id' | 'reference'>) => {
    try {
      // Generate a unique reference for the product
      const reference = `PROD-${Date.now().toString().slice(-8)}`;
      
      const { data, error } = await supabase
        .from('products')
        .insert({
          reference,
          description: product.description,
          price: product.price,
          tax_rate: product.taxRate || 0,
          min_stock: product.minStock || 0,
          category_id: product.category || null,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchProducts();
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          description: updates.description,
          price: updates.price,
          tax_rate: updates.taxRate,
          min_stock: updates.minStock,
          category_id: updates.category || null,
        })
        .eq('id', id);

      if (error) throw error;

      await fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const getProduct = (id: string) => {
    return products.find(p => p.id === id);
  };

  return {
    products,
    loading,
    createProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    refetch: fetchProducts,
  };
}

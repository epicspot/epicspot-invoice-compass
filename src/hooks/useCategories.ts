import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProductCategory {
  id: string;
  name: string;
}

export function useCategories() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');

      if (error) throw error;

      const mappedCategories: ProductCategory[] = (data || []).map(c => ({
        id: c.id,
        name: c.name,
      }));

      setCategories(mappedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const createCategory = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .insert({ name })
        .select()
        .single();

      if (error) throw error;

      await fetchCategories();
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la création' 
      };
    }
  };

  return {
    categories,
    loading,
    createCategory,
    refetch: fetchCategories,
  };
}

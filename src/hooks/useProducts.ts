import { useState, useEffect } from 'react';
import { Product } from '@/lib/types';

const API_URL = 'http://localhost:3001/api';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const createProduct = async (product: Omit<Product, 'id' | 'reference'>) => {
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: product.description,
          unit_price: product.price,
          quantity: 0,
          category: product.category,
        }),
      });
      const newProduct = await response.json();
      await fetchProducts();
      return newProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: updates.description,
          unit_price: updates.price,
          quantity: 0,
          category: updates.category,
        }),
      });
      await fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
      });
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

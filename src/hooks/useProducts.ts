import { useLocalStorage } from './useLocalStorage';
import { Product } from '@/lib/types';

const initialProducts: Product[] = [
  { id: '1', reference: 'P1', description: 'Produit 1', price: 100000 },
  { id: '2', reference: 'P2', description: 'Service mensuel', price: 50000 },
  { id: '3', reference: 'P3', description: 'Consultation', price: 75000 },
];

export function useProducts() {
  const [products, setProducts] = useLocalStorage<Product[]>('products', initialProducts);

  const createProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setProducts([...products, newProduct]);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const getProduct = (id: string) => {
    return products.find(p => p.id === id);
  };

  return {
    products,
    createProduct,
    updateProduct,
    deleteProduct,
    getProduct,
  };
}

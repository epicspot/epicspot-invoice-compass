
import { dbPromise } from './index';
import { Product } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const productsDB = {
  getAll: async (): Promise<Product[]> => {
    const db = await dbPromise;
    return db.getAll('products');
  },
  
  get: async (id: string): Promise<Product | undefined> => {
    const db = await dbPromise;
    return db.get('products', id);
  },
  
  add: async (product: Omit<Product, 'id'>): Promise<Product> => {
    const db = await dbPromise;
    const newProduct: Product = {
      ...product,
      id: uuidv4()
    };
    await db.add('products', newProduct);
    return newProduct;
  },
  
  update: async (product: Product): Promise<Product> => {
    const db = await dbPromise;
    await db.put('products', product);
    return product;
  },
  
  delete: async (id: string): Promise<void> => {
    const db = await dbPromise;
    await db.delete('products', id);
  },
  
  search: async (query: string): Promise<Product[]> => {
    const db = await dbPromise;
    const products = await db.getAll('products');
    return products.filter(product => 
      product.reference.toLowerCase().includes(query.toLowerCase()) || 
      product.description.toLowerCase().includes(query.toLowerCase())
    );
  },
  
  updateStock: async (productId: string, siteId: string, quantity: number): Promise<Product> => {
    const db = await dbPromise;
    const product = await db.get('products', productId);
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    const updatedProduct: Product = {
      ...product,
      stock: {
        ...product.stock,
        [siteId]: (product.stock?.[siteId] || 0) + quantity
      }
    };
    
    await db.put('products', updatedProduct);
    return updatedProduct;
  }
};

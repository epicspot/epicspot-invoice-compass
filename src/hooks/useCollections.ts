import { useState, useEffect } from 'react';
import { Collection } from '@/lib/types';

const API_URL = 'http://localhost:3001/api';

interface CollectionWithDetails extends Collection {
  vendorName?: string;
  collectorName?: string;
}

export function useCollections() {
  const [collections, setCollections] = useState<CollectionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCollections = async () => {
    try {
      const response = await fetch(`${API_URL}/collections`);
      const data = await response.json();
      const formattedCollections = data.map((c: any) => ({
        id: c.id,
        vendorId: c.vendor_id,
        amount: c.amount,
        collectionDate: c.collection_date,
        collectorId: c.collector_id,
        paymentMethod: c.payment_method,
        notes: c.notes,
        createdAt: c.created_at,
        vendorName: c.vendor_name,
        collectorName: c.collector_name,
      }));
      setCollections(formattedCollections);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const createCollection = async (collection: Omit<Collection, 'id'>) => {
    try {
      const response = await fetch(`${API_URL}/collections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: collection.vendorId,
          amount: collection.amount,
          collectionDate: collection.collectionDate,
          collectorId: collection.collectorId,
          paymentMethod: collection.paymentMethod,
          notes: collection.notes,
        }),
      });
      await fetchCollections();
      return await response.json();
    } catch (error) {
      console.error('Error creating collection:', error);
      throw error;
    }
  };

  const updateCollection = async (id: string, updates: Partial<Collection>) => {
    try {
      await fetch(`${API_URL}/collections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: updates.vendorId,
          amount: updates.amount,
          collectionDate: updates.collectionDate,
          collectorId: updates.collectorId,
          paymentMethod: updates.paymentMethod,
          notes: updates.notes,
        }),
      });
      await fetchCollections();
    } catch (error) {
      console.error('Error updating collection:', error);
      throw error;
    }
  };

  const deleteCollection = async (id: string) => {
    try {
      await fetch(`${API_URL}/collections/${id}`, {
        method: 'DELETE',
      });
      await fetchCollections();
    } catch (error) {
      console.error('Error deleting collection:', error);
      throw error;
    }
  };

  return {
    collections,
    loading,
    createCollection,
    updateCollection,
    deleteCollection,
    refetch: fetchCollections,
  };
}

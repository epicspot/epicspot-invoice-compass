import { useState, useEffect } from 'react';
import { Client } from '@/lib/types';

const API_URL = 'http://localhost:3001/api';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    try {
      const response = await fetch(`${API_URL}/clients`);
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const createClient = async (client: Omit<Client, 'id' | 'code'>) => {
    try {
      const response = await fetch(`${API_URL}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client),
      });
      const newClient = await response.json();
      await fetchClients();
      return newClient;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      await fetch(`${API_URL}/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      await fetchClients();
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      await fetch(`${API_URL}/clients/${id}`, {
        method: 'DELETE',
      });
      await fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  };

  const getClient = (id: string) => {
    return clients.find(c => c.id === id);
  };

  return {
    clients,
    loading,
    createClient,
    updateClient,
    deleteClient,
    getClient,
    refetch: fetchClients,
  };
}

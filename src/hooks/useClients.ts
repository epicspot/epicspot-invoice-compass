import { useLocalStorage } from './useLocalStorage';
import { Client } from '@/lib/types';

export function useClients() {
  const [clients, setClients] = useLocalStorage<Client[]>('clients', []);

  const createClient = (client: Omit<Client, 'id'>) => {
    const newClient: Client = {
      ...client,
      id: `cli_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setClients([...clients, newClient]);
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients(clients.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  const deleteClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
  };

  const getClient = (id: string) => {
    return clients.find(c => c.id === id);
  };

  return {
    clients,
    createClient,
    updateClient,
    deleteClient,
    getClient,
  };
}

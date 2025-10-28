import { useLocalStorage } from './useLocalStorage';
import { Client } from '@/lib/types';

const initialClients: Client[] = [
  { id: '1', name: 'Societe ABC', address: 'Abidjan, Plateau', phone: '0123456789', code: 'CLI001' },
  { id: '2', name: 'Client XYZ', address: 'Abidjan, Cocody', phone: '9876543210', code: 'CLI002' },
  { id: '3', name: 'Entreprise DEF', address: 'Abidjan, Treichville', phone: '5555666777', code: 'CLI003' },
];

export function useClients() {
  const [clients, setClients] = useLocalStorage<Client[]>('clients', initialClients);

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

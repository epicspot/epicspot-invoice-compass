
import { dbPromise } from './index';
import { Client } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const clientsDB = {
  getAll: async (siteId?: string): Promise<Client[]> => {
    const db = await dbPromise;
    if (siteId) {
      return db.getAllFromIndex('clients', 'by-siteId', siteId);
    }
    return db.getAll('clients');
  },
  
  get: async (id: string): Promise<Client | undefined> => {
    const db = await dbPromise;
    return db.get('clients', id);
  },
  
  add: async (client: Omit<Client, 'id'>): Promise<Client> => {
    const db = await dbPromise;
    const newClient: Client = {
      ...client,
      id: uuidv4()
    };
    await db.add('clients', newClient);
    return newClient;
  },
  
  update: async (client: Client): Promise<Client> => {
    const db = await dbPromise;
    await db.put('clients', client);
    return client;
  },
  
  delete: async (id: string): Promise<void> => {
    const db = await dbPromise;
    await db.delete('clients', id);
  },
  
  search: async (query: string, siteId?: string): Promise<Client[]> => {
    const db = await dbPromise;
    const clients = siteId 
      ? await db.getAllFromIndex('clients', 'by-siteId', siteId)
      : await db.getAll('clients');
      
    return clients.filter(client => 
      client.name.toLowerCase().includes(query.toLowerCase()) || 
      client.code?.toLowerCase().includes(query.toLowerCase())
    );
  }
};

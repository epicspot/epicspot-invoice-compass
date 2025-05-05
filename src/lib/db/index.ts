
// Database initialization and version management
import { openDB, DBSchema } from 'idb';
import { Client, Product, Invoice, Quote, User, CashRegister, CashTransaction, Site } from '../types';

// Define our database schema
interface AppDB extends DBSchema {
  clients: {
    key: string;
    value: Client;
    indexes: { 'by-name': string; 'by-siteId': string };
  };
  products: {
    key: string;
    value: Product;
    indexes: { 'by-reference': string };
  };
  invoices: {
    key: string;
    value: Invoice;
    indexes: { 'by-number': string; 'by-client': string; 'by-siteId': string; 'by-status': string };
  };
  quotes: {
    key: string;
    value: Quote;
    indexes: { 'by-number': string; 'by-client': string; 'by-siteId': string; 'by-status': string };
  };
  users: {
    key: string;
    value: User;
    indexes: { 'by-email': string; 'by-role': string };
  };
  cashRegisters: {
    key: string;
    value: CashRegister;
    indexes: { 'by-siteId': string; 'by-status': string };
  };
  cashTransactions: {
    key: string;
    value: CashTransaction;
    indexes: { 'by-cashRegisterId': string; 'by-type': string; 'by-date': string };
  };
  sites: {
    key: string;
    value: Site;
    indexes: { 'by-name': string };
  };
}

// Database version
const DB_VERSION = 1;
const DB_NAME = 'epicspot-db';

// Initialize the database
export const dbPromise = openDB<AppDB>(DB_NAME, DB_VERSION, {
  upgrade(db) {
    // Create stores for each entity
    if (!db.objectStoreNames.contains('clients')) {
      const clientsStore = db.createObjectStore('clients', { keyPath: 'id' });
      clientsStore.createIndex('by-name', 'name');
      clientsStore.createIndex('by-siteId', 'siteId');
    }

    if (!db.objectStoreNames.contains('products')) {
      const productsStore = db.createObjectStore('products', { keyPath: 'id' });
      productsStore.createIndex('by-reference', 'reference');
    }

    if (!db.objectStoreNames.contains('invoices')) {
      const invoicesStore = db.createObjectStore('invoices', { keyPath: 'id' });
      invoicesStore.createIndex('by-number', 'number');
      invoicesStore.createIndex('by-client', 'client.id');
      invoicesStore.createIndex('by-siteId', 'siteId');
      invoicesStore.createIndex('by-status', 'status');
    }

    if (!db.objectStoreNames.contains('quotes')) {
      const quotesStore = db.createObjectStore('quotes', { keyPath: 'id' });
      quotesStore.createIndex('by-number', 'number');
      quotesStore.createIndex('by-client', 'client.id');
      quotesStore.createIndex('by-siteId', 'siteId');
      quotesStore.createIndex('by-status', 'status');
    }

    if (!db.objectStoreNames.contains('users')) {
      const usersStore = db.createObjectStore('users', { keyPath: 'id' });
      usersStore.createIndex('by-email', 'email');
      usersStore.createIndex('by-role', 'role');
    }

    if (!db.objectStoreNames.contains('cashRegisters')) {
      const cashRegistersStore = db.createObjectStore('cashRegisters', { keyPath: 'id' });
      cashRegistersStore.createIndex('by-siteId', 'siteId');
      cashRegistersStore.createIndex('by-status', 'status');
    }

    if (!db.objectStoreNames.contains('cashTransactions')) {
      const cashTransactionsStore = db.createObjectStore('cashTransactions', { keyPath: 'id' });
      cashTransactionsStore.createIndex('by-cashRegisterId', 'cashRegisterId');
      cashTransactionsStore.createIndex('by-type', 'type');
      cashTransactionsStore.createIndex('by-date', 'date');
    }

    if (!db.objectStoreNames.contains('sites')) {
      const sitesStore = db.createObjectStore('sites', { keyPath: 'id' });
      sitesStore.createIndex('by-name', 'name');
    }
  }
});

// Initialize with some default data if needed
export const initializeDatabase = async () => {
  const db = await dbPromise;
  
  // Check if we already have sites
  const siteCount = await db.count('sites');
  if (siteCount === 0) {
    // Add a default site
    const defaultSite: Site = {
      id: 'site-1',
      name: 'Site Principal',
      address: 'Abidjan, Plateau',
      isMainSite: true
    };
    
    await db.add('sites', defaultSite);
    
    // Add some default cash registers for the site
    const cashRegisters: CashRegister[] = [
      {
        id: "reg-1",
        name: "Caisse principale",
        siteId: "site-1",
        initialAmount: 100000,
        currentAmount: 350750,
        lastReconciled: "2025-05-04T15:30:00",
        status: "open" as const
      },
      {
        id: "reg-2",
        name: "Caisse secondaire",
        siteId: "site-1",
        initialAmount: 50000,
        currentAmount: 120250,
        lastReconciled: "2025-05-03T18:45:00",
        status: "closed" as const
      }
    ];
    
    for (const reg of cashRegisters) {
      await db.add('cashRegisters', reg);
    }
    
    // Add default clients
    const clients: Client[] = [
      { id: '1', name: 'Societe ABC', address: 'Abidjan, Plateau', phone: '0123456789', code: 'CLI001', siteId: 'site-1' },
      { id: '2', name: 'Client XYZ', address: 'Abidjan, Cocody', phone: '9876543210', code: 'CLI002', siteId: 'site-1' },
      { id: '3', name: 'Entreprise DEF', address: 'Abidjan, Treichville', phone: '5555666777', code: 'CLI003', siteId: 'site-1' },
    ];
    
    for (const client of clients) {
      await db.add('clients', client);
    }
    
    // Add default products
    const products: Product[] = [
      { id: '1', reference: 'P1', description: 'Produit 1', price: 100000 },
      { id: '2', reference: 'P2', description: 'Service mensuel', price: 50000 },
      { id: '3', reference: 'P3', description: 'Consultation', price: 75000 },
    ];
    
    for (const product of products) {
      await db.add('products', product);
    }
  }
};

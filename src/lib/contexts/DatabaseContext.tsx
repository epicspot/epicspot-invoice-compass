
import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeDatabase } from '../db';
import { clientsDB } from '../db/clientsDB';
import { productsDB } from '../db/productsDB';
import { invoicesDB } from '../db/invoicesDB';
import { quotesDB } from '../db/quotesDB';
import { cashRegistersDB } from '../db/cashRegistersDB';
import { sitesDB } from '../db/sitesDB';
import { usersDB } from '../db/usersDB';
import { toast } from "@/components/ui/use-toast";

// Combine all DB operations into a single object
const db = {
  clients: clientsDB,
  products: productsDB,
  invoices: invoicesDB,
  quotes: quotesDB,
  cashRegisters: cashRegistersDB,
  sites: sitesDB,
  users: usersDB
};

type DatabaseContextType = {
  db: typeof db;
  isInitialized: boolean;
  error: Error | null;
};

const DatabaseContext = createContext<DatabaseContextType>({
  db,
  isInitialized: false,
  error: null
});

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeDatabase();
        setIsInitialized(true);
      } catch (err) {
        console.error("Failed to initialize database:", err);
        setError(err instanceof Error ? err : new Error('Unknown error initializing database'));
        toast({
          title: "Erreur de base de données",
          description: "Impossible d'initialiser la base de données locale.",
          variant: "destructive"
        });
      }
    };

    initialize();
  }, []);

  return (
    <DatabaseContext.Provider value={{ db, isInitialized, error }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => useContext(DatabaseContext);

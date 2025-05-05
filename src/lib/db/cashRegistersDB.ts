
import { dbPromise } from './index';
import { CashRegister, CashTransaction } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const cashRegistersDB = {
  getAll: async (siteId?: string): Promise<CashRegister[]> => {
    const db = await dbPromise;
    if (siteId) {
      return db.getAllFromIndex('cashRegisters', 'by-siteId', siteId);
    }
    return db.getAll('cashRegisters');
  },
  
  get: async (id: string): Promise<CashRegister | undefined> => {
    const db = await dbPromise;
    return db.get('cashRegisters', id);
  },
  
  add: async (register: Omit<CashRegister, 'id'>): Promise<CashRegister> => {
    const db = await dbPromise;
    const newRegister: CashRegister = {
      ...register,
      id: uuidv4()
    };
    await db.add('cashRegisters', newRegister);
    return newRegister;
  },
  
  update: async (register: CashRegister): Promise<CashRegister> => {
    const db = await dbPromise;
    await db.put('cashRegisters', register);
    return register;
  },
  
  delete: async (id: string): Promise<void> => {
    const db = await dbPromise;
    await db.delete('cashRegisters', id);
  },
  
  getByStatus: async (status: CashRegister['status'], siteId?: string): Promise<CashRegister[]> => {
    const db = await dbPromise;
    const registers = await db.getAllFromIndex('cashRegisters', 'by-status', status);
    if (siteId) {
      return registers.filter(register => register.siteId === siteId);
    }
    return registers;
  },
  
  // Cash Transactions
  
  addTransaction: async (transaction: Omit<CashTransaction, 'id'>): Promise<CashTransaction> => {
    const db = await dbPromise;
    
    // Update the cash register balance
    const register = await db.get('cashRegisters', transaction.cashRegisterId);
    if (!register) {
      throw new Error('Cash register not found');
    }
    
    const updatedRegister: CashRegister = {
      ...register,
      currentAmount: register.currentAmount + transaction.amount
    };
    
    // Create the transaction
    const newTransaction: CashTransaction = {
      ...transaction,
      id: uuidv4()
    };
    
    // Save both in a transaction
    const tx = db.transaction(['cashRegisters', 'cashTransactions'], 'readwrite');
    await tx.objectStore('cashRegisters').put(updatedRegister);
    await tx.objectStore('cashTransactions').add(newTransaction);
    await tx.done;
    
    return newTransaction;
  },
  
  getTransactions: async (cashRegisterId: string): Promise<CashTransaction[]> => {
    const db = await dbPromise;
    return db.getAllFromIndex('cashTransactions', 'by-cashRegisterId', cashRegisterId);
  },
  
  getTransactionsByDate: async (startDate: string, endDate: string): Promise<CashTransaction[]> => {
    const db = await dbPromise;
    const transactions = await db.getAll('cashTransactions');
    return transactions.filter(transaction => {
      const transDate = new Date(transaction.date);
      return transDate >= new Date(startDate) && transDate <= new Date(endDate);
    });
  }
};

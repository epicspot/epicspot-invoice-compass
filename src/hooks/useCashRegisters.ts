import { useLocalStorage } from './useLocalStorage';
import { CashRegister, CashTransaction } from '@/lib/types';

export function useCashRegisters() {
  const [cashRegisters, setCashRegisters] = useLocalStorage<CashRegister[]>('cashRegisters', [
    {
      id: 'reg-default',
      name: 'Caisse principale',
      siteId: 'default',
      initialAmount: 0,
      currentAmount: 0,
      status: 'open'
    }
  ]);
  
  const [transactions, setTransactions] = useLocalStorage<CashTransaction[]>('cashTransactions', []);

  const createRegister = (register: Omit<CashRegister, 'id' | 'currentAmount'>) => {
    const newRegister: CashRegister = {
      ...register,
      id: `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      currentAmount: register.initialAmount,
    };
    setCashRegisters([...cashRegisters, newRegister]);
    return newRegister;
  };

  const updateRegister = (id: string, updates: Partial<CashRegister>) => {
    setCashRegisters(cashRegisters.map(r =>
      r.id === id ? { ...r, ...updates } : r
    ));
  };

  const deleteRegister = (id: string) => {
    setCashRegisters(cashRegisters.filter(r => r.id !== id));
  };

  const getRegister = (id: string) => {
    return cashRegisters.find(r => r.id === id);
  };

  const addTransaction = (transaction: Omit<CashTransaction, 'id' | 'date'>) => {
    const newTransaction: CashTransaction = {
      ...transaction,
      id: `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString(),
    };

    setTransactions([...transactions, newTransaction]);

    // Update cash register amount
    const register = cashRegisters.find(r => r.id === transaction.cashRegisterId);
    if (register) {
      updateRegister(register.id, {
        currentAmount: register.currentAmount + transaction.amount
      });
    }

    return newTransaction;
  };

  const getTransactions = (cashRegisterId: string) => {
    return transactions.filter(t => t.cashRegisterId === cashRegisterId);
  };

  const openRegister = (id: string) => {
    updateRegister(id, { status: 'open' });
  };

  const closeRegister = (id: string) => {
    updateRegister(id, { status: 'closed' });
  };

  const reconcileRegister = (id: string, actualAmount: number) => {
    const register = getRegister(id);
    if (register) {
      const difference = actualAmount - register.currentAmount;
      
      if (difference !== 0) {
        addTransaction({
          cashRegisterId: id,
          amount: difference,
          type: 'adjustment',
          notes: `Ajustement de rapprochement: ${difference > 0 ? '+' : ''}${difference.toLocaleString()} FCFA`,
          userId: 'current-user'
        });
      }

      updateRegister(id, {
        status: 'open',
        lastReconciled: new Date().toISOString(),
        currentAmount: actualAmount
      });
    }
  };

  return {
    cashRegisters,
    transactions,
    createRegister,
    updateRegister,
    deleteRegister,
    getRegister,
    addTransaction,
    getTransactions,
    openRegister,
    closeRegister,
    reconcileRegister,
  };
}

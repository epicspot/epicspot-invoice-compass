import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CashRegister, CashTransaction } from '@/lib/types';

export function useCashRegistersRealtime() {
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCashRegisters = async () => {
    try {
      const { data, error } = await supabase
        .from('cash_registers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped: CashRegister[] = (data || []).map(r => ({
        id: r.id,
        name: r.name,
        siteId: r.site_id || 'default',
        initialAmount: Number(r.initial_amount),
        currentAmount: Number(r.current_amount),
        status: r.status as 'open' | 'closed',
        lastReconciled: r.last_reconciled || undefined,
      }));

      setCashRegisters(mapped);
    } catch (error) {
      console.error('Error fetching cash registers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('cash_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped: CashTransaction[] = (data || []).map(t => ({
        id: t.id,
        cashRegisterId: t.cash_register_id || '',
        type: t.type as 'sale' | 'refund' | 'withdrawal' | 'deposit' | 'adjustment' | 'bank_deposit',
        amount: Number(t.amount),
        reference: t.reference || undefined,
        notes: t.description || undefined,
        userId: t.user_id || '',
        date: t.created_at,
      }));

      setTransactions(mapped);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    fetchCashRegisters();
    fetchTransactions();

    // Subscribe to realtime changes for cash registers
    const registersChannel = supabase
      .channel('cash-registers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cash_registers'
        },
        () => {
          fetchCashRegisters();
        }
      )
      .subscribe();

    // Subscribe to realtime changes for cash transactions
    const transactionsChannel = supabase
      .channel('cash-transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cash_transactions'
        },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(registersChannel);
      supabase.removeChannel(transactionsChannel);
    };
  }, []);

  const createRegister = async (register: Omit<CashRegister, 'id' | 'currentAmount'>) => {
    try {
      const { data, error } = await supabase
        .from('cash_registers')
        .insert({
          name: register.name,
          site_id: register.siteId,
          initial_amount: register.initialAmount,
          current_amount: register.initialAmount,
          status: register.status,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating cash register:', error);
      throw error;
    }
  };

  const updateRegister = async (id: string, updates: Partial<CashRegister>) => {
    try {
      const { error } = await supabase
        .from('cash_registers')
        .update({
          name: updates.name,
          status: updates.status,
          current_amount: updates.currentAmount,
          last_reconciled: updates.lastReconciled,
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating cash register:', error);
      throw error;
    }
  };

  const deleteRegister = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cash_registers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting cash register:', error);
      throw error;
    }
  };

  const getRegister = (id: string) => {
    return cashRegisters.find(r => r.id === id);
  };

  const addTransaction = async (transaction: Omit<CashTransaction, 'id' | 'date'>) => {
    try {
      const { data, error } = await supabase
        .from('cash_transactions')
        .insert({
          cash_register_id: transaction.cashRegisterId,
          type: transaction.type,
          amount: transaction.amount,
          reference: transaction.reference,
          description: transaction.notes,
          user_id: transaction.userId,
        })
        .select()
        .single();

      if (error) throw error;

      // Update cash register amount
      const register = cashRegisters.find(r => r.id === transaction.cashRegisterId);
      if (register) {
        await updateRegister(register.id, {
          currentAmount: register.currentAmount + transaction.amount
        });
      }

      return data;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const getTransactions = (cashRegisterId: string) => {
    return transactions.filter(t => t.cashRegisterId === cashRegisterId);
  };

  const openRegister = async (id: string) => {
    await updateRegister(id, { status: 'open' });
  };

  const closeRegister = async (id: string) => {
    await updateRegister(id, { status: 'closed' });
  };

  const reconcileRegister = async (id: string, actualAmount: number) => {
    const register = getRegister(id);
    if (register) {
      const difference = actualAmount - register.currentAmount;
      
      if (difference !== 0) {
        await addTransaction({
          cashRegisterId: id,
          amount: difference,
          type: 'adjustment',
          notes: `Ajustement de rapprochement: ${difference > 0 ? '+' : ''}${difference.toLocaleString()} FCFA`,
          userId: 'current-user'
        });
      }

      await updateRegister(id, {
        status: 'open',
        lastReconciled: new Date().toISOString(),
        currentAmount: actualAmount
      });
    }
  };

  return {
    cashRegisters,
    transactions,
    loading,
    createRegister,
    updateRegister,
    deleteRegister,
    getRegister,
    addTransaction,
    getTransactions,
    openRegister,
    closeRegister,
    reconcileRegister,
    refetch: () => {
      fetchCashRegisters();
      fetchTransactions();
    },
  };
}

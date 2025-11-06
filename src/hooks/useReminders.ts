import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Reminder } from '@/lib/types';

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReminders = async () => {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedReminders: Reminder[] = (data || []).map(r => ({
        id: r.id,
        type: (r.type === 'payment' ? 'invoice' : 'quote') as 'invoice' | 'quote',
        documentId: r.related_id || '',
        documentNumber: '',
        clientId: '',
        clientName: r.title,
        amount: 0,
        status: r.status as 'pending' | 'sent' | 'completed',
        nextReminderDate: r.due_date,
        lastReminderDate: r.updated_at,
        attempts: 0,
      }));

      setReminders(mappedReminders);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const createReminder = async (reminder: Omit<Reminder, 'id' | 'attempts'>) => {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .insert({
          title: reminder.clientName,
          description: `Rappel pour ${reminder.amount}`,
          due_date: reminder.nextReminderDate,
          status: reminder.status,
          related_id: reminder.documentId,
          type: 'payment',
          priority: 'medium',
        })
        .select()
        .single();

      if (error) throw error;

      await fetchReminders();
      return data;
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  };

  const updateReminder = async (id: string, updates: Partial<Reminder>) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({
          status: updates.status,
          due_date: updates.nextReminderDate,
        })
        .eq('id', id);

      if (error) throw error;
      await fetchReminders();
    } catch (error) {
      console.error('Error updating reminder:', error);
      throw error;
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchReminders();
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  };

  const getPendingReminders = () => {
    const today = new Date().toISOString().split('T')[0];
    return reminders.filter(r => 
      r.status === 'pending' && 
      r.nextReminderDate && 
      r.nextReminderDate <= today
    );
  };

  const sendReminder = async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 7);

    await updateReminder(id, {
      attempts: reminder.attempts + 1,
      lastReminderDate: new Date().toISOString(),
      nextReminderDate: nextDate.toISOString(),
      status: reminder.attempts >= 2 ? 'completed' : 'sent',
    });
  };

  return {
    reminders,
    loading,
    createReminder,
    updateReminder,
    deleteReminder,
    getPendingReminders,
    sendReminder,
    refetch: fetchReminders,
  };
}

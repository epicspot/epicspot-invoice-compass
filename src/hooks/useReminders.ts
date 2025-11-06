import { useState, useEffect } from 'react';
import { Reminder } from '@/lib/types';

const API_URL = 'http://localhost:3001/api';

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReminders = async () => {
    try {
      const response = await fetch(`${API_URL}/reminders`);
      const data = await response.json();
      setReminders(data);
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
      const response = await fetch(`${API_URL}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_id: reminder.documentId,
          client_name: reminder.clientName,
          amount: reminder.amount,
          status: reminder.status,
          next_reminder_date: reminder.nextReminderDate,
        }),
      });
      const newReminder = await response.json();
      await fetchReminders();
      return newReminder;
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  };

  const updateReminder = async (id: string, updates: Partial<Reminder>) => {
    try {
      await fetch(`${API_URL}/reminders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: updates.status,
          attempts: updates.attempts,
          next_reminder_date: updates.nextReminderDate,
          last_reminder_date: updates.lastReminderDate,
        }),
      });
      await fetchReminders();
    } catch (error) {
      console.error('Error updating reminder:', error);
      throw error;
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      await fetch(`${API_URL}/reminders/${id}`, {
        method: 'DELETE',
      });
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

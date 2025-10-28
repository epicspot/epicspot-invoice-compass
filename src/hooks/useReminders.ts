import { useLocalStorage } from './useLocalStorage';
import { Reminder } from '@/lib/types';

export function useReminders() {
  const [reminders, setReminders] = useLocalStorage<Reminder[]>('reminders', []);

  const createReminder = (reminder: Omit<Reminder, 'id' | 'attempts'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: `rem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      attempts: 0,
    };
    setReminders([...reminders, newReminder]);
    return newReminder;
  };

  const updateReminder = (id: string, updates: Partial<Reminder>) => {
    setReminders(reminders.map(r => 
      r.id === id ? { ...r, ...updates } : r
    ));
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const getPendingReminders = () => {
    const today = new Date().toISOString().split('T')[0];
    return reminders.filter(r => 
      r.status === 'pending' && 
      r.nextReminderDate && 
      r.nextReminderDate <= today
    );
  };

  const sendReminder = (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 7); // Prochaine relance dans 7 jours

    updateReminder(id, {
      attempts: reminder.attempts + 1,
      lastReminderDate: new Date().toISOString(),
      nextReminderDate: nextDate.toISOString(),
      status: reminder.attempts >= 2 ? 'completed' : 'sent',
    });
  };

  return {
    reminders,
    createReminder,
    updateReminder,
    deleteReminder,
    getPendingReminders,
    sendReminder,
  };
}

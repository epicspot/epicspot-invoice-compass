import { useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ValidationFailure {
  timestamp: number;
  formType: string;
  errorCount: number;
}

const FAILURE_THRESHOLD = 3;
const TIME_WINDOW = 5 * 60 * 1000; // 5 minutes

export function useValidationAlert() {
  const [failures, setFailures] = useLocalStorage<ValidationFailure[]>('validation_failures', []);
  const { toast } = useToast();

  // Clean old failures outside time window
  const cleanOldFailures = useCallback(() => {
    const now = Date.now();
    setFailures(prev => prev.filter(f => now - f.timestamp < TIME_WINDOW));
  }, [setFailures]);

  useEffect(() => {
    cleanOldFailures();
  }, [cleanOldFailures]);

  const recordFailure = useCallback(async (formType: string, errorCount: number) => {
    cleanOldFailures();
    
    const newFailure: ValidationFailure = {
      timestamp: Date.now(),
      formType,
      errorCount
    };

    setFailures(prev => [...prev, newFailure]);

    // Check if threshold is reached
    const recentFailures = [...failures, newFailure];
    const failureCount = recentFailures.filter(f => f.formType === formType).length;

    if (failureCount >= FAILURE_THRESHOLD) {
      // Send alert notification
      await sendAlert(formType, failureCount, errorCount);
      
      // Show toast to user
      toast({
        title: "⚠️ Échecs de validation répétés",
        description: `Vous avez ${failureCount} tentatives échouées sur ce formulaire. Un administrateur a été notifié.`,
        variant: "destructive",
      });

      // Clear failures for this form
      setFailures(prev => prev.filter(f => f.formType !== formType));
    }
  }, [failures, setFailures, cleanOldFailures, toast]);

  const sendAlert = async (formType: string, failureCount: number, errorCount: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Get admin users
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (!adminRoles || adminRoles.length === 0) return;

      // Create notifications for all admins
      const notifications = adminRoles.map(admin => ({
        user_id: admin.user_id,
        type: 'validation_alert',
        title: 'Alerte: Échecs de validation répétés',
        message: `L'utilisateur ${user.email} a échoué ${failureCount} fois la validation du formulaire "${formType}" (${errorCount} erreurs)`,
        data: {
          user_email: user.email,
          user_id: user.id,
          form_type: formType,
          failure_count: failureCount,
          error_count: errorCount,
          timestamp: new Date().toISOString()
        }
      }));

      await supabase.from('push_notifications').insert(notifications);
    } catch (error) {
      console.error('Error sending validation alert:', error);
    }
  };

  const clearFailures = useCallback(() => {
    setFailures([]);
  }, [setFailures]);

  return {
    recordFailure,
    clearFailures,
    failureCount: failures.length
  };
}

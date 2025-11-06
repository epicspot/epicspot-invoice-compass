import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'PRINT' | 'SIGN';

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: AuditAction;
  table_name: string;
  record_id: string | null;
  old_values: any;
  new_values: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  description: string | null;
}

export function useAuditLog() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('audit_log_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_log'
        },
        (payload) => {
          setLogs(prev => [payload.new as AuditLog, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLogs = async (filters?: {
    userId?: string;
    tableName?: string;
    action?: AuditAction;
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      let query = supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters?.tableName) {
        query = query.eq('table_name', filters.tableName);
      }
      if (filters?.action) {
        query = query.eq('action', filters.action);
      }
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const logAction = async (
    action: AuditAction,
    tableName: string,
    recordId?: string,
    oldValues?: any,
    newValues?: any,
    description?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('audit_log').insert({
        user_id: user?.id,
        user_email: user?.email,
        action,
        table_name: tableName,
        record_id: recordId,
        old_values: oldValues,
        new_values: newValues,
        description
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging action:', error);
      throw error;
    }
  };

  return {
    logs,
    loading,
    fetchLogs,
    logAction
  };
}

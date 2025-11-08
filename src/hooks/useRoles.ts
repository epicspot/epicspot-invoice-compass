import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRetry } from './useRetry';
import { useErrorHandler } from './useErrorHandler';

export type AppRole = 'admin' | 'manager' | 'user' | 'viewer';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  created_by: string | null;
}

export function useRoles(userId?: string) {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { executeWithRetry } = useRetry('fetchRoles');
  const { handleError } = useErrorHandler();

  useEffect(() => {
    fetchRoles();
    checkAdmin();
  }, [userId]);

  const fetchRoles = async () => {
    try {
      const data = await executeWithRetry(async () => {
        let query = supabase.from('user_roles').select('*');
        
        if (userId) {
          query = query.eq('user_id', userId);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        return data || [];
      }, {
        maxAttempts: 3,
        onRetry: (attempt, error) => {
          console.log(`Retry fetching roles (attempt ${attempt}):`, error);
        },
      });

      setRoles(data);
    } catch (error) {
      handleError(error, {
        severity: 'warning',
        title: 'Erreur de chargement des rôles',
      });
    } finally {
      setLoading(false);
    }
  };

  const checkAdmin = async () => {
    try {
      const isAdminRole = await executeWithRetry(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return false;
        }

        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;
        return !!data;
      }, {
        maxAttempts: 2,
        retryableErrors: [], // Don't retry admin check on PGRST116
      });

      setIsAdmin(isAdminRole);
    } catch (error) {
      handleError(error, {
        severity: 'warning',
        title: 'Erreur de vérification admin',
        logToConsole: true,
      });
      setIsAdmin(false);
    }
  };

  const assignRole = async (userId: string, role: AppRole) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('user_roles').insert({
        user_id: userId,
        role,
        created_by: user?.id
      });

      if (error) throw error;
      await fetchRoles();
    } catch (error) {
      console.error('Error assigning role:', error);
      throw error;
    }
  };

  const removeRole = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;
      await fetchRoles();
    } catch (error) {
      console.error('Error removing role:', error);
      throw error;
    }
  };

  const hasRole = (role: AppRole): boolean => {
    return roles.some(r => r.role === role);
  };

  return {
    roles,
    loading,
    isAdmin,
    assignRole,
    removeRole,
    hasRole,
    refetch: fetchRoles
  };
}

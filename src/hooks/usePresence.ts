import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserPresence {
  user_id: string;
  status: string;
  current_page: string;
  last_seen: string;
}

export function usePresence() {
  const { user } = useAuth();
  const location = useLocation();
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);

  useEffect(() => {
    if (!user) return;

    // Update presence on mount and when route changes
    const updatePresence = async () => {
      const { error } = await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          status: 'online',
          current_page: location.pathname,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) console.error('Error updating presence:', error);
    };

    updatePresence();

    // Update presence every 30 seconds
    const interval = setInterval(updatePresence, 30000);

    // Update status to offline on unmount
    return () => {
      clearInterval(interval);
      supabase
        .from('user_presence')
        .update({
          status: 'offline',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .then();
    };
  }, [user, location.pathname]);

  useEffect(() => {
    if (!user) return;

    // Subscribe to presence changes
    const channel = supabase
      .channel('user-presence-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
        },
        async (payload) => {
          console.log('Presence change:', payload);
          // Refetch active users
          const { data } = await supabase
            .from('user_presence')
            .select('*')
            .eq('status', 'online')
            .gte('last_seen', new Date(Date.now() - 60000).toISOString());

          if (data) setActiveUsers(data);
        }
      )
      .subscribe();

    // Initial fetch
    supabase
      .from('user_presence')
      .select('*')
      .eq('status', 'online')
      .gte('last_seen', new Date(Date.now() - 60000).toISOString())
      .then(({ data }) => {
        if (data) setActiveUsers(data);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { activeUsers };
}

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Site } from '@/lib/types';

export function useSites() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSites = async () => {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .order('name');

      if (error) throw error;

      const mappedSites: Site[] = (data || []).map(s => ({
        id: s.id,
        name: s.name,
        address: s.address || '',
        phone: s.phone || undefined,
        email: s.email || undefined,
        isMainSite: false, // Can be extended later
      }));

      setSites(mappedSites);
    } catch (error) {
      console.error('Error fetching sites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  return {
    sites,
    loading,
    refetch: fetchSites,
  };
}

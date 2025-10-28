import { useLocalStorage } from './useLocalStorage';
import { Lead } from '@/lib/types';

export function useLeads() {
  const [leads, setLeads] = useLocalStorage<Lead[]>('leads', []);

  const createLead = (lead: Omit<Lead, 'id' | 'createdAt'>) => {
    const newLead: Lead = {
      ...lead,
      id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    setLeads([...leads, newLead]);
    return newLead;
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(leads.map(l => 
      l.id === id ? { ...l, ...updates } : l
    ));
  };

  const deleteLead = (id: string) => {
    setLeads(leads.filter(l => l.id !== id));
  };

  const getLead = (id: string) => {
    return leads.find(l => l.id === id);
  };

  const convertLeadToClient = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return null;
    
    return {
      name: lead.name,
      address: lead.address || '',
      phone: lead.phone,
      email: lead.email,
      code: `CLI${Date.now().toString().slice(-6)}`,
    };
  };

  return {
    leads,
    createLead,
    updateLead,
    deleteLead,
    getLead,
    convertLeadToClient,
  };
}

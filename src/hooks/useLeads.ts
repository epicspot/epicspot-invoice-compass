import { useState, useEffect } from 'react';
import { Lead } from '@/lib/types';

const API_URL = 'http://localhost:3001/api';

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      const response = await fetch(`${API_URL}/leads`);
      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const createLead = async (lead: Omit<Lead, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });
      const newLead = await response.json();
      await fetchLeads();
      return newLead;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      await fetch(`${API_URL}/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      await fetchLeads();
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  };

  const deleteLead = async (id: string) => {
    try {
      await fetch(`${API_URL}/leads/${id}`, {
        method: 'DELETE',
      });
      await fetchLeads();
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
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
    loading,
    createLead,
    updateLead,
    deleteLead,
    getLead,
    convertLeadToClient,
    refetch: fetchLeads,
  };
}

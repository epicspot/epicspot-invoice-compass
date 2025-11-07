import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Subscription {
  id: string;
  clientId: string;
  client?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  serviceName: string;
  serviceType: string;
  monthlyAmount: number;
  billingDay: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'suspended' | 'cancelled';
  lastBillingDate?: string;
  nextBillingDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          client:clients(id, name, phone, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = (data || []).map((sub: any) => ({
        id: sub.id,
        clientId: sub.client_id,
        client: sub.client,
        serviceName: sub.service_name,
        serviceType: sub.service_type,
        monthlyAmount: parseFloat(sub.monthly_amount),
        billingDay: sub.billing_day,
        startDate: sub.start_date,
        endDate: sub.end_date,
        status: sub.status,
        lastBillingDate: sub.last_billing_date,
        nextBillingDate: sub.next_billing_date,
        notes: sub.notes,
        createdAt: sub.created_at,
        updatedAt: sub.updated_at,
      }));

      setSubscriptions(formattedData);
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les abonnements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const createSubscription = async (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          client_id: subscription.clientId,
          service_name: subscription.serviceName,
          service_type: subscription.serviceType,
          monthly_amount: subscription.monthlyAmount,
          billing_day: subscription.billingDay,
          start_date: subscription.startDate,
          end_date: subscription.endDate,
          status: subscription.status,
          notes: subscription.notes,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchSubscriptions();
      return data;
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'abonnement",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateSubscription = async (id: string, updates: Partial<Subscription>) => {
    try {
      const updateData: any = {};
      
      if (updates.clientId) updateData.client_id = updates.clientId;
      if (updates.serviceName) updateData.service_name = updates.serviceName;
      if (updates.serviceType) updateData.service_type = updates.serviceType;
      if (updates.monthlyAmount !== undefined) updateData.monthly_amount = updates.monthlyAmount;
      if (updates.billingDay) updateData.billing_day = updates.billingDay;
      if (updates.startDate) updateData.start_date = updates.startDate;
      if (updates.endDate !== undefined) updateData.end_date = updates.endDate;
      if (updates.status) updateData.status = updates.status;
      if (updates.notes !== undefined) updateData.notes = updates.notes;

      const { error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      await fetchSubscriptions();
    } catch (error: any) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'abonnement",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteSubscription = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchSubscriptions();
    } catch (error: any) {
      console.error('Error deleting subscription:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'abonnement",
        variant: "destructive",
      });
      throw error;
    }
  };

  const suspendSubscription = async (id: string) => {
    await updateSubscription(id, { status: 'suspended' });
  };

  const reactivateSubscription = async (id: string) => {
    await updateSubscription(id, { status: 'active' });
  };

  const cancelSubscription = async (id: string) => {
    await updateSubscription(id, { status: 'cancelled', endDate: new Date().toISOString() });
  };

  return {
    subscriptions,
    loading,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    suspendSubscription,
    reactivateSubscription,
    cancelSubscription,
    refetch: fetchSubscriptions,
  };
};
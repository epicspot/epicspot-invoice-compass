
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useDatabase } from '@/lib/contexts/DatabaseContext';
import { Invoice, Quote } from '@/lib/types';
import RecentInvoicesTable from '@/components/dashboard/RecentInvoicesTable';
import RecentQuotesTable from '@/components/dashboard/RecentQuotesTable';

const RecentActivity = () => {
  const [recentInvoices, setRecentInvoices] = useState<Partial<Invoice>[]>([]);
  const [recentQuotes, setRecentQuotes] = useState<Partial<Quote>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { db, isInitialized } = useDatabase();
  const { toast } = useToast();

  useEffect(() => {
    if (isInitialized) {
      const loadRecentActivity = async () => {
        try {
          setIsLoading(true);
          
          // Get recent invoices
          const allInvoices = await db.invoices.getAll();
          const sortedInvoices = allInvoices
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);
          setRecentInvoices(sortedInvoices);
          
          // Get recent quotes
          const allQuotes = await db.quotes.getAll();
          const sortedQuotes = allQuotes
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);
          setRecentQuotes(sortedQuotes);
          
        } catch (error) {
          console.error("Error loading recent activity:", error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les activités récentes.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      loadRecentActivity();
    }
  }, [isInitialized, db, toast]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <RecentInvoicesTable invoices={recentInvoices} isLoading={isLoading} />
      <RecentQuotesTable quotes={recentQuotes} isLoading={isLoading} />
    </div>
  );
};

export default RecentActivity;


import React, { useState, useEffect } from 'react';
import { useDatabase } from '@/lib/contexts/DatabaseContext';
import { useToast } from "@/hooks/use-toast";
import { Invoice, Quote } from '@/lib/types';
import StatsCards from '@/components/dashboard/StatsCards';
import RecentInvoicesTable from '@/components/dashboard/RecentInvoicesTable';
import RecentQuotesTable from '@/components/dashboard/RecentQuotesTable';

const Dashboard = () => {
  const [recentInvoices, setRecentInvoices] = useState<Partial<Invoice>[]>([]);
  const [recentQuotes, setRecentQuotes] = useState<Partial<Quote>[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalInvoices: 0,
    totalQuotes: 0,
    totalClients: 0,
    totalProducts: 0,
    monthlyInvoices: 0,
    monthlyQuotes: 0,
    newClients: 0
  });
  
  const { db, isInitialized } = useDatabase();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isInitialized) {
      const loadData = async () => {
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
          
          // Calculate statistics
          const clients = await db.clients.getAll();
          const products = await db.products.getAll();
          
          // Get data for current month
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          
          const monthlyInvoices = allInvoices.filter(invoice => 
            new Date(invoice.date) >= startOfMonth
          );
          
          const monthlyQuotes = allQuotes.filter(quote => 
            new Date(quote.date) >= startOfMonth
          );
          
          setDashboardStats({
            totalInvoices: allInvoices.reduce((sum, invoice) => sum + invoice.total, 0),
            totalQuotes: allQuotes.reduce((sum, quote) => sum + quote.total, 0),
            totalClients: clients.length,
            totalProducts: products.length,
            monthlyInvoices: monthlyInvoices.length,
            monthlyQuotes: monthlyQuotes.length,
            newClients: 0 // This would require additional logic to track new clients
          });
          
        } catch (error) {
          console.error("Error loading dashboard data:", error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les données du tableau de bord.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      loadData();
    }
  }, [isInitialized, db, toast]);

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} FCFA`;
  };

  if (!isInitialized || isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-full">
        <p className="text-lg text-muted-foreground">Chargement du tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground">{currentDate}</p>
        </div>
      </div>

      <StatsCards 
        dashboardStats={dashboardStats} 
        formatCurrency={formatCurrency} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentInvoicesTable invoices={recentInvoices} />
        <RecentQuotesTable quotes={recentQuotes} />
      </div>
    </div>
  );
};

export default Dashboard;

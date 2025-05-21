
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useDatabase } from '@/lib/contexts/DatabaseContext';
import { Invoice, Quote } from '@/lib/types';
import StatsCards from '@/components/dashboard/StatsCards';

interface DashboardStatsProps {
  formatCurrency: (amount: number) => string;
}

const DashboardStats = ({ formatCurrency }: DashboardStatsProps) => {
  const [dashboardStats, setDashboardStats] = useState({
    totalInvoices: 0,
    totalQuotes: 0,
    totalClients: 0,
    totalProducts: 0,
    monthlyInvoices: 0,
    monthlyQuotes: 0,
    newClients: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { db, isInitialized } = useDatabase();
  const { toast } = useToast();

  useEffect(() => {
    if (isInitialized) {
      const loadStats = async () => {
        try {
          setIsLoading(true);
          
          // Get all data needed for statistics
          const allInvoices = await db.invoices.getAll();
          const allQuotes = await db.quotes.getAll();
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
          console.error("Error loading dashboard statistics:", error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les statistiques du tableau de bord.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      loadStats();
    }
  }, [isInitialized, db, toast]);

  return (
    <StatsCards 
      dashboardStats={dashboardStats} 
      formatCurrency={formatCurrency} 
      isLoading={isLoading}
    />
  );
};

export default DashboardStats;

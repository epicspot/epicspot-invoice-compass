
import React, { useState, useEffect } from 'react';
import { FileText, FileCheck, Users, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardCard from '@/components/DashboardCard';
import DataTable from '@/components/DataTable';
import { Invoice, Quote } from '@/lib/types';
import { useDatabase } from '@/lib/contexts/DatabaseContext';
import { useToast } from "@/hooks/use-toast";

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
          
          // Calculate new clients this month
          // For simplicity, we'll just show the total clients for now
          
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

  const invoiceColumns = [
    { key: 'number', header: 'Numéro' },
    { key: 'date', header: 'Date' },
    { 
      key: 'client', 
      header: 'Client',
      cell: (item: Partial<Invoice>) => item.client?.name
    },
    { 
      key: 'total', 
      header: 'Total',
      cell: (item: Partial<Invoice>) => `${(item.total || 0).toLocaleString()} FCFA`
    },
    { 
      key: 'status', 
      header: 'Statut',
      cell: (item: Partial<Invoice>) => {
        const statusClasses = {
          draft: 'bg-gray-200 text-gray-800',
          sent: 'bg-blue-100 text-blue-800',
          paid: 'bg-green-100 text-green-800',
          overdue: 'bg-red-100 text-red-800',
        };
        
        const statusLabels = {
          draft: 'Brouillon',
          sent: 'Envoyée',
          paid: 'Payée',
          overdue: 'En retard',
        };
        
        return (
          <span className={`${statusClasses[item.status || 'draft']} px-2 py-1 rounded-full text-xs font-medium`}>
            {statusLabels[item.status || 'draft']}
          </span>
        );
      }
    },
  ];

  const quoteColumns = [
    { key: 'number', header: 'Numéro' },
    { key: 'date', header: 'Date' },
    { 
      key: 'client', 
      header: 'Client',
      cell: (item: Partial<Quote>) => item.client?.name
    },
    { 
      key: 'total', 
      header: 'Total',
      cell: (item: Partial<Quote>) => `${(item.total || 0).toLocaleString()} FCFA`
    },
    { 
      key: 'status', 
      header: 'Statut',
      cell: (item: Partial<Quote>) => {
        const statusClasses = {
          draft: 'bg-gray-200 text-gray-800',
          sent: 'bg-blue-100 text-blue-800',
          accepted: 'bg-green-100 text-green-800',
          rejected: 'bg-red-100 text-red-800',
        };
        
        const statusLabels = {
          draft: 'Brouillon',
          sent: 'Envoyé',
          accepted: 'Accepté',
          rejected: 'Refusé',
        };
        
        return (
          <span className={`${statusClasses[item.status || 'draft']} px-2 py-1 rounded-full text-xs font-medium`}>
            {statusLabels[item.status || 'draft']}
          </span>
        );
      }
    },
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Total factures" 
          value={formatCurrency(dashboardStats.totalInvoices)} 
          description={`${dashboardStats.monthlyInvoices} factures émises ce mois`}
          icon={<FileText />}
          trend={{ value: dashboardStats.monthlyInvoices > 0 ? 12 : 0, isPositive: dashboardStats.monthlyInvoices > 0 }}
        />
        <DashboardCard 
          title="Total devis" 
          value={formatCurrency(dashboardStats.totalQuotes)} 
          description={`${dashboardStats.monthlyQuotes} devis émis ce mois`}
          icon={<FileCheck />}
          trend={{ value: dashboardStats.monthlyQuotes > 0 ? 5 : 0, isPositive: dashboardStats.monthlyQuotes > 0 }}
        />
        <DashboardCard 
          title="Clients actifs" 
          value={dashboardStats.totalClients.toString()} 
          description="Clients enregistrés"
          icon={<Users />}
          trend={{ value: dashboardStats.newClients, isPositive: true }}
        />
        <DashboardCard 
          title="Produits/Services" 
          value={dashboardStats.totalProducts.toString()} 
          description="Catalogue de produits et services"
          icon={<Package />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Factures récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable 
              data={recentInvoices} 
              columns={invoiceColumns}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Devis récents</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable 
              data={recentQuotes}
              columns={quoteColumns}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

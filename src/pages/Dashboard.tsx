
import React from 'react';
import { FileText, FileCheck, Users, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardCard from '@/components/DashboardCard';
import DataTable from '@/components/DataTable';
import { Invoice, Quote } from '@/lib/types';
import { useInvoices } from '@/hooks/useInvoices';
import { useQuotes } from '@/hooks/useQuotes';
import { useClients } from '@/hooks/useClients';
import { useProducts } from '@/hooks/useProducts';

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

const Dashboard = () => {
  const { invoices } = useInvoices();
  const { quotes } = useQuotes();
  const { clients } = useClients();
  const { products } = useProducts();
  
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  
  const recentInvoices = invoices.slice(0, 3);
  const recentQuotes = quotes.slice(0, 3);
  
  const totalInvoices = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalQuotes = quotes.reduce((sum, q) => sum + (q.total || 0), 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyInvoices = invoices.filter(inv => {
    const invDate = new Date(inv.date);
    return invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear;
  });
  const monthlyClients = clients.filter(c => {
    if (!c.id) return false;
    const createdAt = new Date(parseInt(c.id.split('_')[1]) || 0);
    return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground">{currentDate}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total factures</p>
                <h3 className="text-2xl font-bold text-primary mt-2">{totalInvoices.toLocaleString()} FCFA</h3>
                <p className="text-xs text-muted-foreground mt-1">{monthlyInvoices.length} factures ce mois</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border-accent/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total devis</p>
                <h3 className="text-2xl font-bold text-accent mt-2">{totalQuotes.toLocaleString()} FCFA</h3>
                <p className="text-xs text-muted-foreground mt-1">{quotes.length} devis émis</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <FileCheck className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-success/10 via-success/5 to-transparent border-success/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clients actifs</p>
                <h3 className="text-2xl font-bold text-success mt-2">{clients.length}</h3>
                <p className="text-xs text-muted-foreground mt-1">{monthlyClients.length} nouveaux ce mois</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-info/10 via-info/5 to-transparent border-info/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Produits/Services</p>
                <h3 className="text-2xl font-bold text-info mt-2">{products.length}</h3>
                <p className="text-xs text-muted-foreground mt-1">Catalogue de produits et services</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-info/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
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
              searchable={false}
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
              searchable={false} 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

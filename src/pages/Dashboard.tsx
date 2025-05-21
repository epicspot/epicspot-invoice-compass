
import React from 'react';
import { FileText, FileCheck, Users, Package, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardCard from '@/components/DashboardCard';
import DataTable from '@/components/DataTable';
import { Invoice, Quote } from '@/lib/types';

// Mock data for dashboard
const mockRecentInvoices: Partial<Invoice>[] = [
  { id: '1', number: 'FACT-001', date: '2025-05-01', client: { id: '1', name: 'Societe ABC', address: '', phone: '' }, total: 2500000, status: 'paid' },
  { id: '2', number: 'FACT-002', date: '2025-05-02', client: { id: '2', name: 'Client XYZ', address: '', phone: '' }, total: 850000, status: 'sent' },
  { id: '3', number: 'FACT-003', date: '2025-05-04', client: { id: '3', name: 'Entreprise DEF', address: '', phone: '' }, total: 1200000, status: 'draft' },
];

const mockRecentQuotes: Partial<Quote>[] = [
  { id: '1', number: 'DEVIS-001', date: '2025-05-01', client: { id: '1', name: 'Societe ABC', address: '', phone: '' }, total: 3000000, status: 'accepted' },
  { id: '2', number: 'DEVIS-002', date: '2025-05-03', client: { id: '2', name: 'Client XYZ', address: '', phone: '' }, total: 1750000, status: 'sent' },
];

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
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
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
        <DashboardCard 
          title="Total factures" 
          value="4.550.000 FCFA" 
          description="7 factures émises ce mois"
          icon={<FileText />}
          trend={{ value: 12, isPositive: true }}
        />
        <DashboardCard 
          title="Total devis" 
          value="7.250.000 FCFA" 
          description="5 devis émis ce mois"
          icon={<FileCheck />}
          trend={{ value: 5, isPositive: true }}
        />
        <DashboardCard 
          title="Clients actifs" 
          value="12" 
          description="3 nouveaux clients ce mois"
          icon={<Users />}
          trend={{ value: 15, isPositive: true }}
        />
        <DashboardCard 
          title="Produits/Services" 
          value="24" 
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
              data={mockRecentInvoices} 
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
              data={mockRecentQuotes} 
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

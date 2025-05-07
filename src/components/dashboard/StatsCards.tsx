
import React from 'react';
import { FileText, FileCheck, Users, Package } from 'lucide-react';
import DashboardCard from '@/components/DashboardCard';

interface StatsCardsProps {
  dashboardStats: {
    totalInvoices: number;
    totalQuotes: number;
    totalClients: number;
    totalProducts: number;
    monthlyInvoices: number;
    monthlyQuotes: number;
    newClients: number;
  };
  formatCurrency: (amount: number) => string;
}

const StatsCards = ({ dashboardStats, formatCurrency }: StatsCardsProps) => {
  return (
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
  );
};

export default StatsCards;

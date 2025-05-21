
import React from 'react';
import { FileText, FileCheck, Users, Package } from 'lucide-react';
import DashboardCard from '@/components/DashboardCard';
import { Skeleton } from "@/components/ui/skeleton";

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
  isLoading?: boolean;
}

const StatsCards = ({ dashboardStats, formatCurrency, isLoading = false }: StatsCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border bg-card shadow-sm p-6">
            <div className="flex items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <Skeleton className="h-8 w-36 mt-4" />
            <Skeleton className="h-3 w-28 mt-2" />
          </div>
        ))}
      </div>
    );
  }

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

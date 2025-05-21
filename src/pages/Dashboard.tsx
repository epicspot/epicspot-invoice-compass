
import React from 'react';
import DashboardStats from '@/components/dashboard/DashboardStats';
import RecentActivity from '@/components/dashboard/RecentActivity';

const Dashboard = () => {
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} FCFA`;
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Tableau de bord</h1>
          <p className="text-muted-foreground">{currentDate}</p>
        </div>
      </div>

      <DashboardStats formatCurrency={formatCurrency} />
      
      <RecentActivity />
    </div>
  );
};

export default Dashboard;

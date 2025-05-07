
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataTable from '@/components/DataTable';
import { Invoice } from '@/lib/types';

interface RecentInvoicesTableProps {
  invoices: Partial<Invoice>[];
}

const RecentInvoicesTable = ({ invoices }: RecentInvoicesTableProps) => {
  const columns = [
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Factures récentes</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable 
          data={invoices} 
          columns={columns}
        />
      </CardContent>
    </Card>
  );
};

export default RecentInvoicesTable;

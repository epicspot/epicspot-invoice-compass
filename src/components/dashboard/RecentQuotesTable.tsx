
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataTable from '@/components/DataTable';
import { Quote } from '@/lib/types';

interface RecentQuotesTableProps {
  quotes: Partial<Quote>[];
  isLoading?: boolean;
}

const RecentQuotesTable = ({ quotes, isLoading = false }: RecentQuotesTableProps) => {
  const columns = [
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
          draft: 'bg-gray-100 text-gray-800',
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
  
  return (
    <Card className="shadow-sm border border-gray-200">
      <CardHeader className="bg-gray-50 border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-800">Devis récents</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable 
          data={quotes}
          columns={columns}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
};

export default RecentQuotesTable;

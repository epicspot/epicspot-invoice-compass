
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/DataTable';
import { Invoice } from '@/lib/types';
import { Plus, FileText, Edit, Trash, Printer } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import InvoiceForm from '@/components/InvoiceForm';
import { toast } from "@/hooks/use-toast";
import { useInvoices } from '@/hooks/useInvoices';

const columns = [
  { key: 'number', header: 'Numéro' },
  { 
    key: 'date', 
    header: 'Date',
    cell: (item: Partial<Invoice>) => new Date(item.date || '').toLocaleDateString('fr-FR')
  },
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

const Invoices = () => {
  const { invoices, createInvoice, updateInvoice, deleteInvoice } = useInvoices();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  
  const handleCreateInvoice = (invoiceData: Partial<Invoice>) => {
    const newInvoice = createInvoice({
      ...invoiceData,
      siteId: 'default',
    } as Omit<Invoice, 'id'>);
    
    setIsCreating(false);
    
    toast({
      title: "Facture créée",
      description: `La facture ${newInvoice.number} a été créée avec succès.`,
    });
  };
  
  const handleEditInvoice = (invoiceData: Partial<Invoice>) => {
    if (invoiceData.id) {
      updateInvoice(invoiceData.id, invoiceData);
      setIsEditing(null);
      
      toast({
        title: "Facture modifiée",
        description: `La facture ${invoiceData.number} a été modifiée avec succès.`,
      });
    }
  };
  
  const handleDeleteInvoice = (id: string) => {
    const invoiceToDelete = invoices.find(inv => inv.id === id);
    deleteInvoice(id);
    
    toast({
      title: "Facture supprimée",
      description: `La facture ${invoiceToDelete?.number} a été supprimée.`,
      variant: "destructive",
    });
  };
  
  const actions = (invoice: Partial<Invoice>) => (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <span className="sr-only">Actions</span>
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
            >
              <path
                d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                fill="currentColor"
              />
            </svg>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setIsEditing(invoice.id || null)}
          >
            <Edit className="h-4 w-4" /> Modifier
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
          >
            <Printer className="h-4 w-4" /> Imprimer
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 text-red-600 cursor-pointer"
            onClick={() => invoice.id && handleDeleteInvoice(invoice.id)}
          >
            <Trash className="h-4 w-4" /> Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
  
  if (isCreating) {
    return (
      <div className="p-6">
        <InvoiceForm onSubmit={handleCreateInvoice} />
      </div>
    );
  }
  
  if (isEditing) {
    const invoiceToEdit = invoices.find(inv => inv.id === isEditing);
    
    return (
      <div className="p-6">
        <InvoiceForm 
          initialInvoice={invoiceToEdit} 
          onSubmit={handleEditInvoice} 
        />
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Factures
        </h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" /> Nouvelle facture
        </Button>
      </div>
      
      <DataTable 
        data={invoices} 
        columns={columns} 
        actions={actions}
      />
    </div>
  );
};

export default Invoices;

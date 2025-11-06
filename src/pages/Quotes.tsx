
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/DataTable';
import { Quote } from '@/lib/types';
import { Plus, FileCheck, Edit, Trash, Printer, FileText } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import QuoteForm from '@/components/QuoteForm';
import { toast } from "@/hooks/use-toast";
import { useQuotes } from '@/hooks/useQuotes';
import { useInvoices } from '@/hooks/useInvoices';

const columns = [
  { key: 'number', header: 'Numéro' },
  { 
    key: 'date', 
    header: 'Date',
    cell: (item: Partial<Quote>) => new Date(item.date || '').toLocaleDateString('fr-FR')
  },
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

const Quotes = () => {
  const { quotes, createQuote, updateQuote, deleteQuote } = useQuotes();
  const { createInvoice } = useInvoices();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  
  const handleCreateQuote = async (quoteData: Partial<Quote>) => {
    const newQuote = await createQuote({
      ...quoteData,
      siteId: 'default',
    } as Omit<Quote, 'id' | 'number'>);
    
    setIsCreating(false);
    
    toast({
      title: "Devis créé",
      description: `Le devis ${newQuote.number} a été créé avec succès.`,
    });
  };
  
  const handleEditQuote = (quoteData: Partial<Quote>) => {
    if (quoteData.id) {
      updateQuote(quoteData.id, quoteData);
      setIsEditing(null);
      
      toast({
        title: "Devis modifié",
        description: `Le devis ${quoteData.number} a été modifié avec succès.`,
      });
    }
  };
  
  const handleDeleteQuote = (id: string) => {
    const quoteToDelete = quotes.find(q => q.id === id);
    deleteQuote(id);
    
    toast({
      title: "Devis supprimé",
      description: `Le devis ${quoteToDelete?.number} a été supprimé.`,
      variant: "destructive",
    });
  };
  
  const handleConvertToInvoice = async (quote: Quote) => {
    const invoice = await createInvoice({
      date: new Date().toISOString().split('T')[0],
      client: quote.client,
      items: quote.items,
      subtotal: quote.subtotal,
      tax: 0,
      discount: quote.discount,
      total: quote.total,
      notes: `Converti du devis ${quote.number}${quote.notes ? '\n' + quote.notes : ''}`,
      status: 'sent',
      siteId: quote.siteId
    });

    // Marquer le devis comme accepté
    await updateQuote(quote.id, { status: 'accepted' });

    toast({
      title: "Devis converti en facture",
      description: `Le devis ${quote.number} a été converti en facture ${invoice.number} et marqué comme envoyée.`,
    });
  };
  
  const actions = (quote: Partial<Quote>) => (
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
          {(quote.status === 'sent' || quote.status === 'accepted') && (
            <>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer text-green-600"
                onClick={() => handleConvertToInvoice(quote as Quote)}
              >
                <FileText className="h-4 w-4" /> Convertir en facture
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setIsEditing(quote.id || null)}
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
            onClick={() => quote.id && handleDeleteQuote(quote.id)}
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
        <QuoteForm onSubmit={handleCreateQuote} />
      </div>
    );
  }
  
  if (isEditing) {
    const quoteToEdit = quotes.find(q => q.id === isEditing);
    
    return (
      <div className="p-6">
        <QuoteForm 
          initialQuote={quoteToEdit} 
          onSubmit={handleEditQuote} 
        />
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileCheck className="h-5 w-5" />
          Devis
        </h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" /> Nouveau devis
        </Button>
      </div>
      
      <DataTable 
        data={quotes} 
        columns={columns} 
        actions={actions}
      />
    </div>
  );
};

export default Quotes;

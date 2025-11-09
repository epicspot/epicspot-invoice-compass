
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import DataTable from '@/components/DataTable';
import { Invoice } from '@/lib/types';
import { Plus, FileText, Edit, Trash, Printer, DollarSign, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import InvoiceForm from '@/components/InvoiceForm';
import PaymentDialog from '@/components/PaymentDialog';
import { toast } from "@/hooks/use-toast";
import { useInvoices } from '@/hooks/useInvoices';
import { useCashRegisters } from '@/hooks/useCashRegisters';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { generateReceiptFromInvoice } from '@/lib/utils/receiptUtils';
import { generateInvoicePDF } from '@/lib/utils/invoicePdfUtils';

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
  const { addTransaction } = useCashRegisters();
  const { companyInfo } = useCompanyInfo();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());
  const [isPrintingBatch, setIsPrintingBatch] = useState(false);
  
  const handleCreateInvoice = async (invoiceData: Partial<Invoice>) => {
    const newInvoice = await createInvoice({
      ...invoiceData,
      siteId: 'default',
    } as Omit<Invoice, 'id' | 'number'>);
    
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
  
  const validateInvoiceForPayment = (invoice: Invoice): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Vérifier le client
    if (!invoice.client && !invoice.clientId) {
      errors.push("La facture n'a pas de client associé");
    } else if (invoice.client && !invoice.client.name) {
      errors.push("Le client de la facture n'a pas de nom");
    }

    // Vérifier les produits/articles
    if (!invoice.items || invoice.items.length === 0) {
      errors.push("La facture ne contient aucun article");
    } else {
      // Vérifier que chaque article a les données nécessaires
      invoice.items.forEach((item, index) => {
        if (!item.product) {
          errors.push(`L'article ${index + 1} n'a pas de produit associé`);
        } else {
          if (!item.product.description && !item.product.reference) {
            errors.push(`L'article ${index + 1} n'a ni description ni référence`);
          }
          if (item.product.price === undefined || item.product.price === null) {
            errors.push(`L'article ${index + 1} n'a pas de prix défini`);
          }
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`L'article ${index + 1} n'a pas de quantité valide`);
        }
        if (item.amount === undefined || item.amount === null || item.amount < 0) {
          errors.push(`L'article ${index + 1} n'a pas de montant valide`);
        }
      });
    }

    // Vérifier les montants
    if (invoice.total === undefined || invoice.total === null || invoice.total <= 0) {
      errors.push("La facture n'a pas de montant total valide");
    }

    // Vérifier le numéro de facture
    if (!invoice.number) {
      errors.push("La facture n'a pas de numéro");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handlePayment = (paymentData: any) => {
    if (!paymentInvoice) return;

    try {
      // Préparer les notes de paiement
      let paymentNotes = `Paiement ${
        paymentData.method === 'cash' ? 'espèces' : 
        paymentData.method === 'card' ? 'carte bancaire' : 
        'chèque'
      }`;
      
      if (paymentData.method === 'card') {
        paymentNotes += ` - Transaction: ${paymentData.cardTransactionNumber}`;
        if (paymentData.cardTerminal) paymentNotes += ` - Terminal: ${paymentData.cardTerminal}`;
      }
      
      if (paymentData.method === 'check') {
        paymentNotes += ` - Chèque N°${paymentData.checkNumber} - Banque: ${paymentData.checkBank} - Date: ${new Date(paymentData.checkDate).toLocaleDateString('fr-FR')}`;
      }

      if (paymentData.notes) {
        paymentNotes += ` - ${paymentData.notes}`;
      }

      // Mettre à jour la facture
      updateInvoice(paymentInvoice.id, {
        status: 'paid',
        notes: `${paymentInvoice.notes || ''}\n${paymentNotes}`.trim()
      });

      // Enregistrer la transaction en caisse
      if (paymentInvoice.cashRegisterId) {
        addTransaction({
          cashRegisterId: paymentInvoice.cashRegisterId,
          amount: paymentInvoice.total,
          type: 'sale',
          reference: paymentInvoice.number,
          userId: 'current-user',
          notes: paymentNotes
        });
      }

      // Générer la quittance si demandé
      let receiptGenerated = false;
      if (paymentData.generateReceipt) {
        try {
          generateReceiptFromInvoice(paymentInvoice, paymentData, companyInfo);
          receiptGenerated = true;
        } catch (error) {
          console.error('Erreur lors de la génération de la quittance:', error);
          toast({
            title: "Avertissement",
            description: "Le paiement a été enregistré mais la génération de la quittance a échoué.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Paiement enregistré",
        description: `La facture ${paymentInvoice.number} a été marquée comme payée.${receiptGenerated ? ' Quittance générée.' : ''}`,
      });
    } catch (error) {
      console.error('Erreur lors du traitement du paiement:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'enregistrement du paiement.",
        variant: "destructive",
      });
    } finally {
      // Toujours fermer le dialogue, même en cas d'erreur
      setPaymentInvoice(null);
    }
  };

  const toggleInvoiceSelection = (invoiceId: string) => {
    const newSelection = new Set(selectedInvoices);
    if (newSelection.has(invoiceId)) {
      newSelection.delete(invoiceId);
    } else {
      newSelection.add(invoiceId);
    }
    setSelectedInvoices(newSelection);
  };

  const toggleAllInvoices = () => {
    if (selectedInvoices.size === invoices.length) {
      setSelectedInvoices(new Set());
    } else {
      setSelectedInvoices(new Set(invoices.map(inv => inv.id)));
    }
  };

  const handleBatchPrint = async () => {
    if (selectedInvoices.size === 0) {
      toast({
        title: "Aucune facture sélectionnée",
        description: "Veuillez sélectionner au moins une facture à imprimer.",
        variant: "destructive",
      });
      return;
    }

    const invoicesToPrint = invoices.filter(inv => selectedInvoices.has(inv.id));
    
    // Valider toutes les factures avant impression
    const invalidInvoices: { number: string; errors: string[] }[] = [];
    invoicesToPrint.forEach(invoice => {
      const validation = validateInvoiceForPayment(invoice);
      if (!validation.isValid) {
        invalidInvoices.push({
          number: invoice.number,
          errors: validation.errors
        });
      }
    });

    if (invalidInvoices.length > 0) {
      toast({
        title: "Factures incomplètes détectées",
        description: (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {invalidInvoices.map((inv, idx) => (
              <div key={idx} className="text-sm">
                <p className="font-semibold">Facture {inv.number} :</p>
                <ul className="list-disc list-inside ml-2">
                  {inv.errors.slice(0, 3).map((error, errIdx) => (
                    <li key={errIdx}>{error}</li>
                  ))}
                  {inv.errors.length > 3 && <li>... et {inv.errors.length - 3} autre(s)</li>}
                </ul>
              </div>
            ))}
          </div>
        ),
        variant: "destructive",
      });
      return;
    }

    setIsPrintingBatch(true);

    try {
      // Utiliser les factures déjà validées
      const validInvoices = invoicesToPrint;
      const doc = new jsPDF();
      
      for (let i = 0; i < validInvoices.length; i++) {
        const invoice = validInvoices[i];
        
        if (i > 0) {
          doc.addPage();
        }

        // En-tête entreprise
        let yPosition = 20;
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(companyInfo?.name || 'Entreprise', 14, yPosition);
        yPosition += 8;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        if (companyInfo?.address) {
          doc.text(companyInfo.address, 14, yPosition);
          yPosition += 5;
        }
        if (companyInfo?.phone) {
          doc.text(`Tél: ${companyInfo.phone}`, 14, yPosition);
          yPosition += 5;
        }

        // Titre FACTURE
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('FACTURE', 200, 30, { align: 'right' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`N° ${invoice.number}`, 200, 38, { align: 'right' });
        doc.text(`Date: ${new Date(invoice.date).toLocaleDateString('fr-FR')}`, 200, 44, { align: 'right' });

        // Client
        yPosition = 60;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Facturé à:', 14, yPosition);
        yPosition += 6;
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        if (invoice.client) {
          doc.text(invoice.client.name || '-', 14, yPosition);
          yPosition += 5;
          if (invoice.client.address) {
            doc.text(invoice.client.address, 14, yPosition);
            yPosition += 5;
          }
        }

        // Total
        yPosition = 100;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL:', 140, yPosition);
        doc.text(`${invoice.total.toLocaleString('fr-FR')} FCFA`, 200, yPosition, { align: 'right' });

        // Statut
        yPosition += 10;
        doc.setFontSize(10);
        const statusLabels = {
          draft: 'Brouillon',
          sent: 'Envoyée',
          paid: 'Payée',
          overdue: 'En retard',
        };
        doc.text(`Statut: ${statusLabels[invoice.status]}`, 14, yPosition);

        // Pied de page
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text(`Facture ${i + 1} sur ${validInvoices.length}`, 105, pageHeight - 10, { align: 'center' });
      }

      doc.save(`Factures_lot_${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: "Impression réussie",
        description: `${selectedInvoices.size} facture(s) imprimée(s) avec succès.`,
      });

      setSelectedInvoices(new Set());
    } catch (error) {
      console.error('Error printing batch:', error);
      toast({
        title: "Erreur d'impression",
        description: "Une erreur s'est produite lors de l'impression des factures.",
        variant: "destructive",
      });
    } finally {
      setIsPrintingBatch(false);
    }
  };
  
  const selectColumn = {
    key: 'select',
    header: () => (
      <Checkbox
        checked={selectedInvoices.size === invoices.length && invoices.length > 0}
        onCheckedChange={toggleAllInvoices}
        aria-label="Sélectionner tout"
      />
    ),
    cell: (item: Partial<Invoice>) => (
      <Checkbox
        checked={selectedInvoices.has(item.id || '')}
        onCheckedChange={() => toggleInvoiceSelection(item.id || '')}
        aria-label={`Sélectionner facture ${item.number}`}
      />
    ),
  };

  const columnsWithSelect = [selectColumn, ...columns];

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
          {invoice.status === 'draft' && (
            <>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer text-blue-600"
                onClick={() => {
                  if (invoice.id) {
                    updateInvoice(invoice.id, { status: 'sent' });
                    toast({
                      title: "Facture validée",
                      description: `La facture ${invoice.number} a été validée et peut maintenant être payée.`,
                    });
                  }
                }}
              >
                <FileText className="h-4 w-4" /> Valider la facture
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {(invoice.status === 'sent' || invoice.status === 'overdue') && (
            <>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer text-green-600"
                onClick={() => {
                  // Valider la facture avant d'ouvrir le dialogue de paiement
                  const validation = validateInvoiceForPayment(invoice as Invoice);
                  
                  if (!validation.isValid) {
                    toast({
                      title: "Facture incomplète",
                      description: (
                        <div className="space-y-1">
                          <p>Impossible d'enregistrer le paiement :</p>
                          <ul className="list-disc list-inside text-sm">
                            {validation.errors.map((error, idx) => (
                              <li key={idx}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      ),
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  setPaymentInvoice(invoice as Invoice);
                }}
              >
                <DollarSign className="h-4 w-4" /> Enregistrer paiement
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setIsEditing(invoice.id || null)}
          >
            <Edit className="h-4 w-4" /> Modifier
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              if (invoice.id) {
                // Valider la facture avant l'impression
                const validation = validateInvoiceForPayment(invoice as Invoice);
                
                if (!validation.isValid) {
                  toast({
                    title: "Facture incomplète",
                    description: (
                      <div className="space-y-1">
                        <p>Impossible d'imprimer la facture :</p>
                        <ul className="list-disc list-inside text-sm">
                          {validation.errors.map((error, idx) => (
                            <li key={idx}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    ),
                    variant: "destructive",
                  });
                  return;
                }
                
                generateInvoicePDF(invoice as Invoice, companyInfo);
              }
            }}
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
        <div className="flex gap-2">
          {selectedInvoices.size > 0 && (
            <Button 
              onClick={handleBatchPrint} 
              disabled={isPrintingBatch}
              variant="outline"
            >
              {isPrintingBatch ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Impression...
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimer ({selectedInvoices.size})
                </>
              )}
            </Button>
          )}
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" /> Nouvelle facture
          </Button>
        </div>
      </div>
      
      <DataTable 
        data={invoices} 
        columns={columnsWithSelect} 
        actions={actions}
      />

      {/* Payment Dialog */}
      <PaymentDialog
        isOpen={!!paymentInvoice}
        onClose={() => setPaymentInvoice(null)}
        onPayment={handlePayment}
        totalAmount={paymentInvoice?.total || 0}
      />
    </div>
  );
};

export default Invoices;


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { InvoiceItem, Invoice } from '@/lib/types';
import { FileText, Plus, Trash, Printer, AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useClients } from '@/hooks/useClients';
import { useVendors } from '@/hooks/useVendors';
import { useProducts } from '@/hooks/useProducts';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import Logo from '@/components/Logo';
import { generateInvoicePDF } from '@/lib/utils/invoicePdfUtils';
import { Download } from 'lucide-react';

interface InvoiceFormProps {
  initialInvoice?: Partial<Invoice>;
  onSubmit: (invoice: Partial<Invoice>) => void;
  isLoading?: boolean;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  initialInvoice,
  onSubmit,
  isLoading = false
}) => {
  const { clients } = useClients();
  const { vendors } = useVendors();
  const { products } = useProducts();
  const { companyInfo } = useCompanyInfo();
  
  const [recipientType, setRecipientType] = useState<'client' | 'vendor'>(
    initialInvoice?.clientId ? 'client' : initialInvoice?.vendorId ? 'vendor' : 'client'
  );
  
  const [invoice, setInvoice] = useState<Partial<Invoice>>(initialInvoice || {
    date: new Date().toISOString().split('T')[0],
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    status: 'draft'
  });

  const [showPreview, setShowPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // États pour les erreurs en temps réel par champ
  const [fieldErrors, setFieldErrors] = useState<{
    recipient?: string;
    items?: Record<string, string[]>;
    tax?: string;
    discount?: string;
    total?: string;
  }>({});

  const handleClientChange = (clientId: string) => {
    const selectedClient = clients.find(c => c.id === clientId);
    if (selectedClient) {
      setInvoice({ ...invoice, client: selectedClient, clientId, vendor: undefined, vendorId: undefined });
      // Effacer l'erreur du destinataire
      setFieldErrors(prev => ({ ...prev, recipient: undefined }));
      setValidationErrors([]);
    }
  };

  const handleVendorChange = (vendorId: string) => {
    const selectedVendor = vendors.find(v => v.id === vendorId);
    if (selectedVendor) {
      setInvoice({ ...invoice, vendor: selectedVendor, vendorId, client: undefined, clientId: undefined });
      // Effacer l'erreur du destinataire
      setFieldErrors(prev => ({ ...prev, recipient: undefined }));
      setValidationErrors([]);
    }
  };

  const addItem = () => {
    // Réinitialiser les erreurs de validation
    setValidationErrors([]);
    const newItem: InvoiceItem = {
      id: String(Date.now()),
      product: { id: '', reference: '', description: '', price: 0 },
      quantity: 1,
      amount: 0
    };
    
    setInvoice({
      ...invoice,
      items: [...(invoice.items || []), newItem]
    });
  };

  const removeItem = (index: number) => {
    const updatedItems = [...(invoice.items || [])];
    updatedItems.splice(index, 1);
    
    const recalculatedInvoice = calculateTotals({
      ...invoice,
      items: updatedItems
    });
    
    setInvoice(recalculatedInvoice);
  };

  const handleProductChange = (itemId: string, productId: string) => {
    const selectedProduct = products.find(p => p.id === productId);
    if (!selectedProduct) return;
    
    const updatedItems = (invoice.items || []).map(item => {
      if (item.id === itemId) {
        const updatedItem = { 
          ...item, 
          product: selectedProduct,
          amount: selectedProduct.price * item.quantity 
        };
        return updatedItem;
      }
      return item;
    });
    
    const recalculatedInvoice = calculateTotals({
      ...invoice,
      items: updatedItems
    });
    
    setInvoice(recalculatedInvoice);
    
    // Validation en temps réel de l'article
    validateItemRealtime(itemId, recalculatedInvoice.items || []);
    setValidationErrors([]);
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    const updatedItems = (invoice.items || []).map(item => {
      if (item.id === itemId) {
        const updatedItem = { 
          ...item, 
          quantity,
          amount: item.product.price * quantity 
        };
        return updatedItem;
      }
      return item;
    });
    
    const recalculatedInvoice = calculateTotals({
      ...invoice,
      items: updatedItems
    });
    
    setInvoice(recalculatedInvoice);
    
    // Validation en temps réel de la quantité
    validateItemRealtime(itemId, recalculatedInvoice.items || []);
  };

  const calculateTotals = (invoiceData: Partial<Invoice>): Partial<Invoice> => {
    const items = invoiceData.items || [];
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxRate = invoiceData.tax || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const discount = invoiceData.discount || 0;
    const total = subtotal + taxAmount - discount;
    
    return {
      ...invoiceData,
      subtotal,
      total
    };
  };

  const handleTaxChange = (value: string) => {
    const taxRate = parseFloat(value) || 0;
    
    const recalculatedInvoice = calculateTotals({
      ...invoice,
      tax: taxRate
    });
    
    setInvoice(recalculatedInvoice);
    
    // Validation en temps réel de la TVA
    if (taxRate < 0 || taxRate > 100) {
      setFieldErrors(prev => ({
        ...prev,
        tax: 'Le taux de TVA doit être entre 0 et 100%'
      }));
    } else {
      setFieldErrors(prev => ({ ...prev, tax: undefined }));
    }
  };

  const handleDiscountChange = (value: string) => {
    const discount = parseFloat(value) || 0;
    
    const recalculatedInvoice = calculateTotals({
      ...invoice,
      discount
    });
    
    setInvoice(recalculatedInvoice);
    
    // Validation en temps réel de la remise
    const errors: string[] = [];
    if (discount < 0) {
      errors.push('La remise ne peut pas être négative');
    }
    if (discount > (recalculatedInvoice.subtotal || 0)) {
      errors.push('La remise ne peut pas être supérieure au sous-total');
    }
    
    if (errors.length > 0) {
      setFieldErrors(prev => ({
        ...prev,
        discount: errors.join(', ')
      }));
    } else {
      setFieldErrors(prev => ({ ...prev, discount: undefined }));
    }
  };

  // Fonction de validation en temps réel pour un article
  const validateItemRealtime = (itemId: string, items: InvoiceItem[]) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    const errors: string[] = [];
    
    if (!item.product || !item.product.id) {
      errors.push('Veuillez sélectionner un produit');
    } else {
      if (!item.product.description && !item.product.reference) {
        errors.push('Le produit doit avoir une description ou une référence');
      }
      if (item.product.price === undefined || item.product.price === null || item.product.price < 0) {
        errors.push('Le produit doit avoir un prix valide');
      }
    }
    
    if (!item.quantity || item.quantity <= 0) {
      errors.push('La quantité doit être supérieure à 0');
    }
    
    if (item.amount === undefined || item.amount === null || item.amount < 0) {
      errors.push('Le montant calculé est invalide');
    }
    
    setFieldErrors(prev => ({
      ...prev,
      items: {
        ...prev.items,
        [itemId]: errors.length > 0 ? errors : []
      }
    }));
  };

  const validateInvoice = (invoiceData: Partial<Invoice>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validation du destinataire
    if (!invoiceData.client && !invoiceData.clientId && !invoiceData.vendor && !invoiceData.vendorId) {
      errors.push("Veuillez sélectionner un client ou un fournisseur");
    }

    // Validation des articles
    if (!invoiceData.items || invoiceData.items.length === 0) {
      errors.push("Veuillez ajouter au moins un article à la facture");
    } else {
      invoiceData.items.forEach((item, index) => {
        if (!item.product || !item.product.id) {
          errors.push(`Article ${index + 1} : Veuillez sélectionner un produit`);
        } else {
          if (!item.product.description && !item.product.reference) {
            errors.push(`Article ${index + 1} : Le produit doit avoir une description ou une référence`);
          }
          if (item.product.price === undefined || item.product.price === null || item.product.price < 0) {
            errors.push(`Article ${index + 1} : Le produit doit avoir un prix valide`);
          }
        }
        
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`Article ${index + 1} : La quantité doit être supérieure à 0`);
        }
        
        if (item.amount === undefined || item.amount === null || item.amount < 0) {
          errors.push(`Article ${index + 1} : Le montant calculé est invalide`);
        }
      });
    }

    // Validation des montants
    if (invoiceData.total === undefined || invoiceData.total === null || invoiceData.total <= 0) {
      errors.push("Le montant total de la facture doit être supérieur à 0");
    }

    if (invoiceData.subtotal === undefined || invoiceData.subtotal === null || invoiceData.subtotal < 0) {
      errors.push("Le sous-total de la facture est invalide");
    }

    // Validation de la TVA
    if (invoiceData.tax !== undefined && invoiceData.tax !== null) {
      if (invoiceData.tax < 0 || invoiceData.tax > 100) {
        errors.push("Le taux de TVA doit être entre 0 et 100%");
      }
    }

    // Validation de la remise
    if (invoiceData.discount !== undefined && invoiceData.discount !== null) {
      if (invoiceData.discount < 0) {
        errors.push("La remise ne peut pas être négative");
      }
      if (invoiceData.discount > invoiceData.subtotal!) {
        errors.push("La remise ne peut pas être supérieure au sous-total");
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Valider la facture avant soumission
    const validation = validateInvoice(invoice);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      // Scroll vers le haut pour voir les erreurs
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // Réinitialiser les erreurs si tout est valide
    setValidationErrors([]);
    onSubmit(invoice);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + ' FCFA';
  };

  // Calculer l'état de complétude en temps réel
  const getCompletionStatus = () => {
    const hasRecipient = !!(invoice.client || invoice.clientId || invoice.vendor || invoice.vendorId);
    
    const hasItems = (invoice.items || []).length > 0;
    const validItems = (invoice.items || []).filter(item => {
      return item.product && 
             item.product.id && 
             (item.product.description || item.product.reference) &&
             item.product.price >= 0 &&
             item.quantity > 0 &&
             item.amount >= 0;
    });
    const itemsValid = hasItems && validItems.length === (invoice.items || []).length;
    
    const amountsValid = 
      (invoice.total || 0) > 0 &&
      (invoice.subtotal || 0) >= 0 &&
      (!invoice.tax || (invoice.tax >= 0 && invoice.tax <= 100)) &&
      (!invoice.discount || (invoice.discount >= 0 && invoice.discount <= (invoice.subtotal || 0)));
    
    // Calcul du pourcentage de complétude
    let completionScore = 0;
    const totalCriteria = 3;
    
    if (hasRecipient) completionScore++;
    if (itemsValid) completionScore++;
    if (amountsValid) completionScore++;
    
    const percentage = Math.round((completionScore / totalCriteria) * 100);
    
    return {
      recipient: hasRecipient,
      items: itemsValid,
      itemsCount: {
        valid: validItems.length,
        total: (invoice.items || []).length
      },
      amounts: amountsValid,
      isComplete: hasRecipient && itemsValid && amountsValid,
      percentage,
      completionScore,
      totalCriteria
    };
  };

  const status = getCompletionStatus();

  return (
    <>
      {!showPreview ? (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {initialInvoice ? 'Modifier la facture' : 'Nouvelle facture'}
            </h2>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setShowPreview(true)}>
                <Printer className="h-4 w-4 mr-2" /> Aperçu
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Chargement...' : initialInvoice ? 'Mettre à jour' : 'Enregistrer'}
              </Button>
            </div>
          </div>

          {/* Récapitulatif de validation en temps réel */}
          <Card className={`border-2 ${status.isComplete ? 'border-primary/30 bg-primary/5' : 'border-muted'}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">État de la facture</h3>
                {status.isComplete ? (
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Complète</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-5 w-5" />
                    <span className="text-sm font-medium">En cours</span>
                  </div>
                )}
              </div>
              
              {/* Barre de progression */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Complétude
                  </span>
                  <span className={`text-sm font-bold transition-all duration-500 ${
                    status.percentage === 100 
                      ? 'text-primary scale-110' 
                      : 'text-muted-foreground'
                  }`}>
                    {status.percentage}%
                  </span>
                </div>
                <div className="relative">
                  <Progress 
                    value={status.percentage} 
                    className="h-2 transition-all duration-700 ease-out"
                  />
                  {status.percentage === 100 && (
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground animate-fade-in">
                  {status.completionScore} sur {status.totalCriteria} critères validés
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Destinataire */}
                <div className={`flex items-start gap-3 p-3 rounded-md transition-all duration-500 ${
                  status.recipient 
                    ? 'bg-primary/10 scale-[1.02] shadow-sm' 
                    : 'bg-muted scale-100'
                }`}>
                  {status.recipient ? (
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5 animate-scale-in" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium transition-colors duration-300 ${
                      status.recipient ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      Destinataire
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {status.recipient ? 'Client/Vendeur sélectionné' : 'Aucun destinataire'}
                    </p>
                  </div>
                </div>

                {/* Articles */}
                <div className={`flex items-start gap-3 p-3 rounded-md transition-all duration-500 ${
                  status.items 
                    ? 'bg-primary/10 scale-[1.02] shadow-sm' 
                    : 'bg-muted scale-100'
                }`}>
                  {status.items ? (
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5 animate-scale-in" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium transition-colors duration-300 ${
                      status.items ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      Articles
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {status.itemsCount.total === 0 
                        ? 'Aucun article'
                        : `${status.itemsCount.valid}/${status.itemsCount.total} valides`
                      }
                    </p>
                  </div>
                </div>

                {/* Montants */}
                <div className={`flex items-start gap-3 p-3 rounded-md transition-all duration-500 ${
                  status.amounts 
                    ? 'bg-primary/10 scale-[1.02] shadow-sm' 
                    : 'bg-muted scale-100'
                }`}>
                  {status.amounts ? (
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5 animate-scale-in" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium transition-colors duration-300 ${
                      status.amounts ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      Montants
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {status.amounts ? `Total: ${formatCurrency(invoice.total || 0)}` : 'Montants invalides'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alert d'erreurs de validation */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreurs de validation</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {initialInvoice && (
              <div>
                <Label htmlFor="invoice-number">Numéro de facture</Label>
                <Input
                  id="invoice-number"
                  value={invoice.number || ''}
                  disabled
                  className="mt-1 bg-muted"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="invoice-date">Date</Label>
              <Input
                id="invoice-date"
                type="date"
                value={invoice.date || ''}
                onChange={(e) => setInvoice({ ...invoice, date: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label>Type de destinataire</Label>
                <RadioGroup
                  value={recipientType}
                  onValueChange={(value: 'client' | 'vendor') => {
                    setRecipientType(value);
                    // Clear both client and vendor when switching
                    setInvoice({ ...invoice, client: undefined, clientId: undefined, vendor: undefined, vendorId: undefined });
                  }}
                  className="flex gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="client" id="client" />
                    <Label htmlFor="client" className="font-normal cursor-pointer">Client</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="vendor" id="vendor" />
                    <Label htmlFor="vendor" className="font-normal cursor-pointer">Vendeur</Label>
                  </div>
                </RadioGroup>
              </div>

              {recipientType === 'client' ? (
                <>
                  <div>
                    <Label htmlFor="client-select">Client *</Label>
                    <Select 
                      onValueChange={handleClientChange} 
                      value={invoice.clientId || invoice.client?.id}
                    >
                      <SelectTrigger className={`mt-1 ${fieldErrors.recipient ? 'border-destructive' : ''}`}>
                        <SelectValue placeholder="Sélectionner un client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldErrors.recipient && (
                      <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.recipient}
                      </p>
                    )}
                  </div>

                  {invoice.client && (
                    <div className="p-4 bg-muted rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Adresse</p>
                          <p className="text-sm">{invoice.client.address}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Téléphone</p>
                          <p className="text-sm">{invoice.client.phone}</p>
                        </div>
                        {invoice.client.code && (
                          <div>
                            <p className="text-sm font-medium">Code client</p>
                            <p className="text-sm">{invoice.client.code}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="vendor-select">Vendeur *</Label>
                    <Select 
                      onValueChange={handleVendorChange} 
                      value={invoice.vendorId || invoice.vendor?.id}
                    >
                      <SelectTrigger className={`mt-1 ${fieldErrors.recipient ? 'border-destructive' : ''}`}>
                        <SelectValue placeholder="Sélectionner un vendeur" />
                      </SelectTrigger>
                      <SelectContent>
                        {vendors.map(vendor => (
                          <SelectItem key={vendor.id} value={vendor.id}>
                            {vendor.name} {vendor.code ? `(${vendor.code})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldErrors.recipient && (
                      <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.recipient}
                      </p>
                    )}
                  </div>

                  {invoice.vendor && (
                    <div className="p-4 bg-muted rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Code vendeur</p>
                          <p className="text-sm">{invoice.vendor.code}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Téléphone</p>
                          <p className="text-sm">{invoice.vendor.phone}</p>
                        </div>
                        {invoice.vendor.address && (
                          <div>
                            <p className="text-sm font-medium">Adresse</p>
                            <p className="text-sm">{invoice.vendor.address}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">Solde actuel</p>
                          <p className="text-sm font-semibold">
                            {invoice.vendor.remainingBalance?.toFixed(2)} FCFA
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Produits et services</h3>
              <Button type="button" onClick={addItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" /> Ajouter une ligne
              </Button>
            </div>
            
            <div className="border rounded-md">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted border-b">
                    <th className="text-left p-2 pl-4">Produit / Service</th>
                    <th className="text-right p-2">P.U (FCFA)</th>
                    <th className="text-right p-2">Quantité</th>
                    <th className="text-right p-2">Montant (FCFA)</th>
                    <th className="p-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {(invoice.items || []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted-foreground">
                        Aucun produit ou service ajouté
                      </td>
                    </tr>
                  ) : (
                    (invoice.items || []).map((item, index) => {
                      const itemErrors = fieldErrors.items?.[item.id] || [];
                      const hasError = itemErrors.length > 0;
                      
                      return (
                        <React.Fragment key={item.id}>
                          <tr className="border-b">
                            <td className="p-2 pl-4">
                              <Select 
                                onValueChange={(value) => handleProductChange(item.id, value)} 
                                value={item.product?.id}
                              >
                                <SelectTrigger className={hasError ? 'border-destructive' : ''}>
                                  <SelectValue placeholder="Choisir un produit" />
                                </SelectTrigger>
                                <SelectContent>
                                  {products.map(product => (
                                    <SelectItem key={product.id} value={product.id}>
                                      {product.reference} - {product.description}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-2 text-right">
                              {item.product?.price?.toLocaleString() || 0}
                            </td>
                            <td className="p-2 text-right">
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                                className={`max-w-[80px] text-right ml-auto ${hasError ? 'border-destructive' : ''}`}
                              />
                            </td>
                            <td className="p-2 text-right">
                              {item.amount?.toLocaleString() || 0}
                            </td>
                            <td className="p-2 text-right">
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon"
                                onClick={() => removeItem(index)}
                              >
                                <Trash className="h-4 w-4 text-red-500" />
                              </Button>
                            </td>
                          </tr>
                          {hasError && (
                            <tr>
                              <td colSpan={5} className="p-2 pl-4">
                                <div className="text-sm text-destructive flex items-start gap-1">
                                  <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                  <div>
                                    {itemErrors.map((error, idx) => (
                                      <div key={idx}>{error}</div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Notes ou informations supplémentaires"
                value={invoice.notes || ''}
                onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
                rows={4}
                className="mt-1"
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between py-2">
                <span>Sous-total:</span>
                <span className="font-medium">{formatCurrency(invoice.subtotal || 0)}</span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <Label htmlFor="tax">TVA (%):</Label>
                <div className="flex flex-col items-end gap-1">
                  <Input
                    id="tax"
                    type="number"
                    min="0"
                    step="0.01"
                    className={`w-24 text-right ${fieldErrors.tax ? 'border-destructive' : ''}`}
                    value={invoice.tax || 0}
                    onChange={(e) => handleTaxChange(e.target.value)}
                  />
                  {fieldErrors.tax && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {fieldErrors.tax}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <Label htmlFor="discount">Remise (FCFA):</Label>
                <div className="flex flex-col items-end gap-1">
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    className={`w-24 text-right ${fieldErrors.discount ? 'border-destructive' : ''}`}
                    value={invoice.discount || 0}
                    onChange={(e) => handleDiscountChange(e.target.value)}
                  />
                  {fieldErrors.discount && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {fieldErrors.discount}
                    </p>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between py-2">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-lg font-bold">{formatCurrency(invoice.total || 0)}</span>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Aperçu de la facture</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Modifier
              </Button>
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" /> Imprimer
              </Button>
              <Button onClick={() => generateInvoicePDF(invoice as Invoice, companyInfo)}>
                <Download className="h-4 w-4 mr-2" /> Télécharger PDF
              </Button>
            </div>
          </div>
          
          <div className="print-invoice shadow-lg">
            <div className="print-invoice-header">
              <div>
                {companyInfo.logo ? (
                  <img src={companyInfo.logo} alt={companyInfo.name} className="h-16 mb-4" />
                ) : (
                  <Logo className="h-16 mb-4" />
                )}
                <div className="mt-4 space-y-1">
                  <p className="font-bold">{companyInfo.name}</p>
                  <p>{companyInfo.address}</p>
                  {companyInfo.phone && <p>Téléphone: {companyInfo.phone}</p>}
                  {companyInfo.email && <p>Email: {companyInfo.email}</p>}
                </div>
              </div>
              
              <div className="text-right">
                <h2 className="text-2xl font-bold">FACTURE</h2>
                <p className="font-bold">N° {invoice.number}</p>
                <p>Date: {new Date(invoice.date || '').toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="border rounded p-4">
                <p className="font-bold mb-2">Facturé à:</p>
                <p>{invoice.client?.name}</p>
                <p>{invoice.client?.address}</p>
                <p>Téléphone: {invoice.client?.phone}</p>
                {invoice.client?.code && <p>Code client: {invoice.client.code}</p>}
              </div>
            </div>
            
            <table className="print-invoice-table mb-8">
              <thead>
                <tr className="bg-epic-blue text-white">
                  <th>Référence</th>
                  <th>Description</th>
                  <th className="text-right">Prix unitaire</th>
                  <th className="text-right">Quantité</th>
                  <th className="text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.items || []).map((item, index) => (
                  <tr key={index}>
                    <td>{item.product?.reference}</td>
                    <td>{item.product?.description}</td>
                    <td className="text-right">{item.product?.price?.toLocaleString() || 0}</td>
                    <td className="text-right">{item.quantity}</td>
                    <td className="text-right">{item.amount?.toLocaleString() || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="flex justify-end mb-8">
              <div className="w-64">
                <div className="flex justify-between py-2 border-b">
                  <span>Sous-total:</span>
                  <span>{formatCurrency(invoice.subtotal || 0)}</span>
                </div>
                {(invoice.tax || 0) > 0 && (
                  <div className="flex justify-between py-2 border-b">
                    <span>TVA ({invoice.tax}%):</span>
                    <span>{formatCurrency(((invoice.subtotal || 0) * (invoice.tax || 0)) / 100)}</span>
                  </div>
                )}
                {(invoice.discount || 0) > 0 && (
                  <div className="flex justify-between py-2 border-b">
                    <span>Remise:</span>
                    <span>-{formatCurrency(invoice.discount || 0)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(invoice.total || 0)}</span>
                </div>
              </div>
            </div>
            
            {invoice.notes && (
              <div className="mb-8">
                <h3 className="font-bold mb-2">Notes:</h3>
                <p>{invoice.notes}</p>
              </div>
            )}
            
            <div className="text-center text-sm text-muted-foreground mt-16">
              {companyInfo.slogan && <p className="italic mb-2">{companyInfo.slogan}</p>}
              <p>Merci pour votre confiance</p>
              {companyInfo.taxId && <p>{companyInfo.taxId}</p>}
              {companyInfo.signatory && (
                <div className="mt-8">
                  <p className="font-semibold">{companyInfo.signatory}</p>
                  {companyInfo.signatoryTitle && <p className="text-xs">{companyInfo.signatoryTitle}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InvoiceForm;

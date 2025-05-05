
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Client, Product, InvoiceItem, Invoice } from '@/lib/types';
import { FileText, Plus, Trash, Printer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// Mock data
const mockClients: Client[] = [
  { id: '1', name: 'Societe ABC', address: 'Abidjan, Plateau', phone: '0123456789', code: 'CLI001' },
  { id: '2', name: 'Client XYZ', address: 'Abidjan, Cocody', phone: '9876543210', code: 'CLI002' },
  { id: '3', name: 'Entreprise DEF', address: 'Abidjan, Treichville', phone: '5555666777', code: 'CLI003' },
];

const mockProducts: Product[] = [
  { id: '1', reference: 'P1', description: 'Produit 1', price: 100000 },
  { id: '2', reference: 'P2', description: 'Service mensuel', price: 50000 },
  { id: '3', reference: 'P3', description: 'Consultation', price: 75000 },
];

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
  const [invoice, setInvoice] = useState<Partial<Invoice>>(initialInvoice || {
    number: `FACT-${String(Date.now()).slice(-4)}`,
    date: new Date().toISOString().split('T')[0],
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    status: 'draft'
  });

  const [showPreview, setShowPreview] = useState(false);

  const handleClientChange = (clientId: string) => {
    const selectedClient = mockClients.find(c => c.id === clientId);
    if (selectedClient) {
      setInvoice({ ...invoice, client: selectedClient });
    }
  };

  const addItem = () => {
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
    const selectedProduct = mockProducts.find(p => p.id === productId);
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
  };

  const handleDiscountChange = (value: string) => {
    const discount = parseFloat(value) || 0;
    
    const recalculatedInvoice = calculateTotals({
      ...invoice,
      discount
    });
    
    setInvoice(recalculatedInvoice);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(invoice);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + ' FCFA';
  };

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="invoice-number">Numéro de facture</Label>
              <Input
                id="invoice-number"
                value={invoice.number || ''}
                onChange={(e) => setInvoice({ ...invoice, number: e.target.value })}
                className="mt-1"
              />
            </div>
            
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
            <CardContent className="pt-6">
              <Label htmlFor="client">Client</Label>
              <Select 
                onValueChange={handleClientChange} 
                value={invoice.client?.id}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {mockClients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {invoice.client && (
                <div className="mt-4 p-4 bg-muted rounded-md">
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
                    (invoice.items || []).map((item, index) => (
                      <tr key={item.id} className="border-b">
                        <td className="p-2 pl-4">
                          <Select 
                            onValueChange={(value) => handleProductChange(item.id, value)} 
                            value={item.product?.id}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choisir un produit" />
                            </SelectTrigger>
                            <SelectContent>
                              {mockProducts.map(product => (
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
                            className="max-w-[80px] text-right ml-auto"
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
                    ))
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
                <Input
                  id="tax"
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-24 text-right"
                  value={invoice.tax || 0}
                  onChange={(e) => handleTaxChange(e.target.value)}
                />
              </div>
              
              <div className="flex items-center justify-between py-2">
                <Label htmlFor="discount">Remise (FCFA):</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  className="w-24 text-right"
                  value={invoice.discount || 0}
                  onChange={(e) => handleDiscountChange(e.target.value)}
                />
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
              <Button>
                <Printer className="h-4 w-4 mr-2" /> Imprimer
              </Button>
            </div>
          </div>
          
          <div className="print-invoice shadow-lg">
            <div className="print-invoice-header">
              <div>
                <div className="bg-epic-gold p-2 rounded-md inline-block">
                  <div className="text-epic-blue font-bold text-2xl">EPICSPOT</div>
                </div>
                <div className="mt-4 space-y-1">
                  <p className="font-bold">EPICSPOT_CONSULTING</p>
                  <p>Adresse de l'entreprise</p>
                  <p>Téléphone: +225 XX XX XX XX</p>
                  <p>Email: contact@epicspot.com</p>
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
              <p>Merci pour votre confiance</p>
              <p>EPICSPOT_CONSULTING - RC: XXXXXXX - IF: XXXXXXX</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InvoiceForm;


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { InvoiceItem, Quote } from '@/lib/types';
import { FileCheck, Plus, Trash, Printer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useClients } from '@/hooks/useClients';
import { useProducts } from '@/hooks/useProducts';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import Logo from '@/components/Logo';

interface QuoteFormProps {
  initialQuote?: Partial<Quote>;
  onSubmit: (quote: Partial<Quote>) => void;
  isLoading?: boolean;
}

const QuoteForm: React.FC<QuoteFormProps> = ({
  initialQuote,
  onSubmit,
  isLoading = false
}) => {
  const { clients } = useClients();
  const { products } = useProducts();
  const { companyInfo } = useCompanyInfo();
  
  const [quote, setQuote] = useState<Partial<Quote>>(initialQuote || {
    date: new Date().toISOString().split('T')[0],
    items: [],
    subtotal: 0,
    total: 0,
    status: 'draft'
  });

  const [showPreview, setShowPreview] = useState(false);

  const handleClientChange = (clientId: string) => {
    const selectedClient = clients.find(c => c.id === clientId);
    if (selectedClient) {
      setQuote({ ...quote, client: selectedClient });
    }
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: String(Date.now()),
      product: { id: '', reference: '', description: '', price: 0 },
      quantity: 1,
      amount: 0
    };
    
    setQuote({
      ...quote,
      items: [...(quote.items || []), newItem]
    });
  };

  const removeItem = (index: number) => {
    const updatedItems = [...(quote.items || [])];
    updatedItems.splice(index, 1);
    
    const recalculatedQuote = calculateTotals({
      ...quote,
      items: updatedItems
    });
    
    setQuote(recalculatedQuote);
  };

  const handleProductChange = (itemId: string, productId: string) => {
    const selectedProduct = products.find(p => p.id === productId);
    if (!selectedProduct) return;
    
    const updatedItems = (quote.items || []).map(item => {
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
    
    const recalculatedQuote = calculateTotals({
      ...quote,
      items: updatedItems
    });
    
    setQuote(recalculatedQuote);
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    const updatedItems = (quote.items || []).map(item => {
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
    
    const recalculatedQuote = calculateTotals({
      ...quote,
      items: updatedItems
    });
    
    setQuote(recalculatedQuote);
  };

  const calculateTotals = (quoteData: Partial<Quote>): Partial<Quote> => {
    const items = quoteData.items || [];
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const discount = quoteData.discount || 0;
    const total = subtotal - discount;
    
    return {
      ...quoteData,
      subtotal,
      total
    };
  };

  const handleDiscountChange = (value: string) => {
    const discount = parseFloat(value) || 0;
    
    const recalculatedQuote = calculateTotals({
      ...quote,
      discount
    });
    
    setQuote(recalculatedQuote);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(quote);
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
              <FileCheck className="h-5 w-5" />
              {initialQuote ? 'Modifier le devis' : 'Nouveau devis'}
            </h2>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setShowPreview(true)}>
                <Printer className="h-4 w-4 mr-2" /> Aperçu
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Chargement...' : initialQuote ? 'Mettre à jour' : 'Enregistrer'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {initialQuote && (
              <div>
                <Label htmlFor="quote-number">Numéro de devis</Label>
                <Input
                  id="quote-number"
                  value={quote.number || ''}
                  disabled
                  className="mt-1 bg-muted"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="quote-date">Date</Label>
              <Input
                id="quote-date"
                type="date"
                value={quote.date || ''}
                onChange={(e) => setQuote({ ...quote, date: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Label htmlFor="client">Client</Label>
              <Select 
                onValueChange={handleClientChange} 
                value={quote.client?.id}
              >
                <SelectTrigger className="mt-1">
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

              {quote.client && (
                <div className="mt-4 p-4 bg-muted rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Adresse</p>
                      <p className="text-sm">{quote.client.address}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Téléphone</p>
                      <p className="text-sm">{quote.client.phone}</p>
                    </div>
                    {quote.client.code && (
                      <div>
                        <p className="text-sm font-medium">Code client</p>
                        <p className="text-sm">{quote.client.code}</p>
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
                  {(quote.items || []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted-foreground">
                        Aucun produit ou service ajouté
                      </td>
                    </tr>
                  ) : (
                    (quote.items || []).map((item, index) => (
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
                value={quote.notes || ''}
                onChange={(e) => setQuote({ ...quote, notes: e.target.value })}
                rows={4}
                className="mt-1"
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between py-2">
                <span>Sous-total:</span>
                <span className="font-medium">{formatCurrency(quote.subtotal || 0)}</span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <Label htmlFor="discount">Remise (FCFA):</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  className="w-24 text-right"
                  value={quote.discount || 0}
                  onChange={(e) => handleDiscountChange(e.target.value)}
                />
              </div>
              
              <Separator />
              
              <div className="flex justify-between py-2">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-lg font-bold">{formatCurrency(quote.total || 0)}</span>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Aperçu du devis</h2>
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
                <h2 className="text-2xl font-bold">DEVIS</h2>
                <p className="font-bold">N° {quote.number}</p>
                <p>Date: {new Date(quote.date || '').toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="border rounded p-4">
                <p className="font-bold mb-2">Client:</p>
                <p>{quote.client?.name}</p>
                <p>{quote.client?.address}</p>
                <p>Téléphone: {quote.client?.phone}</p>
                {quote.client?.code && <p>Code client: {quote.client.code}</p>}
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
                {(quote.items || []).map((item, index) => (
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
                  <span>{formatCurrency(quote.subtotal || 0)}</span>
                </div>
                {(quote.discount || 0) > 0 && (
                  <div className="flex justify-between py-2 border-b">
                    <span>Remise:</span>
                    <span>-{formatCurrency(quote.discount || 0)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(quote.total || 0)}</span>
                </div>
              </div>
            </div>
            
            {quote.notes && (
              <div className="mb-8">
                <h3 className="font-bold mb-2">Notes:</h3>
                <p>{quote.notes}</p>
              </div>
            )}
            
            <div className="text-center text-sm text-muted-foreground mt-16">
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

export default QuoteForm;

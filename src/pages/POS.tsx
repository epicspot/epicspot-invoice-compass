import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useProducts } from '@/hooks/useProducts';
import { useClients } from '@/hooks/useClients';
import { useInvoices } from '@/hooks/useInvoices';
import { useStockMovements } from '@/hooks/useStockMovements';
import { useProductStock } from '@/hooks/useProductStock';
import { useCashRegisters } from '@/hooks/useCashRegisters';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { useSites } from '@/hooks/useSites';
import { Product, Client, InvoiceItem } from '@/lib/types';
import { ShoppingCart, Trash2, Plus, Minus, Search, Receipt, CreditCard, DollarSign, Building2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateReceipt } from '@/lib/utils/receiptUtils';

const POS = () => {
  const { sites } = useSites();
  const [siteId, setSiteId] = useState<string>('');
  
  const { products } = useProducts();
  const { clients, createClient } = useClients();
  const { createInvoice } = useInvoices();
  const { createMovement } = useStockMovements();
  const { getStock } = useProductStock(siteId);
  const { cashRegisters, addTransaction } = useCashRegisters();
  const { companyInfo } = useCompanyInfo();
  
  // Set default site when sites are loaded
  React.useEffect(() => {
    if (sites.length > 0 && !siteId) {
      setSiteId(sites[0].id);
    }
  }, [sites, siteId]);
  
  const [cart, setCart] = useState<InvoiceItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedRegister, setSelectedRegister] = useState<string>('reg-default');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'check'>('cash');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  
  // Informations spécifiques aux paiements
  const [cardTransactionNumber, setCardTransactionNumber] = useState('');
  const [cardTerminal, setCardTerminal] = useState('');
  const [checkNumber, setCheckNumber] = useState('');
  const [checkBank, setCheckBank] = useState('');
  const [checkDate, setCheckDate] = useState(new Date().toISOString().split('T')[0]);
  const [generateReceiptEnabled, setGenerateReceiptEnabled] = useState(true);
  const openRegisters = cashRegisters.filter(r => r.status === 'open');

  // Filter products by search query
  const filteredProducts = products.filter(p =>
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.reference.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: Product) => {
    // Vérifier le stock disponible
    const availableStock = getStock(product.id, siteId);
    const currentQtyInCart = cart.find(item => item.product?.id === product.id)?.quantity || 0;
    
    if (availableStock <= currentQtyInCart) {
      toast({
        title: "Stock insuffisant",
        description: `Le produit "${product.description}" n'a plus de stock disponible.`,
        variant: "destructive"
      });
      return;
    }
    
    const existingItem = cart.find(item => item.product?.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.product?.id === product.id
          ? { ...item, quantity: item.quantity + 1, amount: (item.quantity + 1) * product.price }
          : item
      ));
    } else {
      setCart([...cart, {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        product,
        quantity: 1,
        amount: product.price
      }]);
    }
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + delta;
        
        // Vérifier le stock disponible pour l'augmentation
        if (delta > 0) {
          const availableStock = item.product?.id ? getStock(item.product.id, siteId) : 0;
          if (newQuantity > availableStock) {
            toast({
              title: "Stock insuffisant",
              description: `Stock disponible: ${availableStock}`,
              variant: "destructive"
            });
            return item;
          }
        }
        
        if (newQuantity <= 0) {
          return null;
        }
        
        return { ...item, quantity: newQuantity, amount: newQuantity * (item.product?.price || 0) };
      }
      return item;
    }).filter(Boolean) as InvoiceItem[]);
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.amount, 0);
    const tax = cart.reduce((sum, item) => {
      const taxRate = item.product?.taxRate || 0;
      return sum + (item.amount * taxRate / 100);
    }, 0);
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };

  const handlePayment = async () => {
    if (cart.length === 0) {
      toast({
        title: "Panier vide",
        description: "Ajoutez des produits avant de valider la vente.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedRegister) {
      toast({
        title: "Caisse non sélectionnée",
        description: "Veuillez sélectionner une caisse.",
        variant: "destructive"
      });
      return;
    }

    const { subtotal, tax, total } = calculateTotals();

    if (paymentMethod === 'cash' && amountPaid < total) {
      toast({
        title: "Montant insuffisant",
        description: "Le montant payé est inférieur au total.",
        variant: "destructive"
      });
      return;
    }

    // Validation des champs spécifiques
    if (paymentMethod === 'card') {
      if (!cardTransactionNumber.trim()) {
        toast({
          title: "Informations manquantes",
          description: "Veuillez saisir le numéro de transaction.",
          variant: "destructive"
        });
        return;
      }
    }

    if (paymentMethod === 'check') {
      if (!checkNumber.trim() || !checkBank.trim()) {
        toast({
          title: "Informations manquantes",
          description: "Veuillez saisir le numéro de chèque et la banque.",
          variant: "destructive"
        });
        return;
      }
    }

    // Préparer les notes de paiement
    let paymentNotes = `Paiement ${
      paymentMethod === 'cash' ? 'espèces' : 
      paymentMethod === 'card' ? 'carte bancaire' : 
      'chèque'
    }`;
    
    if (paymentMethod === 'card') {
      paymentNotes += ` - Transaction: ${cardTransactionNumber}`;
      if (cardTerminal) paymentNotes += ` - Terminal: ${cardTerminal}`;
    }
    
    if (paymentMethod === 'check') {
      paymentNotes += ` - Chèque N°${checkNumber} - Banque: ${checkBank} - Date: ${new Date(checkDate).toLocaleDateString('fr-FR')}`;
    }

    // Déterminer le client effectif (client sélectionné ou client comptoir)
    let effectiveClient: Client | null = selectedClient;
    let walkInClientId: string | undefined;

    if (!effectiveClient) {
      // Rechercher un client comptoir existant
      const existingWalkIn = clients.find(c => c.code === 'COMPTOIR' || c.name?.toLowerCase() === 'client comptoir');
      if (existingWalkIn) {
        walkInClientId = existingWalkIn.id;
      } else {
        // Créer un client comptoir minimal si aucun n'existe
        const created = await createClient({
          name: 'Client comptoir',
          address: '-',
          phone: '-',
          email: '',
          taxInfo: undefined,
          taxCenter: undefined,
          siteId,
        });
        walkInClientId = created.id;
      }
    }

    const invoice = await createInvoice({
      date: new Date().toISOString(),
      client: effectiveClient || undefined,
      clientId: effectiveClient?.id || walkInClientId,
      items: cart,
      subtotal,
      tax,
      total,
      notes: paymentNotes,
      status: 'paid',
      siteId,
      cashRegisterId: selectedRegister
    });

    // Update stock
    for (const item of cart) {
      await createMovement({
        productId: item.product?.id || '',
        siteId,
        quantity: -item.quantity,
        type: 'sale',
        reference: invoice.number,
        userId: 'current-user'
      });
    }

    // Add transaction to cash register
    addTransaction({
      cashRegisterId: selectedRegister,
      amount: total,
      type: 'sale',
      reference: invoice.number,
      userId: 'current-user',
      notes: paymentNotes
    });

    // Clear cart and payment info
    setCart([]);
    setAmountPaid(0);
    setSelectedClient(null);
    setCardTransactionNumber('');
    setCardTerminal('');
    setCheckNumber('');
    setCheckBank('');
    setCheckDate(new Date().toISOString().split('T')[0]);

    toast({
      title: "Vente enregistrée",
      description: `Facture ${invoice.number} créée avec succès.${paymentMethod === 'cash' && amountPaid > total ? ` Rendu: ${(amountPaid - total).toLocaleString()} FCFA` : ''}`
    });
  };

  const { subtotal, tax, total } = calculateTotals();

  return (
    <div className="h-screen flex">
      {/* Products Section */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              Point de Vente (POS)
            </h1>
            
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <Select value={siteId} onValueChange={setSiteId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sélectionner un site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map(product => {
            const stock = getStock(product.id, siteId);
            const isOutOfStock = stock <= 0;
            
            return (
              <Card 
                key={product.id} 
                className={`cursor-pointer transition-shadow ${isOutOfStock ? 'opacity-50' : 'hover:shadow-lg'}`}
                onClick={() => !isOutOfStock && addToCart(product)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-sm font-medium">{product.reference}</div>
                    <Badge variant={isOutOfStock ? 'destructive' : 'secondary'} className="text-xs">
                      Stock: {stock}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {product.description}
                  </div>
                  <div className="text-lg font-bold">
                    {product.price.toLocaleString()} FCFA
                  </div>
                  {product.taxRate && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      TVA {product.taxRate}%
                    </Badge>
                  )}
                  {isOutOfStock && (
                    <div className="mt-2 text-xs text-red-600 font-semibold">
                      Rupture de stock
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 border-l bg-muted/10 p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-4">Panier</h2>

        {/* Client Selection */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Client (optionnel)</label>
          <Select 
            value={selectedClient?.id || 'walk-in'} 
            onValueChange={(value) => {
              if (value === 'walk-in') {
                setSelectedClient(null);
              } else {
                setSelectedClient(clients.find(c => c.id === value) || null);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Client comptoir" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="walk-in">Client comptoir</SelectItem>
              {clients.map(client => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Register Selection */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Caisse *</label>
          <Select value={selectedRegister} onValueChange={setSelectedRegister}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une caisse" />
            </SelectTrigger>
            <SelectContent>
              {openRegisters.map(register => (
                <SelectItem key={register.id} value={register.id}>
                  {register.name}
                  {register.id === 'reg-default' && ' (par défaut)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator className="my-4" />

        {/* Cart Items */}
        <div className="flex-1 overflow-auto mb-4">
          {cart.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Panier vide
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map(item => (
                <Card key={item.id}>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.product.reference}</div>
                        <div className="text-xs text-muted-foreground">{item.product.description}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="font-bold">
                        {item.amount.toLocaleString()} FCFA
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>Sous-total</span>
            <span>{subtotal.toLocaleString()} FCFA</span>
          </div>
          {tax > 0 && (
            <div className="flex justify-between text-sm">
              <span>Taxes</span>
              <span>{tax.toLocaleString()} FCFA</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{total.toLocaleString()} FCFA</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Mode de paiement</label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={paymentMethod === 'cash' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('cash')}
              className="w-full"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Espèces
            </Button>
            <Button
              variant={paymentMethod === 'card' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('card')}
              className="w-full"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Carte
            </Button>
            <Button
              variant={paymentMethod === 'check' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('check')}
              className="w-full"
            >
              <Receipt className="h-4 w-4 mr-2" />
              Chèque
            </Button>
          </div>
        </div>

        {/* Payment Details based on method */}
        {paymentMethod === 'cash' && (
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">Montant reçu</label>
            <Input
              type="number"
              min="0"
              value={amountPaid || ''}
              onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
              placeholder="0"
            />
            {amountPaid > total && (
              <div className="text-sm text-green-600 mt-1">
                Rendu: {(amountPaid - total).toLocaleString()} FCFA
              </div>
            )}
          </div>
        )}

        {paymentMethod === 'card' && (
          <div className="mb-4 space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Numéro de transaction *</label>
              <Input
                type="text"
                value={cardTransactionNumber}
                onChange={(e) => setCardTransactionNumber(e.target.value)}
                placeholder="Ex: 123456789"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Terminal (optionnel)</label>
              <Input
                type="text"
                value={cardTerminal}
                onChange={(e) => setCardTerminal(e.target.value)}
                placeholder="Ex: TPE-01"
              />
            </div>
          </div>
        )}

        {paymentMethod === 'check' && (
          <div className="mb-4 space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Numéro de chèque *</label>
              <Input
                type="text"
                value={checkNumber}
                onChange={(e) => setCheckNumber(e.target.value)}
                placeholder="Ex: 1234567"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Banque *</label>
              <Input
                type="text"
                value={checkBank}
                onChange={(e) => setCheckBank(e.target.value)}
                placeholder="Ex: Société Générale"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Date du chèque</label>
              <Input
                type="date"
                value={checkDate}
                onChange={(e) => setCheckDate(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Generate Receipt Option */}
        <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-md mb-4">
          <Checkbox
            id="generateReceipt"
            checked={generateReceiptEnabled}
            onCheckedChange={(checked) => setGenerateReceiptEnabled(checked as boolean)}
          />
          <Label
            htmlFor="generateReceipt"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Générer une quittance de paiement
          </Label>
        </div>

        {/* Pay Button */}
        <Button
          onClick={handlePayment} 
          size="lg" 
          className="w-full"
          disabled={cart.length === 0}
        >
          <Receipt className="h-4 w-4 mr-2" />
          Encaisser
        </Button>
      </div>
    </div>
  );
};

export default POS;

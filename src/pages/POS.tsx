import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { useProducts } from '@/hooks/useProducts';
import { useClients } from '@/hooks/useClients';
import { useInvoices } from '@/hooks/useInvoices';
import { useStockMovements } from '@/hooks/useStockMovements';
import { useCashRegisters } from '@/hooks/useCashRegisters';
import { Product, Client, InvoiceItem } from '@/lib/types';
import { ShoppingCart, Trash2, Plus, Minus, Search, Receipt, CreditCard, DollarSign } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const POS = () => {
  const { products } = useProducts();
  const { clients } = useClients();
  const { createInvoice } = useInvoices();
  const { createMovement } = useStockMovements();
  const { cashRegisters, addTransaction } = useCashRegisters();
  
  const [cart, setCart] = useState<InvoiceItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedRegister, setSelectedRegister] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [amountPaid, setAmountPaid] = useState<number>(0);

  const siteId = 'default';
  const openRegisters = cashRegisters.filter(r => r.status === 'open');

  // Filter products by search query
  const filteredProducts = products.filter(p =>
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.reference.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
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
        const newQuantity = Math.max(0, item.quantity + delta);
        return newQuantity === 0 
          ? null 
          : { ...item, quantity: newQuantity, amount: newQuantity * item.product.price };
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
      const taxRate = item.product.taxRate || 0;
      return sum + (item.amount * taxRate / 100);
    }, 0);
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };

  const handlePayment = () => {
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

    // Create invoice
    const invoice = createInvoice({
      date: new Date().toISOString(),
      client: selectedClient || {
        id: 'walk-in',
        name: 'Client comptoir',
        address: '-',
        phone: '-',
        code: 'COMPTOIR'
      },
      items: cart,
      subtotal,
      tax,
      total,
      notes: `Paiement ${paymentMethod === 'cash' ? 'espèces' : 'carte'}`,
      status: 'paid',
      siteId,
      cashRegisterId: selectedRegister
    });

    // Update stock
    cart.forEach(item => {
      createMovement({
        productId: item.product.id,
        siteId,
        quantity: -item.quantity,
        type: 'sale',
        reference: invoice.number,
        userId: 'current-user'
      });
    });

    // Add transaction to cash register
    addTransaction({
      cashRegisterId: selectedRegister,
      amount: total,
      type: 'sale',
      reference: invoice.number,
      userId: 'current-user',
      notes: `Vente ${paymentMethod}`
    });

    // Clear cart
    setCart([]);
    setAmountPaid(0);
    setSelectedClient(null);

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
          <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            Point de Vente (POS)
          </h1>
          
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
          {filteredProducts.map(product => (
            <Card 
              key={product.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => addToCart(product)}
            >
              <CardContent className="p-4">
                <div className="text-sm font-medium mb-1">{product.reference}</div>
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 border-l bg-muted/10 p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-4">Panier</h2>

        {/* Client Selection */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Client (optionnel)</label>
          <Select 
            value={selectedClient?.id || ''} 
            onValueChange={(value) => setSelectedClient(clients.find(c => c.id === value) || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Client comptoir" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Client comptoir</SelectItem>
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
          <div className="grid grid-cols-2 gap-2">
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
          </div>
        </div>

        {/* Amount Paid (for cash) */}
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

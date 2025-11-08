import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PurchaseOrder, PurchaseOrderItem, Supplier, Product } from '@/lib/types';
import { Trash2, Plus } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useSuppliers } from '@/hooks/useSuppliers';

interface PurchaseOrderFormProps {
  onSubmit: (order: Omit<PurchaseOrder, 'id'>) => void;
  onCancel: () => void;
  initialData?: PurchaseOrder;
}

const PurchaseOrderForm = ({ onSubmit, onCancel, initialData }: PurchaseOrderFormProps) => {
  const { products } = useProducts();
  const { suppliers } = useSuppliers();
  const activeSuppliers = suppliers.filter(s => s.active);

  const [formData, setFormData] = useState({
    number: initialData?.number || `BC${Date.now().toString().slice(-6)}`,
    date: initialData?.date || new Date().toISOString().split('T')[0],
    supplierId: initialData?.supplier.id || '',
    expectedDeliveryDate: initialData?.expectedDeliveryDate || '',
    receivedDate: initialData?.receivedDate || '',
    notes: initialData?.notes || '',
    status: initialData?.status || 'draft' as const,
    siteId: initialData?.siteId || 'site-1',
  });

  const [items, setItems] = useState<PurchaseOrderItem[]>(
    initialData?.items || []
  );

  const addItem = () => {
    if (products.length === 0) return;
    
    const product = products[0];
    const newItem: PurchaseOrderItem = {
      id: Date.now().toString(),
      product,
      quantity: 1,
      unitPrice: product.price,
      amount: product.price,
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, updates: Partial<PurchaseOrderItem>) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates };
        updated.amount = updated.quantity * updated.unitPrice;
        return updated;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateProduct = (itemId: string, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      updateItem(itemId, { 
        product, 
        unitPrice: product.price,
        amount: items.find(i => i.id === itemId)?.quantity || 1 * product.price
      });
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxRate = 0.2; // 20% TVA
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const supplier = suppliers.find(s => s.id === formData.supplierId);
    
    if (!supplier) {
      setError('Veuillez sélectionner un fournisseur');
      return;
    }
    
    if (items.length === 0) {
      setError('Veuillez ajouter au moins un article');
      return;
    }

    if (!formData.number.trim()) {
      setError('Le numéro de commande est requis');
      return;
    }

    onSubmit({
      ...formData,
      supplier,
      items,
      subtotal,
      tax,
      total,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="number">N° Commande</Label>
          <Input
            id="number"
            value={formData.number}
            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Statut</Label>
          <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Brouillon</SelectItem>
              <SelectItem value="sent">Envoyée</SelectItem>
              <SelectItem value="received">Reçue</SelectItem>
              <SelectItem value="cancelled">Annulée</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-3">
          <Label htmlFor="supplier">Fournisseur *</Label>
          <Select value={formData.supplierId} onValueChange={(value) => setFormData({ ...formData, supplierId: value })}>
            <SelectTrigger className={!formData.supplierId && error ? 'border-red-500' : ''}>
              <SelectValue placeholder="Sélectionner un fournisseur" />
            </SelectTrigger>
            <SelectContent>
              {activeSuppliers.length === 0 ? (
                <div className="px-2 py-1 text-sm text-muted-foreground">
                  Aucun fournisseur actif disponible
                </div>
              ) : (
                activeSuppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name} {supplier.code && `(${supplier.code})`}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expectedDeliveryDate">Date livraison prévue</Label>
          <Input
            id="expectedDeliveryDate"
            type="date"
            value={formData.expectedDeliveryDate}
            onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="receivedDate">Date réception</Label>
          <Input
            id="receivedDate"
            type="date"
            value={formData.receivedDate}
            onChange={(e) => setFormData({ ...formData, receivedDate: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Articles</Label>
          <Button type="button" onClick={addItem} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Ajouter
          </Button>
        </div>

        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex gap-2 items-end">
              <div className="flex-1">
                <Label>Produit</Label>
                <Select value={item.product.id} onValueChange={(value) => updateProduct(item.id, value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.reference} - {product.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-24">
                <Label>Quantité</Label>
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="w-32">
                <Label>Prix unitaire</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="w-32">
                <Label>Montant</Label>
                <Input value={item.amount.toFixed(2)} disabled />
              </div>

              <Button type="button" variant="destructive" size="icon" onClick={() => removeItem(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      <div className="border-t pt-4">
        <div className="space-y-2 max-w-xs ml-auto">
          <div className="flex justify-between">
            <span>Sous-total:</span>
            <span>{subtotal.toLocaleString()} FCFA</span>
          </div>
          <div className="flex justify-between">
            <span>TVA ({(taxRate * 100).toFixed(0)}%):</span>
            <span>{tax.toLocaleString()} FCFA</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>{total.toLocaleString()} FCFA</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          {initialData ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  );
};

export default PurchaseOrderForm;

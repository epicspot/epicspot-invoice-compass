import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product, StockMovement } from '@/lib/types';

interface StockMovementFormProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSubmit: (movement: Omit<StockMovement, 'id' | 'date'>) => void;
}

const StockMovementForm: React.FC<StockMovementFormProps> = ({
  isOpen,
  onClose,
  products,
  onSubmit
}) => {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [type, setType] = useState<StockMovement['type']>('purchase');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Replace comma with dot for decimal parsing
    const normalizedQuantity = quantity.replace(',', '.');
    const qty = parseFloat(normalizedQuantity);
    
    if (!productId || !quantity || isNaN(qty) || qty === 0) {
      return;
    }

    const movementQuantity = (type === 'sale' || type === 'transfer') ? -Math.abs(qty) : Math.abs(qty);

    onSubmit({
      productId,
      siteId: 'default',
      quantity: movementQuantity,
      type,
      reference: reference || undefined,
      notes: notes || undefined,
      userId: 'current-user'
    });

    // Reset form
    setProductId('');
    setQuantity('');
    setType('purchase');
    setReference('');
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau mouvement de stock</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="product">Produit *</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Sélectionner un produit" />
              </SelectTrigger>
              <SelectContent>
                {products.map(product => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.reference} - {product.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="type">Type de mouvement *</Label>
            <Select value={type} onValueChange={(value) => setType(value as StockMovement['type'])}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="purchase">Achat / Entrée</SelectItem>
                <SelectItem value="sale">Vente / Sortie</SelectItem>
                <SelectItem value="adjustment">Ajustement</SelectItem>
                <SelectItem value="transfer">Transfert</SelectItem>
                <SelectItem value="return">Retour</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="quantity">
              Quantité * 
              <span className="text-xs text-muted-foreground ml-2">
                ({type === 'sale' || type === 'transfer' ? 'sortie' : 'entrée'})
              </span>
            </Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="mt-1"
              placeholder="0"
              min="0.01"
              step="any"
              required
            />
          </div>

          <div>
            <Label htmlFor="reference">Référence (facture, commande...)</Label>
            <Input
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="mt-1"
              placeholder="Numéro de référence"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1"
              placeholder="Notes additionnelles..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={!productId || !quantity || parseFloat(quantity.replace(',', '.')) === 0 || isNaN(parseFloat(quantity.replace(',', '.')))}>
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StockMovementForm;

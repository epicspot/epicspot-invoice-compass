
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/lib/types';
import { Package } from 'lucide-react';

interface ProductFormProps {
  initialProduct?: Partial<Product>;
  onSubmit: (product: Partial<Product>) => void;
  isLoading?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialProduct,
  onSubmit,
  isLoading = false
}) => {
  const [product, setProduct] = useState<Partial<Product>>(initialProduct || {
    description: '',
    price: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(product);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-5 w-5" />
          {initialProduct ? 'Modifier le produit / service' : 'Nouveau produit / service'}
        </h2>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Chargement...' : initialProduct ? 'Mettre à jour' : 'Enregistrer'}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          {initialProduct && (
            <div>
              <Label htmlFor="reference">Référence</Label>
              <Input
                id="reference"
                value={product.reference || ''}
                disabled
                className="mt-1 bg-muted"
              />
            </div>
          )}

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={product.description || ''}
              onChange={(e) => setProduct({ ...product, description: e.target.value })}
              className="mt-1"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Prix unitaire (FCFA) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={product.price || ''}
                onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) || 0 })}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="taxRate">Taux de taxe (%)</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={product.taxRate || ''}
                onChange={(e) => setProduct({ ...product, taxRate: parseFloat(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minStock">Seuil d'alerte stock</Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                value={product.minStock || ''}
                onChange={(e) => setProduct({ ...product, minStock: parseInt(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="category">Catégorie</Label>
              <Input
                id="category"
                value={product.category || ''}
                onChange={(e) => setProduct({ ...product, category: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default ProductForm;

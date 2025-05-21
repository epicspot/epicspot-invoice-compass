
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/lib/types';
import { Package, ArrowLeft } from 'lucide-react';

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
    reference: '',
    description: '',
    price: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(product);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-5 w-5" />
          {initialProduct?.id ? 'Modifier le produit / service' : 'Nouveau produit / service'}
        </h2>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Chargement...' : initialProduct?.id ? 'Mettre à jour' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label htmlFor="reference">Référence *</Label>
            <Input
              id="reference"
              value={product.reference || ''}
              onChange={(e) => setProduct({ ...product, reference: e.target.value })}
              className="mt-1"
              required
            />
          </div>

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

          <div>
            <Label htmlFor="price">Prix unitaire (FCFA) *</Label>
            <Input
              id="price"
              type="number"
              min="0"
              value={product.price || ''}
              onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) || 0 })}
              className="mt-1"
              required
            />
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default ProductForm;
